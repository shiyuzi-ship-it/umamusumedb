import type { APIRoute } from 'astro';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import { buildEntityEntries } from '@/lib/entity-lists';
export function getStaticPaths() { return SUPPORTED_LOCALES.map((lang) => ({ params: { lang } })); }
export const GET: APIRoute = ({ params }) => {
  const loc = params.lang as Locale;
  return new Response(JSON.stringify({ locale: loc, items: buildEntityEntries('cards', loc, true) }), { headers: { 'Content-Type': 'application/json' } });
};
