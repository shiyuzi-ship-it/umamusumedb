/** Daily holographic pack — shared constants and date helpers (Asia/Shanghai). */
export const HOLO_ISSUE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const HOLO_ISSUE_RE = /^UMA-(\d{8})-([A-HJ-NP-Z2-9]{4})$/;
export const HOLO_INTRO_PATH = '/tools/daily-pack/';
export const HOLO_RITUAL_PATH = '/holo/';
export const HOLO_FRAME_STREAK = 7;

export type HoloCardId = 'daring_tact_107501' | 'special_week_100101' | 'gold_ship_100701';

export interface HoloCard {
  id: HoloCardId;
  weight: number;
  name: string;
  jpName: string;
  outfit: string;
  slug: string;
  aura: 'moon' | 'gold' | 'rose';
  posterGlow: string;
  isRecentOutfit: boolean;
}

export const HOLO_CARD_POOL: HoloCard[] = [
  {
    id: 'daring_tact_107501',
    weight: 40,
    name: 'Daring Tact',
    jpName: 'デアリングタクト',
    outfit: '白光のレガリア',
    slug: 'daring_tact_107501',
    aura: 'moon',
    posterGlow: '#233a63',
    isRecentOutfit: true,
  },
  {
    id: 'special_week_100101',
    weight: 30,
    name: 'Special Week',
    jpName: 'スペシャルウィーク',
    outfit: 'Special Dreamer / スペシャルドリーマー',
    slug: 'special_week_special_dreamer',
    aura: 'gold',
    posterGlow: '#432746',
    isRecentOutfit: false,
  },
  {
    id: 'gold_ship_100701',
    weight: 30,
    name: 'Gold Ship',
    jpName: 'ゴールドシップ',
    outfit: 'Red Strife / レッドストライフ',
    slug: 'gold_ship_red_strife',
    aura: 'rose',
    posterGlow: '#472233',
    isRecentOutfit: false,
  },
];

export const HOLO_POOL_IDS = new Set(HOLO_CARD_POOL.map((c) => c.id));
export const HOLO_POOL_SLUGS = new Set(HOLO_CARD_POOL.map((c) => c.slug));

export function isHoloIssueId(value: string | null | undefined): boolean {
  return !!value && HOLO_ISSUE_RE.test(value);
}

export function getHoloCard(id: string): HoloCard | undefined {
  return HOLO_CARD_POOL.find((c) => c.id === id);
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
