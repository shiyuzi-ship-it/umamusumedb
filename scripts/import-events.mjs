#!/usr/bin/env node
/**
 * Import training ("story") events — event names, choices and outcomes — from GameTora's public data files.
 *
 *   node scripts/import-events.mjs              # fetch from gametora.com (GT_CACHE=/dir reuses downloads)
 *
 * GameTora publishes these files in a compact form: events are numeric ids, names / choice texts are XOR+base64 strings
 * and rewards are indexes into dict/evrew. This is the exact decoding GameTora's own page script performs in every visitor's
 * browser (key = "k" + a number derived from small constants in that script); nothing here bypasses authentication or
 * access control and each file is downloaded once per run. Data is credited to GameTora on /data-sources/.
 *
 * Only events whose outcomes are fully understood are imported: every reward code must be in SAFE (plain stat / energy /
 * mood / bond / skill-hint / skill / fans rewards and the "or" divider); events with conditions, random alternates, secret
 * conditions, branch warnings, status effects etc. are skipped rather than shown incompletely. The counts are printed.
 *
 * Output: public/data/training-events.json
 *   cards   { support_id: { s: [chain/special], r: [random], d: [dates] } }   card specific events
 *   shared  { char_id: [random events shared by that character's support cards] }
 *   chars   { char_id: { e: [events], o: [outing events] } }                 trainee events (all outfits)
 *   outfits { card_id: [events] }                                            outfit specific trainee events
 *   statuses { status_id: {en, ja, ko, zh_tw, zh} }                          names of status effects used by rewards
 * Event: { n: {en, ja, ko, zh_tw, zh}, c: [{ t?: japanese choice text, r: [[code, value?, detail?], ...] }], k?: type, rep?: 1 }
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as OpenCC from 'opencc-js';

const root = resolve(process.cwd());
const dataDir = resolve(root, 'public/data');
const GT = 'https://gametora.com/data/umamusume';
const UA = { 'user-agent': 'Mozilla/5.0 (umamusumedb data import)' };
const cacheDir = process.env.GT_CACHE ? resolve(process.env.GT_CACHE) : null;
const toCn = OpenCC.Converter({ from: 'tw', to: 'cn' });

async function getJson(key, manifest) {
  const f = cacheDir && resolve(cacheDir, key.replace(/\//g, '_') + '.json');
  if (f && existsSync(f)) return JSON.parse(await readFile(f, 'utf-8'));
  const res = await fetch(`${GT}/${key}.${manifest[key]}.json`, { headers: UA });
  if (!res.ok) throw new Error(`${key} -> ${res.status}`);
  const text = await res.text();
  if (f) { await mkdir(cacheDir, { recursive: true }); await writeFile(f, text); }
  return JSON.parse(text);
}

// --- constants and decoding, mirroring GameTora's page script (training-event-helper) ---
const OFF = { reward: 36, event: 86, choice: 28 };
const KEY = { names: 106, choices: 91 };
const xor = (b64, n) => {
  if (!b64 || !n) return b64 ?? '';
  const buf = Buffer.from(b64, 'base64');
  const k = Buffer.from('k' + String(n));
  return Buffer.from(buf.map((b, i) => b ^ k[i % k.length])).toString('utf8');
};

const SAFE = new Set(['en', 'me', 'sp', 'st', 'po', 'gu', 'in', '5s', 'pt', 'mo', 'sk', 'sg', 'sre', 'bo', 'fa', 'di', 'di_s', 'ee', 'ds', 'ha', 'fe', 'nl', 'hi_s', 'lo_s', 'rs', 'se', 'he']);
const OK_EXTRA = new Set([2, 3, 4, 6, 7, 9, 10]); // 2 card override, 3 meaningless choices, 4 type, 6/7 repeatable, 9 history (older versions), 10 force choices

async function main() {
  const man = await (cacheDir && existsSync(resolve(cacheDir, 'man.json'))
    ? readFile(resolve(cacheDir, 'man.json'), 'utf-8').then(JSON.parse)
    : fetch('https://gametora.com/data/manifests/umamusume.json', { headers: UA }).then((r) => r.json()));
  const J = (k) => getJson(k, man);
  const statusList = await J('status-effects');
  const [ssr, sr, shared, friend, group, char, charCard, evrew, chTexts, nEn, nJa, nKo, nTw] = await Promise.all([
    J('training_events/ssr'), J('training_events/sr'), J('training_events/shared'), J('training_events/friend'), J('training_events/group'),
    J('training_events/char'), J('training_events/char_card'), J('dict/evrew'), J('dict/choice_texts_ja'),
    J('dict/te_names_en'), J('dict/te_names_ja'), J('dict/te_names_ko'), J('dict/te_names_zh_tw'),
  ]);
  const characters = JSON.parse(await readFile(resolve(dataDir, 'characters.json'), 'utf-8'));
  const cards = JSON.parse(await readFile(resolve(dataDir, 'supportCards.json'), 'utf-8'));
  const skills = JSON.parse(await readFile(resolve(dataDir, 'skills.json'), 'utf-8'));
  const skillIds = new Set(skills.map((s) => s.gt_id));
  const charIds = new Set([...characters.map((c) => c.char_id), ...cards.map((c) => c.char_id)]);

  const statusById = new Map(statusList.map((x) => [x.id, { en: x.name_en ?? x.name_jp, ja: x.name_jp, ko: x.name_ko ?? x.name_jp, zh_tw: x.name_tw ?? x.name_jp, zh: toCn(x.name_tw ?? x.name_jp) }]));
  const usedStatuses = new Set();
  const stats = { total: 0, kept: 0, skipped: 0, skipReasons: {} };
  const skip = (why) => { stats.skipped++; stats.skipReasons[why] = (stats.skipReasons[why] ?? 0) + 1; return null; };

  // Decode one event (returns null when it cannot be shown completely and correctly)
  let traineeCtx = false; // bond rewards without a character only make sense on support cards ("this card")
  function decode(e, cardId) {
    stats.total++;
    if (!Array.isArray(e)) return skip('not-array');
    if (e[1] === 'no') return skip('no-choices-data');
    let override = null;
    const extra = {};
    for (const x of e.slice(3)) {
      if (!Array.isArray(x) || !OK_EXTRA.has(x[0])) return skip('extra-' + (x?.[0] ?? '?'));
      if (x[0] === 2) override = (x[1] || []).find((o) => o[0] === cardId)?.[1] ?? null;
      if (x[0] === 4) extra.k = x[1];
      if (x[0] === 6) extra.rep = 1;
      if (x[0] === 7) extra.rep = 2;
    }
    const src = override ?? e;
    if (override) { stats.total--; return decode(override, null) ? finish(decodeCore(override), extra) : null; }
    const ev = decodeCore(src);
    if (!ev) return null;
    return finish(ev, extra);
  }
  function finish(ev, extra) { stats.kept++; return { ...ev, ...extra }; }
  function decodeCore(e) {
    const id = e[0] - OFF.event;
    const n = { en: xor(nEn[id], KEY.names), ja: xor(nJa[id], KEY.names), ko: xor(nKo[id], KEY.names), zh_tw: xor(nTw[id], KEY.names) };
    if (!n.en && !n.ja) return skip('no-name');
    n.en ||= n.ja; n.ko ||= n.ja; n.zh_tw ||= n.ja; n.zh = toCn(n.zh_tw);
    const c = [];
    for (const ch of e[1]) {
      const r = [];
      for (const ri of ch[1]) {
        const rw = evrew[ri - OFF.reward];
        if (!rw || !SAFE.has(rw[0])) return skip('reward-' + (rw?.[0] ?? '?'));
        if (rw[0] === 'nl') continue;
        if (['en', 'me', 'sp', 'st', 'po', 'gu', 'in', '5s', 'pt', 'mo', 'bo', 'rs'].includes(rw[0]) && typeof rw[1] !== 'string') return skip('value-unknown');
        if (rw[0] === 'sk' || rw[0] === 'sg' || rw[0] === 'sre') {
          if (!skillIds.has(rw[2])) return skip('unknown-skill');
        }
        if ((rw[0] === 'se' || rw[0] === 'he') && rw[2] != null) {
          if (!statusById.has(rw[2])) return skip('unknown-status');
          usedStatuses.add(rw[2]);
        }
        if (traineeCtx && rw[0] === 'bo' && rw[2] == null) return skip('trainee-bond-no-char');
        if (rw[0] === 'bo' && rw[2] != null && !charIds.has(rw[2])) return skip('unknown-char');
        r.push(rw.length > 2 ? rw : rw.length > 1 ? rw : rw);
      }
      const t = chTexts[ch[0] - OFF.choice] ? xor(chTexts[ch[0] - OFF.choice], KEY.choices) : '';
      c.push(t ? { t, r } : { r });
    }
    return { n, c };
  }
  const list = (evs, cardId) => (evs || []).map((e) => decode(e, cardId)).filter(Boolean);
  const nonEmpty = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => (Array.isArray(v) ? v.length : v)));

  const out = { generatedAt: new Date().toISOString(), source: 'GameTora (gametora.com/umamusume/training-event-helper data files)', cards: {}, shared: {}, chars: {}, outfits: {}, statuses: {} };

  for (const [cid, evs] of shared) { const l = list(evs); if (l.length) out.shared[cid] = l; }
  const cardById = new Map(cards.map((c) => [c.support_id, c]));
  const ssrMap = new Map(ssr), srMap = new Map(sr);
  const friendMap = new Map(friend.map((f) => [f[0], f]));
  const groupMap = new Map(group.map((g) => [g[0], g]));
  for (const card of cards) {
    const sid = card.support_id;
    let rec = null;
    if (card.type === 'friend') {
      const f = friendMap.get(card.char_id);
      if (f) {
        const s = [], r = [];
        for (const ev of f[2]) { const d = decode(ev, sid); if (d) (d.k ? s : r).push(d); }
        const slots = [['ft', 0], ['at', 1], ['pd', 2], ['fs', 3], ['ff', 4], ['ny', 5]];
        for (const [type, i] of slots) {
          if (!f[1][i]) continue;
          const d = decode(f[1][i], sid);
          if (d) { d.k = type; (type === 'pd' ? r : s).push(d); }
        }
        rec = { s, r, d: list(f[3], sid) };
      }
    } else if (card.type === 'group') {
      const g = groupMap.get(sid);
      if (g) {
        const s = [], r = [];
        for (const cid of g[1]) for (const ev of shared.find((x) => x[0] === cid)?.[1] ?? []) { const d = decode(ev, sid); if (d) r.push(d); }
        for (const ev of g[2]) { const d = decode(ev, sid); if (d) (d.k && d.k !== 'pd' ? s : r).push(d); }
        rec = { s, r, d: list(g[3], sid) };
      }
    } else if (card.rarity === 'SSR' || card.rarity === 'SR') {
      const evs = (card.rarity === 'SSR' ? ssrMap : srMap).get(sid);
      if (evs) rec = { s: list(evs, sid) };
    }
    if (rec) { rec = nonEmpty(rec); if (Object.keys(rec).length) out.cards[sid] = rec; }
  }
  traineeCtx = true;
  for (const c of char) {
    const evs = [], outs = [];
    for (const ev of c[2] ?? []) { const d = decode(ev); if (d) evs.push(d); }
    for (const ev of c[3] ?? []) { const d = decode(ev); if (d) outs.push(d); }
    const rec = nonEmpty({ e: evs, o: outs });
    if (Object.keys(rec).length) out.chars[c[0] * 1] = rec;
    // c[4] = secret events: every one needs conditions we do not import
    stats.total += (c[4] ?? []).length; stats.skipped += (c[4] ?? []).length; stats.skipReasons.secret = (stats.skipReasons.secret ?? 0) + (c[4] ?? []).length;
  }
  for (const [cardId, evs] of charCard) { const l = list(evs); if (l.length) out.outfits[cardId] = l; }

  for (const id of usedStatuses) out.statuses[id] = statusById.get(id);
  // character ids in GameTora's char file are 4 digits (e.g. 1001) = char_id
  await writeFile(resolve(dataDir, 'training-events.json'), JSON.stringify(out));
  const n = (o) => Object.values(o).reduce((a, v) => a + (Array.isArray(v) ? v.length : Object.values(v).reduce((b, x) => b + x.length, 0)), 0);
  console.log('[events]', JSON.stringify(stats));
  console.log('[events] support cards with events:', Object.keys(out.cards).length, '/', cards.length, '| shared chars:', Object.keys(out.shared).length,
    '| trainee chars:', Object.keys(out.chars).length, '| outfits:', Object.keys(out.outfits).length,
    '| events written:', n(out.cards) + n(out.shared) + n(out.chars) + n(out.outfits));
}
main().catch((e) => { console.error(e); process.exit(1); });
