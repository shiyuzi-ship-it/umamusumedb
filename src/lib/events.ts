// Training ("story") events: names, choices and outcomes imported from GameTora (see scripts/import-events.mjs).
// Reward phrases are GameTora's own localized wording (src/lib/event-phrases.json: en / ja / ko / zh_tw); zh is the
// Traditional text converted with OpenCC, like the rest of the site.
import * as OpenCC from 'opencc-js';
import eventData from '../../public/data/training-events.json';
import phrasesRaw from './event-phrases.json';
import { skills, supportCards, characters } from './static-content';
import type { Locale } from './i18n';
import { skillName, cardCharName, charBaseName } from './localized.js';

const toCn = OpenCC.Converter({ from: 'tw', to: 'cn' });
type Phr = { reward: Record<string, string>; choice: Record<string, string>; event_type: Record<string, string> };
const raw = phrasesRaw as unknown as Record<string, Phr>;
const cnObj = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toCn(v)]));
const PH: Record<Locale, Phr> = {
  en: raw.en, ja: raw.ja, ko: raw.ko, 'zh-tw': raw.zh_tw,
  zh: { reward: cnObj(raw.zh_tw.reward), choice: cnObj(raw.zh_tw.choice), event_type: cnObj(raw.zh_tw.event_type) },
};
const NAMEKEY: Record<Locale, 'en' | 'ja' | 'ko' | 'zh_tw' | 'zh'> = { en: 'en', ja: 'ja', ko: 'ko', 'zh-tw': 'zh_tw', zh: 'zh' };

export type Ev = { n: Record<string, string>; c: { t?: string; r: any[] }[]; k?: string; rep?: number };
const D = eventData as any;

const skillByGt = new Map<number, any>(skills.map((s: any) => [s.gt_id, s]));
const charNameById = new Map<number, { char?: any; card?: any }>();
for (const c of characters as any[]) if (!charNameById.has(c.char_id)) charNameById.set(c.char_id, { char: c });
for (const c of supportCards as any[]) if (!charNameById.has(c.char_id)) charNameById.set(c.char_id, { card: c });

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
export type Item = { text: string; href?: string };
export type Group = Item[];

const STAT: Record<string, string> = { en: 'energy', me: 'max_energy', sp: 'speed', st: 'stamina', po: 'power', gu: 'guts', in: 'wisdom', '5s': 'all_stats', pt: 'skill_points', mo: 'mood', fa: 'fans', hi_s: 'high_stat', lo_s: 'low_stat' };

/** Reward list -> groups of items (groups are alternative outcomes separated by "or"). */
export function rewardGroups(choice: { r: any[] }, loc: Locale, hrefFor: (skillId: string) => string, cardCharId?: number): Group[] {
  const P = PH[loc].reward;
  const groups: Group[] = [[]];
  for (const rw of choice.r) {
    const [code, value, d] = rw;
    const cur = groups[groups.length - 1];
    if (code === 'di') { groups.push([]); continue; }
    if (STAT[code]) cur.push({ text: fill(P[STAT[code]], { value }) });
    else if (code === 'rs') cur.push({ text: fill(P.random_stats, { value, statAmount: d }) });
    else if (code === 'sk' || code === 'sg' || code === 'sre') {
      const s = skillByGt.get(d);
      const nm = s ? skillName(s, loc) : '';
      if (!nm) continue;
      const key = code === 'sk' ? 'skill_hint' : code === 'sg' ? 'obtain_skill' : 'lose_skill';
      cur.push({ text: fill(P[key], { skillName: nm, value }), href: s ? hrefFor(s.id) : undefined });
    } else if (code === 'bo') {
      const id = d ?? cardCharId;
      const e = charNameById.get(id as number);
      const nm = e?.char ? charBaseName(e.char, loc) : e?.card ? cardCharName(e.card, loc) : '';
      if (nm) cur.push({ text: fill(P.bond, { charName: nm, value }) });
    } else if (code === 'se') cur.push({ text: fill(P.obtain_status_effect, { statusName: D.statuses[d]?.[NAMEKEY[loc]] ?? '' }) });
    else if (code === 'he') cur.push({ text: d != null ? fill(P.heal_status_concrete, { statusName: D.statuses[d]?.[NAMEKEY[loc]] ?? '' }) : P.heal_status_one });
    else if (code === 'ee') cur.push({ text: P.event_chain_ended });
    else if (code === 'ds') cur.push({ text: P.can_start_dating });
    else if (code === 'ha') cur.push({ text: P.heal_status_all });
    else if (code === 'fe') cur.push({ text: P.full_energy });
  }
  return groups.filter((g) => g.length);
}

export const orLabel = (loc: Locale) => PH[loc].reward.random_outcome_or;
export const eventName = (e: Ev, loc: Locale) => e.n[NAMEKEY[loc]] ?? e.n.en;
export const eventAltName = (e: Ev, loc: Locale) => (loc === 'en' ? e.n.ja : e.n.en);
export const eventType = (e: Ev, loc: Locale) => (e.k ? PH[loc].event_type[e.k] ?? '' : '');

export function choiceLabel(e: Ev, i: number, loc: Locale): string {
  const n = e.c.length;
  if (n <= 1) return '';
  const ch = e.c[i];
  if (loc === 'ja' && ch.t) return ch.t;
  const P = PH[loc].choice;
  if (n === 2) return i === 0 ? P.top_option : P.bottom_option;
  if (n === 3) return [P.top_option, P.middle_option, P.bottom_option][i];
  return fill(P.option_number, { number: i + 1 });
}

export interface EventBlock { heading: string; events: Ev[] }
export const cardEvents = (card: any) => {
  const rec = D.cards[card.support_id] ?? {};
  const shared: Ev[] = card.type === 'friend' || card.type === 'group' ? [] : D.shared[card.char_id] ?? [];
  return { chain: (rec.s ?? []) as Ev[], random: [...(rec.r ?? []), ...shared] as Ev[], dates: (rec.d ?? []) as Ev[] };
};
export const charEvents = (ch: any) => {
  const rec = D.chars[ch.char_id] ?? {};
  return { events: (rec.e ?? []) as Ev[], outings: (rec.o ?? []) as Ev[], outfit: (D.outfits[ch.card_id] ?? []) as Ev[] };
};

import { t } from './ui-strings';
export const cardBlocks = (card: any, loc: Locale) => {
  const e = cardEvents(card);
  return [{ heading: t(loc, 'eventsChain'), events: e.chain }, { heading: t(loc, 'eventsRandom'), events: e.random }, { heading: t(loc, 'eventsDates'), events: e.dates }];
};
export const charBlocks = (ch: any, loc: Locale) => {
  const e = charEvents(ch);
  return [{ heading: t(loc, 'eventsOutfit'), events: e.outfit }, { heading: t(loc, 'eventsTrainee'), events: e.events }, { heading: t(loc, 'eventsOuting'), events: e.outings }];
};
