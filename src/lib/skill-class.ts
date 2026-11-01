import skillsData from '../../public/data/skills.json';
import type { Locale } from './i18n';
import { skillLocales, categoryLocales } from './skill-categories';

/** How each skill page is treated for SEO/hreflang (see availableLocalesFor in i18n.ts). */
// Evolved skills and the unfinished "Racing Carnival bonus" entries (placeholder text such as "+{0}％") are never indexed.
export const skillClass = new Map<string, 'all' | 'jp' | 'none'>(
  [...skillLocales].map(([id, l]) => [id, l.includes('en') ? 'all' : l.length ? 'jp' : 'none'] as const)
);
/** English names shared by several indexable skills (their titles get the Japanese name appended to stay unique). */
const nameCount = new Map<string, number>();
for (const s of skillsData as any[]) if (skillClass.get(s.id) !== 'none') nameCount.set(s.name_en, (nameCount.get(s.name_en) ?? 0) + 1);
export const duplicateSkillNameEn = new Set([...nameCount].filter(([, n]) => n > 1).map(([k]) => k));

/** Locales with an indexable page per skill (global skills: all; JP-only skills: ja + locales with a real translation; evolved: only when listed on a category page). */
export { skillLocales, categoryLocales };
export const skillIdsFor = (loc: Locale): string[] => [...skillLocales].filter(([, l]) => l.includes(loc)).map(([id]) => id);
/** Options for availableLocalesFor (hreflang / language switcher / sitemaps). */
export const seoOpts = { skillClass, skillLocales, categoryLocales };
