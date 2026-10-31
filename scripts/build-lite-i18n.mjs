#!/usr/bin/env node
/**
 * Localized slim data for the client-side tools (Skill Builder, Support Deck Builder):
 *   public/data/skills-lite.<loc>.json, public/data/support-cards-lite.<loc>.json   (loc = ja, zh, zh-tw, ko)
 * Same shape as the English files plus `name` (localized display name); skill `effect` is the localized description.
 * Built from the already imported skills.json / supportCards.json (official names; zh = OpenCC of the Taiwan text).
 * Run automatically by `npm run build`; also safe to run by hand after scripts/import-gametora.mjs.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { skillName, skillDesc, cardName } from '../src/lib/localized.js';

const dir = resolve(process.cwd(), 'public/data');
const read = async (f) => JSON.parse(await readFile(resolve(dir, f), 'utf-8'));
const skills = await read('skills.json');
const bySkill = new Map(skills.map((s) => [s.id, s]));
const cards = await read('supportCards.json');
const byCard = new Map(cards.map((c) => [c.id, c]));
const skillsLite = await read('skills-lite.json');
const cardsLite = await read('support-cards-lite.json');

for (const loc of ['ja', 'zh', 'zh-tw', 'ko']) {
  const s = skillsLite.map((x) => {
    const full = bySkill.get(x.id);
    return full ? { ...x, name: skillName(full, loc), effect: skillDesc(full, loc) || x.effect } : x;
  });
  const c = cardsLite.map((x) => {
    const full = byCard.get(x.id);
    return full ? { ...x, name: cardName(full, loc) } : x;
  });
  await writeFile(resolve(dir, `skills-lite.${loc}.json`), JSON.stringify(s) + '\n');
  await writeFile(resolve(dir, `support-cards-lite.${loc}.json`), JSON.stringify(c) + '\n');
}
console.log('[lite-i18n] wrote localized skills-lite / support-cards-lite for ja, zh, zh-tw, ko');
