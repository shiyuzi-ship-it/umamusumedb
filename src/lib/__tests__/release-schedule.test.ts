import { describe, it, expect } from 'vitest';
import { buildSchedule, estimateWindow, paceFrom, slope, toDay, fromDay } from '../release-schedule';
import characters from '../../../public/data/characters.json';
import cards from '../../../public/data/supportCards.json';

describe('release schedule math', () => {
  it('slope of a perfect line', () => {
    expect(slope([[0, 0], [10, 7], [20, 14]])).toBeCloseTo(0.7);
  });
  it('estimate window is ordered, never before the anchor, and uses the pace', () => {
    const w = estimateWindow({ jp: 0, gl: 1000 }, { fast: 0.6, mid: 0.7, slow: 0.8 }, 100);
    expect(w.from).toBe(1000 + 60 - 14);
    expect(w.to).toBe(1000 + 80 + 14);
    expect(w.mid).toBe(1070);
    expect(estimateWindow({ jp: 0, gl: 1000 }, { fast: 0.6, mid: 0.7, slow: 0.8 }, 1).from).toBe(1000);
  });
  it('date helpers round-trip', () => { expect(fromDay(toDay('2026-10-24'))).toBe('2026-10-24'); });
  it('paceFrom needs enough samples', () => {
    expect(paceFrom([[0, 0], [1, 1]])).toBeNull();
  });
});

describe('schedule from the real data', () => {
  const s = buildSchedule(characters as any[], cards as any[]);
  it('splits live and pending exactly', () => {
    const liveN = s.released.reduce((n, g) => n + g.items.length, 0);
    const pendN = s.pending.reduce((n, g) => n + g.items.length, 0);
    expect(liveN).toBe(s.counts.chars + s.counts.cards);
    expect(pendN).toBe(s.counts.pendingChars + s.counts.pendingCards);
    expect(liveN + pendN).toBe((characters as any[]).length + (cards as any[]).length);
  });
  it('only estimates items after the latest Global release (JP order), never invents an earlier date', () => {
    for (const g of s.pending) {
      if (g.est) {
        expect(g.jp > s.anchor!.jp).toBe(true);
        expect(g.est.from >= s.anchor!.gl).toBe(true);
        expect(g.est.from <= g.est.mid && g.est.mid <= g.est.to).toBe(true);
      } else expect(g.jp <= s.anchor!.jp).toBe(true);
    }
  });
  it('pending groups are sorted by JP date, released newest first', () => {
    const jp = s.pending.map((g) => g.jp);
    expect([...jp].sort()).toEqual(jp);
    const gl = s.released.map((g) => g.date);
    expect([...gl].sort().reverse()).toEqual(gl);
  });
  it('pace and backtest are sane', () => {
    expect(s.pace!.fast).toBeLessThanOrEqual(s.pace!.slow);
    expect(s.pace!.fast).toBeGreaterThan(0.3);
    expect(s.pace!.slow).toBeLessThan(1.5);
    expect(s.backtest!.hit / s.backtest!.n).toBeGreaterThan(0.85);
    expect(s.gap!.min).toBeGreaterThan(0);
  });
});
