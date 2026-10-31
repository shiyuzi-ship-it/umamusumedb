#!/usr/bin/env node
// Download the real game artwork from GameTora's public image assets, convert it to webp and store it in public/img/.
//   characters (one per outfit): chara_stand_{char_id}_{card_id}.png -> /img/characters/{card_id}.webp (384px)
//   support cards:               tex_support_card_{support_id}.png    -> /img/cards/{support_id}.webp  (270x360)
//   skill icons:                 utx_ico_skill_{icon_id}.png          -> /img/skills/{icon_id}.webp    (64px)
// Existing files are never downloaded again, so weekly runs only fetch new ids. After syncing, the data JSON files get
// image_url / icon_url fields pointing at the local files (null when GameTora has no image for an id).
// Run standalone with `node scripts/fetch-images.mjs` (reads public/data/*.json) or via scripts/import-gametora.mjs.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'public/data');
const imgDir = resolve(root, 'public/img');
const BASE = 'https://gametora.com/images/umamusume';
const UA = 'Mozilla/5.0 (umamusumedb image sync)';

const exists = (p) => access(p).then(() => true, () => false);

async function download(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(String(res.status));
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

async function pool(items, worker, size = 8) {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) await worker(items[i++]);
    })
  );
}

async function ensure(dir, name, url, resizeOpts, stats, fallbackUrl) {
  const file = resolve(imgDir, dir, `${name}.webp`);
  if (await exists(file)) return true;
  let buf = await download(url);
  if (!buf && fallbackUrl) buf = await download(fallbackUrl);
  if (!buf) { stats.missing.push(url); return false; }
  await mkdir(dirname(file), { recursive: true });
  await sharp(buf).resize(resizeOpts).webp({ quality: 82 }).toFile(file);
  stats.added++;
  return true;
}

export async function syncImages() {
  const load = async (f) => JSON.parse(await readFile(resolve(dataDir, f), 'utf-8'));
  const characters = await load('characters.json');
  const cards = await load('supportCards.json');
  const skills = await load('skills.json');
  const stats = { added: 0, missing: [] };
  const have = { characters: new Set(), cards: new Set(), skills: new Set() };

  await pool(characters, async (c) => {
    const ok = await ensure('characters', c.card_id, `${BASE}/characters/chara_stand_${c.char_id}_${c.card_id}.png`, { width: 384, height: 384, fit: 'inside' }, stats);
    if (ok) have.characters.add(c.card_id);
  });
  await pool(cards, async (c) => {
    const ok = await ensure('cards', c.support_id, `${BASE}/supports/tex_support_card_${c.support_id}.png`, { width: 270, height: 360, fit: 'inside' }, stats, `${BASE}/supports/support_card_s_${c.support_id}.png`);
    if (ok) have.cards.add(c.support_id);
  });
  const icons = [...new Set(skills.map((s) => s.icon_id).filter(Boolean))];
  await pool(icons, async (id) => {
    const ok = await ensure('skills', id, `${BASE}/skill_icons/utx_ico_skill_${id}.png`, { width: 64, height: 64, fit: 'inside' }, stats);
    if (ok) have.skills.add(id);
  });

  for (const c of characters) { c.image_url = have.characters.has(c.card_id) ? `/img/characters/${c.card_id}.webp` : null; }
  for (const c of cards) { c.image_url = have.cards.has(c.support_id) ? `/img/cards/${c.support_id}.webp` : null; delete c.character_image_url; }
  for (const s of skills) { s.icon_url = have.skills.has(s.icon_id) ? `/img/skills/${s.icon_id}.webp` : null; }
  const w = (f, d) => writeFile(resolve(dataDir, f), JSON.stringify(d, null, 2) + '\n', 'utf-8');
  await w('characters.json', characters);
  await w('supportCards.json', cards);
  await w('skills.json', skills);
  console.log(`[fetch-images] new files: ${stats.added}; characters ${have.characters.size}/${characters.length}, cards ${have.cards.size}/${cards.length}, skill icons ${have.skills.size}/${icons.length}; missing ${stats.missing.length}`);
  if (stats.missing.length) console.log('[fetch-images] no image on GameTora for:', stats.missing.slice(0, 20).join(', '));
  return stats;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await syncImages();
