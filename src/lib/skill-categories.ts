// Skill category pages (/skills/category/<slug>/): groups of skills that real players search for
// (rarity x distance x running style x surface x effect x phase x place), computed from the site's own skills.json at build time.
// Only combinations with enough skills become pages (no thin pages). Everything is derived from game data fields / original JP text tags.
import skillsData from '../../public/data/skills.json';
import type { Locale } from './i18n';

export type DimKey = 'kind' | 'rarity' | 'effect' | 'distance' | 'style' | 'surface' | 'phase' | 'location';
export const DIM_ORDER: DimKey[] = ['kind', 'rarity', 'effect', 'distance', 'style', 'surface', 'phase', 'location'];
export const MIN_SKILLS = 8;
export const MAX_ROWS = 120;
const ALL_LOCALES: Locale[] = ['en', 'ja', 'zh', 'zh-tw', 'ko'];
const EVOLVED_LOCALES: Locale[] = ['ja', 'zh', 'zh-tw', 'ko'];

const SLUG: Record<DimKey, Record<string, string>> = {
  kind: { evolved: 'evolved' },
  rarity: { gold: 'gold', normal: 'white', unique: 'unique' },
  effect: { speed: 'speed', acceleration: 'acceleration', recovery: 'recovery', debuff: 'debuff' },
  distance: { sprint: 'sprint', mile: 'mile', medium: 'medium', long: 'long' },
  style: { escape: 'front-runner', lead: 'pace-chaser', between: 'late-surger', chase: 'end-closer' },
  surface: { dirt: 'dirt', turf: 'turf' },
  phase: { start: 'early-race', middle: 'mid-race', late: 'late-race', final: 'last-spurt' },
  location: { corner: 'corner', straight: 'straight', slope: 'slope' },
};

export interface SkillRec { id: string; rarity: string; server: string; effect_type?: string; distance?: string; style?: string; phase?: string; location?: string; description_jp?: string; description_en?: string; cost?: number | null; name_en: string; i18n?: any; [k: string]: any }
const all = skillsData as unknown as SkillRec[];

/** Does the skill have a real translation (name + description) for the locale? en/ja always exist. */
export function hasLocaleText(s: SkillRec, loc: Locale): boolean {
  if (loc === 'en' || loc === 'ja') return true;
  const t = s.i18n?.[loc === 'ko' ? 'ko' : loc === 'zh' ? 'zh' : 'zh_tw'];
  return !!(t?.name && t?.desc);
}
export const isCarnival = (s: SkillRec) => String(s.id).startsWith('carnival_bonus');

function surfaceOf(s: SkillRec): string | null {
  const jp = String(s.description_jp ?? ''), en = String(s.description_en ?? '');
  if (/＜ダート＞/.test(jp) || /\(Dirt\)/i.test(en)) return 'dirt';
  if (/＜芝＞/.test(jp) || /\(Turf\)/i.test(en)) return 'turf';
  return null;
}
function effectOf(s: SkillRec): string | null {
  if (/回復/.test(String(s.description_jp ?? ''))) return 'recovery';
  return ['speed', 'acceleration', 'debuff'].includes(String(s.effect_type)) ? String(s.effect_type) : null;
}
function dimsOf(s: SkillRec): Partial<Record<DimKey, string>> {
  const o: Partial<Record<DimKey, string>> = {};
  if (s.rarity === 'evolved') o.kind = 'evolved';
  else o.rarity = s.rarity;
  const e = effectOf(s); if (e) o.effect = e;
  if (s.distance && s.distance !== 'all') o.distance = s.distance;
  if (s.style && s.style !== 'all') o.style = s.style;
  const f = surfaceOf(s); if (f) o.surface = f;
  if (s.phase && s.phase !== 'other') o.phase = s.phase;
  if (s.location && s.location !== 'any') o.location = s.location;
  return o;
}

export interface Category { slug: string; scope: 'global' | 'evolved'; parts: [DimKey, string][]; ids: Partial<Record<Locale, string[]>>; locales: Locale[] }

const sortIds = (list: SkillRec[]) =>
  [...list].sort((a, b) => (b.cost ?? -1) - (a.cost ?? -1) || String(a.name_en).localeCompare(String(b.name_en)) || a.id.localeCompare(b.id)).map((s) => s.id);

function build(): Category[] {
  const out: Category[] = [];
  const scopes: { scope: 'global' | 'evolved'; pool: SkillRec[]; locales: Locale[] }[] = [
    { scope: 'global', pool: all.filter((s) => s.server === 'global' && s.rarity !== 'evolved' && !isCarnival(s)), locales: ALL_LOCALES },
    { scope: 'evolved', pool: all.filter((s) => s.rarity === 'evolved'), locales: EVOLVED_LOCALES },
  ];
  for (const { scope, pool, locales } of scopes) {
    const dimmed = pool.map((s) => ({ s, d: dimsOf(s) }));
    const keys = DIM_ORDER.filter((k) => k !== 'kind' && (scope === 'evolved' ? k !== 'rarity' : true));
    const base: [DimKey, string][] = scope === 'evolved' ? [['kind', 'evolved']] : [];
    const combos: DimKey[][] = [];
    for (let i = 0; i < keys.length; i++) {
      combos.push([keys[i]]);
      for (let j = i + 1; j < keys.length; j++) combos.push([keys[i], keys[j]]);
    }
    if (scope === 'evolved') combos.push([]);
    const seenSets = new Set<string>();
    // singles first so that a pair identical to a single is dropped
    combos.sort((a, b) => a.length - b.length);
    const valuesOf = (k: DimKey) => [...new Set(dimmed.map((x) => x.d[k]).filter(Boolean) as string[])];
    for (const combo of combos) {
      const rec = (idx: number, acc: [DimKey, string][]) => {
        if (idx === combo.length) {
          // evolved: the 'kind' part is always present, so a category exists for the bare 'evolved' list only once
          const members = dimmed.filter((x) => acc.every(([k, v]) => x.d[k] === v)).map((x) => x.s);
          const ids: Partial<Record<Locale, string[]>> = {};
          const locs: Locale[] = [];
          for (const loc of locales) {
            const m = scope === 'global' ? members : members.filter((s) => hasLocaleText(s, loc));
            if (m.length >= MIN_SKILLS) { ids[loc] = sortIds(m); locs.push(loc); }
          }
          if (!locs.length) return;
          const setKey = scope + ':' + (ids[locs[0]] ?? []).slice().sort().join(',') + ':' + locs.join('/');
          if (seenSets.has(setKey)) return;
          seenSets.add(setKey);
          const ordered = [...acc].sort((a, b) => DIM_ORDER.indexOf(a[0]) - DIM_ORDER.indexOf(b[0]));
          const slug = ordered.map(([k, v]) => SLUG[k][v]).join('-');
          out.push({ slug, scope, parts: ordered, ids, locales: locs });
          return;
        }
        for (const v of valuesOf(combo[idx])) rec(idx + 1, [...acc, [combo[idx], v]]);
      };
      rec(0, base);
    }
  }
  // evolved pages share slugs with nothing global (prefix evolved-)
  return out;
}
export const categories: Category[] = build();
export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
export const categoryLocales = new Map<string, Locale[]>(categories.map((c) => [c.slug, c.locales]));
export const skillById = new Map(all.map((s) => [s.id, s]));

/** Locales in which each skill has an indexable page. */
export function computeSkillLocales(): Map<string, Locale[]> {
  const inCat = new Map<string, Set<Locale>>();
  for (const c of categories) {
    if (c.scope !== 'evolved') continue;
    for (const loc of c.locales) for (const id of c.ids[loc] ?? []) {
      let s = inCat.get(id); if (!s) inCat.set(id, (s = new Set()));
      s.add(loc);
    }
  }
  const m = new Map<string, Locale[]>();
  for (const s of all) {
    let locs: Locale[] = [];
    if (isCarnival(s)) locs = [];
    else if (s.rarity === 'evolved') locs = EVOLVED_LOCALES.filter((l) => inCat.get(s.id)?.has(l));
    else if (s.server === 'global') locs = ALL_LOCALES;
    else locs = EVOLVED_LOCALES.filter((l) => hasLocaleText(s, l)); // JP-only: ja + every locale with a real translation (en is a fan translation: noindex)
    m.set(s.id, locs);
  }
  return m;
}
export const skillLocales = computeSkillLocales();

const catsOfSkill = new Map<string, Category[]>();
for (const c of categories) for (const loc of c.locales) for (const id of c.ids[loc] ?? []) {
  let a = catsOfSkill.get(id); if (!a) catsOfSkill.set(id, (a = []));
  if (!a.includes(c)) a.push(c);
}
/** Categories (with page in `loc`) a skill belongs to, most specific (smallest) first. */
export function categoriesOf(skillId: string, loc: Locale, n = 6): Category[] {
  return (catsOfSkill.get(skillId) ?? []).filter((c) => c.locales.includes(loc)).sort((a, b) => (a.ids[loc]?.length ?? 0) - (b.ids[loc]?.length ?? 0)).slice(0, n);
}
