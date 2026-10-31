#!/usr/bin/env node
/**
 * Import Uma Musume game data (characters / support cards / skills / scenarios) from
 * GameTora's public JSON data files and convert it to the schema used by this site.
 *
 *   node scripts/import-gametora.mjs            # fetch from gametora.com
 *   GT_CACHE=/path/to/dir node scripts/import-gametora.mjs   # reuse previously downloaded files
 *
 * Outputs (public/data):
 *   characters.json, supportCards.json, skills.json, scenarios.json, releases.json
 * Also writes data/legacy-id-map.json (old site ids -> new ids) used for 301 redirects.
 *
 * Release dates: `release` = Japanese server, `release_en` = Global server (null if not released there yet).
 * The old hand-written sample data is replaced; only ids that can be matched with real cards are kept
 * (so existing URLs and image links keep working).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dataDir = resolve(root, 'public', 'data');
const GT = 'https://gametora.com/data/umamusume';
const cacheDir = process.env.GT_CACHE ? resolve(process.env.GT_CACHE) : null;

async function getJson(key, manifest) {
  if (cacheDir) {
    const f = resolve(cacheDir, key.replace(/\//g, '_') + '.json');
    if (existsSync(f)) return JSON.parse(await readFile(f, 'utf-8'));
  }
  const url = `${GT}/${key}.${manifest[key]}.json`;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (umamusumedb data import)' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const data = await res.json();
  if (cacheDir) {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(resolve(cacheDir, key.replace(/\//g, '_') + '.json'), JSON.stringify(data));
  }
  return data;
}

async function getManifest() {
  if (cacheDir && existsSync(resolve(cacheDir, 'man.json'))) return JSON.parse(await readFile(resolve(cacheDir, 'man.json'), 'utf-8'));
  const res = await fetch('https://gametora.com/data/manifests/umamusume.json', { headers: { 'user-agent': 'Mozilla/5.0 (umamusumedb data import)' } });
  if (!res.ok) throw new Error('manifest ' + res.status);
  return res.json();
}

const slug = (s) =>
  String(s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const stripBr = (t) => String(t ?? '').replace(/^\[|\]$/g, '').trim();
const APT = ['turf', 'dirt', 'sprint', 'mile', 'medium', 'long', 'escape', 'lead', 'between', 'chase'];
const STATS = ['speed', 'stamina', 'power', 'guts', 'wisdom'];
const toObj = (keys, arr) => Object.fromEntries(keys.map((k, i) => [k, arr[i]]));

// ---- support card effect interpolation (same rule GameTora uses: columns = lv1,5,10,...,50) ----
function effectAtLevels(row) {
  const a = row.slice(1);
  const n = new Array(51);
  let unlock = -1, last = -1, lastIdx = -1;
  for (let e = 0; e < a.length; e++) {
    if (a[e] === -1 && last === -1) {
      for (let k = 5 * e; k < (e + 1) * 5 - 1; k++) n[k] = 0;
      continue;
    }
    if (a[e] !== -1 && unlock === -1) {
      unlock = e > 0 ? 5 * e : 1;
      n[5 * e] = a[e]; last = a[e]; lastIdx = e;
      continue;
    }
    if (a[e] === -1) continue;
    const step = lastIdx === 0 ? (a[e] - last) / (5 * e - 5 * lastIdx - 1) : (a[e] - last) / (5 * e - 5 * lastIdx);
    let c = last;
    for (let k = 5 * lastIdx + 1; k < 5 * e; k++) {
      if (k === 1) { n[k] = last; k = 2; }
      c += step;
      n[k] = Math.floor(Number(c.toFixed(10)));
    }
    n[5 * e] = a[e]; last = a[e]; lastIdx = e;
  }
  let prev = 0;
  for (let i = 0; i < 51; i++) { if (n[i] == null) n[i] = prev; else prev = n[i]; }
  return n;
}

const EFFECT_KEYS = {
  1: 'friendship_bonus', 2: 'motivation_bonus', 3: 'speed_bonus', 4: 'stamina_bonus', 5: 'power_bonus', 6: 'guts_bonus', 7: 'wisdom_bonus',
  8: 'training_bonus', 9: 'initial_speed', 10: 'initial_stamina', 11: 'initial_power', 12: 'initial_guts', 13: 'initial_wisdom',
  14: 'initial_bond', 15: 'race_bonus', 16: 'fan_bonus', 17: 'hint_levels', 18: 'hint_frequency', 19: 'specialty_priority',
  20: 'max_speed', 21: 'max_stamina', 22: 'max_power', 23: 'max_guts', 24: 'max_wisdom', 25: 'event_recovery', 26: 'event_effectiveness',
  27: 'failure_protection', 28: 'energy_cost_reduction', 29: 'minigame_effectiveness', 30: 'skill_point_bonus', 31: 'wisdom_friendship_recovery',
};
const MAX_LEVEL = { 3: 50, 2: 45, 1: 40 };
const SHOW_LEVELS = [1, 25, 30, 35, 40, 45, 50];

function buildEffects(card, effectDefs) {
  const maxLv = MAX_LEVEL[card.rarity] ?? 50;
  const levels = SHOW_LEVELS.filter((l) => l <= maxLv);
  if (!levels.includes(maxLv)) levels.push(maxLv);
  const out = {};
  for (const row of card.effects ?? []) {
    const key = EFFECT_KEYS[row[0]];
    if (!key) continue;
    const arr = effectAtLevels(row);
    const def = effectDefs.find((d) => d.id === row[0]);
    const map = {};
    for (const lv of levels) {
      let v = arr[lv];
      const u = card.unique;
      if (u && u.level <= lv) {
        const ue = (u.effects ?? []).find((x) => x.type === row[0]);
        if (ue) v = def?.calc === 'mult' ? (v * ue.value) / 100 + v + ue.value : v + ue.value;
      }
      map[`lv${lv}`] = Math.floor(v * 100) / 100;
    }
    out[key] = map;
  }
  // unique effects that have no base row
  if (card.unique) {
    for (const ue of card.unique.effects ?? []) {
      const key = EFFECT_KEYS[ue.type];
      if (!key || out[key]) continue;
      const map = {};
      for (const lv of levels) map[`lv${lv}`] = card.unique.level <= lv ? ue.value : 0;
      out[key] = map;
    }
  }
  // display order: the most useful effects first
  const ORDER = ['friendship_bonus', 'training_bonus', 'motivation_bonus', 'initial_bond', 'specialty_priority', 'speed_bonus', 'stamina_bonus', 'power_bonus', 'guts_bonus', 'wisdom_bonus', 'skill_point_bonus', 'race_bonus', 'fan_bonus', 'hint_levels', 'hint_frequency'];
  const rank = (k) => { const i = ORDER.indexOf(k); return i === -1 ? 100 : i; };
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => rank(a) - rank(b)));
}

async function main() {
  const manifest = await getManifest();
  const [cards, supports, skills, chars, effectDefs, scenarios] = await Promise.all([
    getJson('character-cards', manifest),
    getJson('support-cards', manifest),
    getJson('skills', manifest),
    getJson('characters', manifest),
    getJson('support_effects', manifest),
    getJson('scenarios', manifest),
  ]);

  // ---------- skills ----------
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const skillName = (s) => s.name_en ?? s.enname ?? s.jpname ?? String(s.id);
  const skillNameJp = (s) => s.jpname ?? null;
  const skillDesc = (s) => s.desc_en ?? s.endesc ?? '';
  const nameOf = (id) => { const s = skillById.get(id); return s ? skillName(s) : null; };

  const PHASE = { l_0: 'start', l_1: 'middle', l_2: 'late', l_3: 'final' };
  const DIST = { sho: 'sprint', mil: 'mile', med: 'medium', lng: 'long' };
  const STYLE = { run: 'escape', ldr: 'lead', btw: 'between', cha: 'chase' };
  function effectTypeOf(desc, tags) {
    const d = (desc || '').toLowerCase();
    if (tags.includes('dbf')) return 'debuff';
    if (/recover(s|y)? (a )?(stamina|energy)|recovers stamina|restore/.test(d) || /stamina.*recover/.test(d)) return 'recovery';
    if (/acceleration/.test(d)) return 'acceleration';
    if (/(lane|maneuver|move.*lane|move.*outside|slip)/.test(d)) return 'positioning';
    if (/(velocity|speed)/.test(d)) return 'speed';
    if (/(speed|stamina|power|guts|wit)\s+(stat|is increased)/.test(d) || /performance|aptitude|stat/.test(d)) return 'stats';
    return 'other';
  }
  const rarityLabel = { 1: 'normal', 2: 'gold', 3: 'unique', 4: 'unique', 5: 'unique', 6: 'evolved' };
  const skillOut = skills.map((s) => {
    const name = skillName(s);
    const tags = s.type ?? [];
    const desc = skillDesc(s);
    const cond = s.condition_groups?.[0]?.condition || '';
    const phases = tags.filter((t) => PHASE[t]).map((t) => PHASE[t]);
    return {
      id: `${slug(name) || 'skill'}_${s.id}`,
      gt_id: s.id,
      name_en: name,
      name_jp: skillNameJp(s) ?? name,
      description_en: desc,
      description_jp: s.jpdesc ?? '',
      effect: desc,
      trigger_condition: '',
      duration: s.condition_groups?.[0]?.base_time > 0 ? `${(s.condition_groups[0].base_time / 10000).toFixed(1)}s (base, scales with course length)` : '',
      cooldown: s.condition_groups?.[0]?.cd > 0 ? `${(s.condition_groups[0].cd / 10000).toFixed(0)}s (base)` : '',
      activation_rate: '',
      skill_type: s.rarity >= 3 && s.rarity <= 5 ? 'unique' : s.rarity === 6 ? 'evolved' : 'common',
      rarity: rarityLabel[s.rarity] ?? 'normal',
      cost: s.cost ?? null,
      phase: phases[0] ?? 'other',
      phases,
      distance: tags.map((t) => DIST[t]).find(Boolean) ?? 'all',
      style: tags.map((t) => STYLE[t]).find(Boolean) ?? 'all',
      location: tags.includes('cor') ? 'corner' : tags.includes('str') ? 'straight' : tags.includes('slo') ? 'slope' : 'any',
      effect_type: effectTypeOf(desc, tags),
      server: s.unreleased ? 'jp' : 'global',
      icon_url: '',
    };
  });
  const skillIdOut = new Map(skills.map((s, i) => [s.id, skillOut[i].id]));

  // ---------- characters ----------
  const charById = new Map(chars.map((c) => [c.char_id, c]));
  const used = new Set();
  const uniq = (id) => { let x = id, i = 2; while (used.has(x)) x = `${id}_${i++}`; used.add(x); return x; };
  const charOut = [];
  const cardSiteId = new Map();
  for (const c of cards.slice().sort((a, b) => a.card_id - b.card_id)) {
    const ch = charById.get(c.char_id);
    const titleEn = c.title_en_gl ? stripBr(c.title_en_gl) : null;
    const id = uniq(`${slug(c.name_en)}_${titleEn ? slug(titleEn) : c.card_id}`);
    cardSiteId.set(c.card_id, id);
    const global = Boolean(c.release_en);
    const awakening = (global ? c.skills_awakening_en ?? c.skills_awakening : c.skills_awakening) ?? [];
    const uniqueSkill = skillById.get((c.skills_unique ?? [])[0]);
    charOut.push({
      id,
      card_id: c.card_id,
      char_id: c.char_id,
      name_en: titleEn ? `${c.name_en} (${titleEn})` : c.title_jp ? `${c.name_en} (${stripBr(c.title_jp)})` : c.name_en,
      name_jp: `${c.name_jp}${c.title_jp ? `（${stripBr(c.title_jp)}）` : ''}`,
      base_name_en: c.name_en,
      title_en: titleEn,
      title_jp: c.title_jp ? stripBr(c.title_jp) : null,
      rarity: c.rarity,
      initial_stats: JSON.stringify(toObj(STATS, c.base_stats)),
      initial_stats_4star: JSON.stringify(toObj(STATS, c.four_star_stats)),
      initial_stats_5star: JSON.stringify(toObj(STATS, c.five_star_stats)),
      max_stats: JSON.stringify({ speed: 1200, stamina: 1200, power: 1200, guts: 1200, wisdom: 1200 }),
      growth_rates: JSON.stringify(toObj(STATS, c.stat_bonus.map((v) => `${v}%`))),
      aptitudes: JSON.stringify(toObj(APT, c.aptitude)),
      unique_skill: JSON.stringify(
        uniqueSkill
          ? { name_en: skillName(uniqueSkill), name_jp: skillNameJp(uniqueSkill) ?? '', effect: skillDesc(uniqueSkill) }
          : null
      ),
      awakening_skills: JSON.stringify(awakening.map(nameOf).filter(Boolean)),
      innate_skills: JSON.stringify((c.skills_innate ?? []).map(nameOf).filter(Boolean)),
      birthday: ch && ch.birth_month ? `${['January','February','March','April','May','June','July','August','September','October','November','December'][ch.birth_month - 1]} ${ch.birth_day}` : null,
      cv: ch?.va_en ?? null,
      height_cm: ch?.height ?? null,
      server: global ? 'global' : 'jp',
      release_date_jp: c.release ?? null,
      release_date_global: c.release_en ?? null,
      obtained: c.obtained ?? null,
      gt_url_name: c.url_name,
    });
  }

  // ---------- support cards ----------
  const supOut = [];
  const supSiteId = new Map();
  for (const s of supports.slice().sort((a, b) => a.support_id - b.support_id)) {
    const rar = { 1: 'R', 2: 'SR', 3: 'SSR' }[s.rarity];
    const titleEn = s.title_en ? s.title_en : null;
    const id = uniq(`${slug(s.char_name)}_${titleEn ? slug(stripBr(titleEn)) : s.support_id}_${rar.toLowerCase()}`);
    supSiteId.set(s.support_id, id);
    const type = s.type === 'intelligence' ? 'wisdom' : s.type;
    const global = Boolean(s.release_en);
    const jpTitle = s.title_ja ?? '';
    const hintNames = (s.hints?.hint_skills ?? []).map(nameOf).filter(Boolean);
    const evNames = (s.event_skills ?? []).map(nameOf).filter(Boolean);
    supOut.push({
      id,
      support_id: s.support_id,
      char_id: s.char_id,
      name_en: `${s.char_name} ${titleEn ?? jpTitle}`.trim(),
      name_jp: `${s.name_jp}${jpTitle}`,
      character: s.char_name,
      title_en: titleEn ? stripBr(titleEn) : null,
      title_jp: jpTitle ? stripBr(jpTitle) : null,
      type,
      rarity: rar,
      max_level: MAX_LEVEL[s.rarity],
      effects: JSON.stringify(buildEffects(s, effectDefs)),
      skills: JSON.stringify([...new Set([...evNames, ...hintNames])]),
      hint_skills: JSON.stringify(hintNames),
      event_skills: JSON.stringify(evNames),
      events: '[]',
      server: global ? 'global' : 'jp',
      release_date: s.release_en ?? s.release ?? null,
      release_date_jp: s.release ?? null,
      release_date_global: s.release_en ?? null,
      obtained: s.obtained ?? null,
      gt_url_name: s.url_name,
    });
  }

  // ---------- legacy id mapping (old hand-written sample ids -> real cards; used for 301 redirects) ----------
  const oldChars = JSON.parse(await readFile(resolve(dataDir, 'characters.json'), 'utf-8'));
  const oldSup = JSON.parse(await readFile(resolve(dataDir, 'supportCards.json'), 'utf-8'));
  const oldSkills = JSON.parse(await readFile(resolve(dataDir, 'skills.json'), 'utf-8'));
  const alreadyImported = Boolean(oldChars[0]?.card_id);
  const legacyFile = resolve(root, 'data', 'legacy-id-map.json');
  let legacy = { characters: {}, supportCards: {}, skills: {}, removed: { characters: [], supportCards: [], skills: [] } };
  if (alreadyImported) {
    // data was imported before: reuse the stored legacy map instead of re-deriving it from the new data
    legacy = JSON.parse(await readFile(legacyFile, 'utf-8'));
  }
  const firstCardOfChar = new Map();
  for (const c of cards.slice().sort((a, b) => a.card_id - b.card_id)) if (!firstCardOfChar.has(c.name_jp)) firstCardOfChar.set(c.name_jp, c);
  const portraitByJpName = new Map();
  for (const o of alreadyImported ? [] : oldChars) {
    const base = o.name_jp.replace(/（.*）$/, '');
    const first = firstCardOfChar.get(base);
    if (first) {
      legacy.characters[o.id] = cardSiteId.get(first.card_id);
      if (o.image_url && !portraitByJpName.has(base)) portraitByJpName.set(base, { url: o.image_url, char_id: first.char_id });
    } else legacy.removed.characters.push(o.id);
  }
  const normT = (t) => String(t).replace(/[【\[]/g, '[').replace(/[】\]]/g, ']');
  for (const o of alreadyImported ? [] : oldSup) {
    const pick = supports.find((s) => normT(o.name_jp) === normT(`${s.name_jp}${s.title_ja ?? ''}`));
    if (pick) legacy.supportCards[o.id] = supSiteId.get(pick.support_id);
    else legacy.removed.supportCards.push(o.id);
  }
  const byName = new Map();
  for (const s of skills) for (const n of [s.name_en, s.enname]) if (n) byName.set(n.toLowerCase(), s);
  for (const o of alreadyImported ? [] : oldSkills) {
    const pick = byName.get(o.name_en.toLowerCase());
    if (pick) legacy.skills[o.id] = skillIdOut.get(pick.id);
    else legacy.removed.skills.push(o.id);
  }

  // Images: the old site only has one portrait per character (nothing outfit-specific), so reuse that portrait for the
  // character's cards. The old support-card images were generated placeholders with invented titles -> dropped.
  const portraitByCharId = alreadyImported
    ? new Map(oldChars.filter((c) => c.image_url).map((c) => [c.char_id, c.image_url]))
    : new Map([...portraitByJpName.values()].map((v) => [v.char_id, v.url]));
  for (const rec of charOut) if (portraitByCharId.has(rec.char_id)) rec.image_url = portraitByCharId.get(rec.char_id);
  for (const rec of supOut) if (portraitByCharId.has(rec.char_id)) rec.character_image_url = portraitByCharId.get(rec.char_id);

  // ---------- scenarios + release timeline ----------
  const iso = (t) => (t ? new Date(t * 1000).toISOString().slice(0, 10) : null);
  const scenOut = scenarios.map((s) => ({
    id: s.id,
    name_en: s.name_en,
    name_en_full: s.name_en_full ?? null,
    name_jp: s.name_ja,
    start_jp: iso(s.start_ja),
    start_global: iso(s.start_en),
    linked_characters: (s.scenario_linked_characters ?? []).map((c) => c.name_en),
  }));
  const releases = [];
  for (const c of charOut) {
    if (c.release_date_jp) releases.push({ date: c.release_date_jp, server: 'jp', kind: 'character', id: c.id, name_en: c.name_en, name_jp: c.name_jp, rarity: c.rarity });
    if (c.release_date_global) releases.push({ date: c.release_date_global, server: 'global', kind: 'character', id: c.id, name_en: c.name_en, name_jp: c.name_jp, rarity: c.rarity });
  }
  for (const c of supOut) {
    if (c.release_date_jp) releases.push({ date: c.release_date_jp, server: 'jp', kind: 'support', id: c.id, name_en: c.name_en, name_jp: c.name_jp, rarity: c.rarity, type: c.type });
    if (c.release_date_global) releases.push({ date: c.release_date_global, server: 'global', kind: 'support', id: c.id, name_en: c.name_en, name_jp: c.name_jp, rarity: c.rarity, type: c.type });
  }
  releases.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // slim skill list for the client-side Skill Builder (purchasable skills + unique/evolved info)
  const lite = skillOut
    .filter((sk) => sk.cost || sk.rarity === 'unique')
    .map((sk) => ({
      id: sk.id, name_en: sk.name_en, name_jp: sk.name_jp, rarity: sk.rarity, skill_type: sk.skill_type, cost: sk.cost,
      effect: sk.effect, phases: sk.phases, distance: sk.distance, style: sk.style, location: sk.location,
      effect_type: sk.effect_type, server: sk.server,
    }));

  // slim support card list for the client-side Support Deck Builder (values at the card's max level only)
  const supLite = supOut.map((c) => {
    const effects = JSON.parse(c.effects);
    const slimEffects = Object.fromEntries(
      Object.entries(effects).map(([k, v]) => [k, { [`lv${c.max_level}`]: v[`lv${c.max_level}`] }])
    );
    return {
      id: c.id, name_en: c.name_en, name_jp: c.name_jp, type: c.type, rarity: c.rarity, max_level: c.max_level,
      server: c.server, effects: slimEffects, skills: JSON.parse(c.skills).slice(0, 6), character_image_url: c.character_image_url ?? null,
    };
  });

  const write = (f, d) => writeFile(resolve(dataDir, f), JSON.stringify(d, null, 2) + '\n', 'utf-8');
  await write('characters.json', charOut);
  await write('supportCards.json', supOut);
  await write('skills.json', skillOut);
  await writeFile(resolve(dataDir, 'skills-lite.json'), JSON.stringify(lite) + '\n', 'utf-8');
  await writeFile(resolve(dataDir, 'support-cards-lite.json'), JSON.stringify(supLite) + '\n', 'utf-8');
  await write('scenarios.json', scenOut);
  await write('releases.json', { generatedAt: new Date().toISOString(), source: 'GameTora data files (gametora.com)', releases });
  await mkdir(resolve(root, 'data'), { recursive: true });
  await writeFile(resolve(root, 'data', 'legacy-id-map.json'), JSON.stringify(legacy, null, 2) + '\n');
  console.log(`[import-gametora] characters=${charOut.length} supportCards=${supOut.length} skills=${skillOut.length} scenarios=${scenOut.length} releases=${releases.length}`);
  console.log(`[import-gametora] legacy kept: chars ${Object.keys(legacy.characters).length}/${oldChars.length}, cards ${Object.keys(legacy.supportCards).length}/${oldSup.length}, skills ${Object.keys(legacy.skills).length}/${oldSkills.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
