// Full per-locale skill list for in-browser search/filtering: /skills-data/{locale}.json (fetched by the skills list on first search/filter).
// The list pages themselves only contain one paginated slice of this data.
import type { APIRoute } from 'astro';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import { buildSkillEntries } from '@/lib/skills-list-data';

export function getStaticPaths() {
  return SUPPORTED_LOCALES.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const loc = params.lang as Locale;
  return new Response(JSON.stringify({ locale: loc, items: buildSkillEntries(loc, true) }), { headers: { 'Content-Type': 'application/json' } });
};
