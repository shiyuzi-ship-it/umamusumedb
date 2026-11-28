/** Daily holographic pack — shared constants and date helpers (Asia/Shanghai). */
import type { Locale } from './i18n';
import { HOLO_POOL_SLUGS as GENERATED_SLUGS, HOLO_LEGACY_ALIASES, HOLO_ROSTER_COUNT } from './holo-pool.generated';

export const HOLO_ISSUE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const HOLO_ISSUE_RE = /^UMA-(\d{8})-([A-HJ-NP-Z2-9]{4})$/;
export const HOLO_INTRO_PATH = '/tools/daily-pack/';
export const HOLO_RITUAL_PATH = '/holo/';
export const HOLO_FRAME_STREAK = 7;

export { HOLO_LEGACY_ALIASES, HOLO_ROSTER_COUNT };

export type HoloCardId = string;

/** Site character slugs that have an official portrait in the daily pack. */
export const HOLO_POOL_SLUGS = new Set<string>(GENERATED_SLUGS);

/** Legacy soft-launch issue ids (demo stems) plus every current site slug. */
export const HOLO_POOL_IDS = new Set<string>([...GENERATED_SLUGS, ...Object.keys(HOLO_LEGACY_ALIASES)]);

export function resolveHoloCardId(id: string): string {
  return HOLO_LEGACY_ALIASES[id] || id;
}

export function holoPrefix(locale: Locale): string {
  return locale === 'en' ? '' : `/${locale}`;
}

export function holoRitualHref(locale: Locale, issueId?: string): string {
  const base = `${holoPrefix(locale)}${HOLO_RITUAL_PATH}`;
  return issueId ? `${base}${encodeURIComponent(issueId)}` : base;
}

export function holoIntroHref(locale: Locale): string {
  return `${holoPrefix(locale)}${HOLO_INTRO_PATH}`;
}

export function isHoloIssueId(value: string | null | undefined): boolean {
  return !!value && HOLO_ISSUE_RE.test(value);
}

/** Calendar date in Asia/Shanghai as YYYYMMDD. */
export function shanghaiYYYYMMDD(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const m: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') m[p.type] = p.value;
  return `${m.year}${m.month}${m.day}`;
}

/** Previous calendar day of a YYYYMMDD Shanghai date (pure date arithmetic). */
export function previousShanghaiDate(yyyymmdd: string): string {
  const y = Number(yyyymmdd.slice(0, 4));
  const mo = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  const dt = new Date(Date.UTC(y, mo - 1, d - 1));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/** Milliseconds until the next 00:00 in Asia/Shanghai. */
export function msUntilNextShanghaiMidnight(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const m: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') m[p.type] = p.value;
  const asIfUtc = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second, now.getUTCMilliseconds());
  const next = Date.UTC(+m.year, +m.month - 1, +m.day + 1, 0, 0, 0, 0);
  return Math.max(0, next - asIfUtc);
}
