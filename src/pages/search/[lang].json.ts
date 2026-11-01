// Static per-locale search index: /search/{locale}.json (loaded by the header search box when it is opened).
// Every entry carries the names in all languages in `q`, so a query in any language (kana, hangul, hanzi, English/romaji) matches.
import type { APIRoute } from 'astro';
import characters from '../../../public/data/characters.json';
import cards from '../../../public/data/supportCards.json';
import skills from '../../../public/data/skills.json';
import { SUPPORTED_LOCALES, availableLocalesFor, localizePathname, type Locale } from '@/lib/i18n';
import { skillClass } from '@/lib/skill-class';
import { t } from '@/lib/ui-strings';
import { allNames, cardName, charName, skillName } from '@/lib/localized.js';

export function getStaticPaths() {
  return SUPPORTED_LOCALES.map((lang) => ({ params: { lang } }));
}

const PAGES: [string, string][] = [
  ['/characters/', 'navCharacters'], ['/cards/', 'navCards'], ['/skills/', 'navSkills'], ['/updates/', 'navUpdates'], ['/global-release-schedule/', 'navSchedule'], ['/tools/', 'navTools'],
  ['/tools/training-calculator/', 'toolTraining'], ['/tools/factor-calculator/', 'toolFactor'], ['/tools/skill-builder/', 'toolSkill'],
  ['/tools/support-deck/', 'toolDeck'], ['/tools/training-goals/', 'toolGoals'], ['/tools/character-comparison/', 'toolCompare'],
];

export const GET: APIRoute = ({ params }) => {
  const loc = params.lang as Locale;
  const other: Locale = loc === 'en' ? 'ja' : 'en';
  const items: any[] = [];

  for (const [path, key] of PAGES) {
    if (!availableLocalesFor(path).includes(loc)) continue;
    items.push({ t: 'p', n: t(loc, key), q: `${t('en', key)} ${t('ja', key)} ${t('ko', key)} ${t('zh', key)} ${t('zh-tw', key)}`, u: localizePathname(path, loc) });
  }
  for (const c of characters as any[]) {
    items.push({ t: 'c', id: c.id, n: charName(c, loc), s: charName(c, other), q: allNames(c).join(' '), im: c.image_url });
  }
  for (const c of cards as any[]) {
    items.push({ t: 'k', id: c.id, n: cardName(c, loc), s: cardName(c, other), q: allNames(c).join(' '), im: c.image_url });
  }
  for (const s of skills as any[]) {
    const cls = skillClass.get(s.id);
    if ((loc !== 'en' && loc !== 'ja') && cls !== 'all') continue;
    items.push({ t: 's', id: s.id, n: skillName(s, loc), s: skillName(s, other), q: allNames({ ...s, base_name_en: undefined }).join(' '), im: s.icon_url });
  }
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), locale: loc, items }), { headers: { 'Content-Type': 'application/json' } });
};
