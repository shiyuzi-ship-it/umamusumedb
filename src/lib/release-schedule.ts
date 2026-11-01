// Global release schedule: real JP / Global release dates from the site data + a transparent, unofficial estimate for items that are JP-only.
//
// Estimate (never an official date):
//  * Global launched with the JP catalogue up to early March 2021 and has since been releasing the rest of the JP catalogue in the same
//    order, at its own pace. The launch-day batch is excluded from the pace, because it was a one-off catch-up, not a rhythm.
//  * pace = least-squares slope of "Global date vs JP date" (Global days per JP day) over the last 30 / 60 / 100 / all post-launch items.
//    Lowest and highest of those four slopes give the fast / slow bound.
//  * anchor = the most recent Global release (its JP date J0, Global date G0). A JP-only item with JP date d > J0 is estimated at
//    G0 + (d - J0) x pace, shown as a window [G0 + (d-J0) x fast - 14 d, G0 + (d-J0) x slow + 14 d]. 14 days of padding cover the usual weekly jitter.
//  * windows are cut so that no estimated date lies before the build day.
//  * JP-only items whose JP date is not after J0 were skipped by Global's order: no estimate is given for them.
//  * backtest: the same method is re-run from earlier anchors and compared with what really happened (coverage is shown on the page).
export const PAD_DAYS = 14;
export const BACKTEST_HORIZON_DAYS = 120;
const DAY = 864e5;
export const toDay = (d: string) => Math.round(Date.parse(d) / DAY);
export const fromDay = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);

export interface ScheduleItem { kind: 'character' | 'card'; id: string; rec: any; jp: string; gl?: string }
export interface ReleasedGroup { date: string; items: ScheduleItem[]; jpMin: string; jpMax: string; gapMin: number; gapMax: number; launch: boolean }
export interface PendingGroup { jp: string; items: ScheduleItem[]; est?: { from: string; to: string; mid: string } }
export interface Schedule {
  launchDate: string;
  released: ReleasedGroup[];           // newest Global date first
  pending: PendingGroup[];             // JP date ascending
  counts: { chars: number; cards: number; pendingChars: number; pendingCards: number; pendingNoEstimate: number; pendingEstimated: number };
  gap: { min: number; median: number; max: number } | null;  // JP -> Global days, post-launch items only
  anchor: { jp: string; gl: string } | null;
  pace: { slow: number; mid: number; fast: number } | null;  // Global days per JP day
  backtest: { n: number; hit: number; horizon: number; pad: number } | null;
  sampleSize: number;
}

/** least-squares slope of y on x; 1 when degenerate */
export function slope(pts: [number, number][]) {
  const n = pts.length;
  if (n < 2) return 1;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  for (const p of pts) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) ** 2; }
  return sxx ? sxy / sxx : 1;
}

/** pace bounds from [jpDay, globalDay] samples (any order) */
export function paceFrom(samples: [number, number][]) {
  const s = [...samples].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const wins = [30, 60, 100, s.length].filter((w) => w <= s.length && w >= 5);
  if (!wins.length) return null;
  const sl = wins.map((w) => slope(s.slice(-w)));
  const w100 = slope(s.slice(-Math.min(100, s.length)));
  return { slow: Math.max(...sl), mid: w100, fast: Math.min(...sl) };
}

export function estimateWindow(anchor: { jp: number; gl: number }, pace: { slow: number; mid: number; fast: number }, jpDay: number, pad = PAD_DAYS) {
  const d = jpDay - anchor.jp;
  return { from: Math.max(anchor.gl, Math.round(anchor.gl + d * pace.fast - pad)), to: Math.round(anchor.gl + d * pace.slow + pad), mid: Math.round(anchor.gl + d * pace.mid) };
}

export function backtest(samples: [number, number][], horizon = BACKTEST_HORIZON_DAYS, pad = PAD_DAYS) {
  const byG = [...samples].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  let n = 0, hit = 0;
  for (let cut = 60; cut < byG.length - 5; cut += 10) {
    const past = byG.slice(0, cut);
    const anchor = past.at(-1)!;
    const pace = paceFrom(past);
    if (!pace) continue;
    for (const p of byG.slice(cut)) {
      if (p[0] <= anchor[0] || p[1] - anchor[1] > horizon) continue;
      const w = estimateWindow({ jp: anchor[0], gl: anchor[1] }, pace, p[0], pad);
      n++;
      if (p[1] >= w.from && p[1] <= w.to) hit++;
    }
  }
  return n ? { n, hit, horizon, pad } : null;
}

export function buildSchedule(characters: any[], cards: any[], today: string = new Date().toISOString().slice(0, 10)): Schedule {
  const items: ScheduleItem[] = [
    ...characters.map((rec) => ({ kind: 'character' as const, id: rec.id, rec, jp: rec.release_date_jp, gl: rec.release_date_global || undefined })),
    ...cards.map((rec) => ({ kind: 'card' as const, id: rec.id, rec, jp: rec.release_date_jp, gl: rec.release_date_global || undefined })),
  ].filter((i) => i.jp);
  const live = items.filter((i) => i.gl);
  const launchDate = live.reduce((m, i) => (i.gl! < m ? i.gl! : m), '9999-12-31');
  const post = live.filter((i) => i.gl! > launchDate);
  const samples = post.map((i) => [toDay(i.jp), toDay(i.gl!)] as [number, number]);

  const gmap = new Map<string, ScheduleItem[]>();
  for (const i of live) (gmap.get(i.gl!) ?? gmap.set(i.gl!, []).get(i.gl!)!).push(i);
  const released: ReleasedGroup[] = [...gmap.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([date, its]) => {
    its.sort((a, b) => (a.jp < b.jp ? -1 : a.jp > b.jp ? 1 : a.kind === b.kind ? 0 : a.kind === 'character' ? -1 : 1));
    const gaps = its.map((i) => toDay(date) - toDay(i.jp));
    return { date, items: its, jpMin: its[0].jp, jpMax: its[its.length - 1].jp, gapMin: Math.min(...gaps), gapMax: Math.max(...gaps), launch: date === launchDate };
  });

  const latest = [...live].sort((a, b) => (a.gl! < b.gl! ? 1 : a.gl! > b.gl! ? -1 : a.jp < b.jp ? 1 : -1))[0];
  const anchor = latest ? { jp: latest.jp, gl: latest.gl! } : null;
  const pace = paceFrom(samples);
  const jmap = new Map<string, ScheduleItem[]>();
  for (const i of items.filter((x) => !x.gl)) (jmap.get(i.jp) ?? jmap.set(i.jp, []).get(i.jp)!).push(i);
  const pending: PendingGroup[] = [...jmap.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([jp, its]) => {
    its.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'character' ? -1 : 1));
    if (!anchor || !pace || jp <= anchor.jp) return { jp, items: its };
    const w = estimateWindow({ jp: toDay(anchor.jp), gl: toDay(anchor.gl) }, pace, toDay(jp));
    // never show a predicted date that is already in the past: windows are cut to the build day (still an estimate)
    const cut = (n: number) => { const d = fromDay(n); return d < today ? today : d; };
    return { jp, items: its, est: { from: cut(w.from), to: cut(w.to), mid: cut(w.mid) } };
  });

  const gaps = post.map((i) => toDay(i.gl!) - toDay(i.jp)).sort((a, b) => a - b);
  const pend = items.filter((i) => !i.gl);
  const pendEst = pending.filter((g) => g.est).reduce((n, g) => n + g.items.length, 0);
  return {
    launchDate, released, pending,
    counts: {
      chars: live.filter((i) => i.kind === 'character').length, cards: live.filter((i) => i.kind === 'card').length,
      pendingChars: pend.filter((i) => i.kind === 'character').length, pendingCards: pend.filter((i) => i.kind === 'card').length,
      pendingEstimated: pendEst, pendingNoEstimate: pend.length - pendEst,
    },
    gap: gaps.length ? { min: gaps[0], median: gaps[Math.floor(gaps.length / 2)], max: gaps[gaps.length - 1] } : null,
    anchor, pace, backtest: backtest(samples), sampleSize: samples.length,
  };
}
