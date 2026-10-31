import type { Locale } from './i18n';
import { localizePathname } from './i18n';
import { t } from './ui-strings';

export const STAT_KEYS = ['speed', 'stamina', 'power', 'guts', 'wisdom'] as const;
export const statLabel = (loc: Locale, k: string) => t(loc, 'stat' + k[0].toUpperCase() + k.slice(1));
export const typeLabel = (loc: Locale, k: string) => t(loc, 'type' + k[0].toUpperCase() + k.slice(1));
export const skillRarityLabel = (loc: Locale, r: string) => t(loc, 'rarity' + r[0].toUpperCase() + r.slice(1));

export function gradeClass(v?: string) {
  switch (v) {
    case 'S': return 'text-red-500 font-bold';
    case 'A': return 'text-orange-500 font-bold';
    case 'B': return 'text-yellow-600';
    case 'C': return 'text-green-600';
    case 'D': return 'text-blue-500';
    default: return 'text-gray-400';
  }
}
export const cardRarityClass = (r: string) => (r === 'SSR' ? 'bg-yellow-100 text-yellow-800' : r === 'SR' ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-800');

/** Numeric part of values like "5.0s (base, scales with course length)" -> "5.0s"; '' when absent. */
export function cleanSeconds(v?: string | null) {
  const m = String(v ?? '').match(/^[\d.]+s/);
  return m ? m[0] : '';
}
export const path = (p: string, loc: Locale) => localizePathname(p, loc);
export const num = (v: unknown) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(1)) : String(v ?? ''));

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
/** "May 2" -> localized month/day. Unknown formats are returned unchanged. */
export function formatBirthday(v: string, loc: Locale) {
  const m = String(v).match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  const mi = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  if (!m || mi < 0 || loc === 'en') return v;
  const d = Number(m[2]);
  if (loc === 'ko') return `${mi + 1}월 ${d}일`;
  return `${mi + 1}月${d}日`;
}
