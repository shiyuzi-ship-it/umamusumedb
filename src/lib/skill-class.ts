import skillsData from '../../public/data/skills.json';

/** How each skill page is treated for SEO/hreflang (see availableLocalesFor in i18n.ts). */
// Evolved skills and the unfinished "Racing Carnival bonus" entries (placeholder text such as "+{0}％") are never indexed.
const isThin = (s: any) => s.rarity === 'evolved' || String(s.id).startsWith('carnival_bonus');
export const skillClass = new Map<string, 'all' | 'jp' | 'none'>(
  (skillsData as any[]).map((s) => [s.id, isThin(s) ? 'none' : s.server === 'jp' ? 'jp' : 'all'])
);
/** English names shared by several indexable skills (their titles get the Japanese name appended to stay unique). */
const nameCount = new Map<string, number>();
for (const s of skillsData as any[]) if (skillClass.get(s.id) !== 'none') nameCount.set(s.name_en, (nameCount.get(s.name_en) ?? 0) + 1);
export const duplicateSkillNameEn = new Set([...nameCount].filter(([, n]) => n > 1).map(([k]) => k));
/** Skill pages built for the locales that do not build every skill (ko / zh / zh-tw): only 'all' skills. */
export const newLocaleSkillIds = (skillsData as any[]).filter((s) => skillClass.get(s.id) === 'all').map((s) => s.id as string);
