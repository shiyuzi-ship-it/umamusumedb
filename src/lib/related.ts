// Cross references between characters, support cards and skills (server-side, used for internal linking on every locale).
import { characters, supportCards, skills } from './static-content';
import { skillClass } from './skill-class';

type Char = (typeof characters)[number];
type Card = (typeof supportCards)[number];
type SkillRec = (typeof skills)[number];

const norm = (s: string) => String(s ?? '').trim().toLowerCase();

/** English / Japanese name -> skill. Base (non-evolved) skills win over evolved variants with the same name. */
const skillIndex = new Map<string, SkillRec>();
for (const s of [...skills].sort((a, b) => Number(a.rarity === 'evolved') - Number(b.rarity === 'evolved'))) {
  for (const n of [s.name_en, s.name_jp]) {
    const k = norm(n as string);
    if (k && !skillIndex.has(k)) skillIndex.set(k, s);
  }
}
export function findSkill(name: string | undefined | null): SkillRec | null {
  return name ? skillIndex.get(norm(name)) ?? null : null;
}

export const charactersById = new Map<string, Char>(characters.map((c) => [c.id, c]));
export const cardsById = new Map<string, Card>(supportCards.map((c) => [c.id, c]));

/** Outfits of the same umamusume (same char_id), excluding the given one. */
export function otherOutfits(c: Char): Char[] {
  return characters.filter((o) => o.char_id === c.char_id && o.id !== c.id);
}
/** Support cards of the same umamusume. */
export function cardsOfCharacter(charId: number | string): Card[] {
  return supportCards.filter((c) => String(c.char_id) === String(charId));
}
export function otherCardsOfCharacter(card: Card): Card[] {
  return supportCards.filter((c) => c.char_id === card.char_id && c.id !== card.id);
}
export function characterOfCard(card: Card): Char | null {
  return characters.find((c) => c.char_id === card.char_id) ?? null;
}

interface Holders { chars: Char[]; cards: Card[] }
const holders = new Map<string, Holders>();
const entry = (id: string) => {
  let h = holders.get(id);
  if (!h) holders.set(id, (h = { chars: [], cards: [] }));
  return h;
};
for (const c of characters) {
  const names = [...(c.awakening_skills ?? []), ...(c.innate_skills ?? []), (c.unique_skill as any)?.name_en, (c.unique_skill as any)?.name_jp];
  const seen = new Set<string>();
  for (const n of names) {
    const s = findSkill(n);
    if (s && !seen.has(s.id)) { seen.add(s.id); entry(s.id).chars.push(c); }
  }
}
for (const c of supportCards) {
  const seen = new Set<string>();
  for (const n of [...(c.hint_skills ?? []), ...(c.event_skills ?? [])]) {
    const s = findSkill(n);
    if (s && !seen.has(s.id)) { seen.add(s.id); entry(s.id).cards.push(c); }
  }
}
export function holdersOf(skillId: string): Holders {
  return holders.get(skillId) ?? { chars: [], cards: [] };
}

/** Skills sharing the same icon/type family, as "related skills" (same effect_type and rarity, non-evolved), max n. */
export function relatedSkills(s: SkillRec, n = 8): SkillRec[] {
  return skills
    .filter((o) => o.id !== s.id && o.rarity === s.rarity && (o as any).effect_type === (s as any).effect_type && skillClass.get(o.id) === 'all')
    .slice(0, n);
}
