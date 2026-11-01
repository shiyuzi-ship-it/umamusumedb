import { describe, it, expect } from 'vitest';
import { scoreCard, buildRankings, maxLevelOf, WEIGHTS, CARD_TYPES } from '../card-rankings';
import { supportCards } from '../static-content';

describe('card score', () => {
  const card: any = { id: 'x', type: 'speed', rarity: 'SSR', effects: { friendship_bonus: { lv1: 10, lv50: 30 }, training_bonus: { lv1: 0, lv50: 10 }, speed_bonus: { lv50: 1 }, specialty_priority: { lv50: 100 }, unknown_effect: { lv50: 999 } } };
  it('uses the maximum level and the published weights', () => {
    expect(maxLevelOf(card.effects)).toBe(50);
    const r = scoreCard(card);
    expect(r.score).toBeCloseTo(30 * WEIGHTS.friendship_bonus + 10 * WEIGHTS.training_bonus + 1 * WEIGHTS.speed_bonus + 100 * WEIGHTS.specialty_priority, 5);
    expect(r.fr).toBe(30); expect(r.typeBonus).toBe(1);
  });
  it('ignores effects without a weight', () => { expect(scoreCard({ ...card, effects: { unknown_effect: { lv50: 5 } } }).score).toBe(0); });
});

describe('rankings from real data', () => {
  const r = buildRankings(supportCards as any[]);
  it('every card is in exactly one bucket and lists are sorted', () => {
    let n = 0;
    for (const b of [r.global, r.jpOnly]) for (const rar of Object.keys(b)) for (const t of CARD_TYPES) {
      const l = b[rar][t]; n += l.length;
      for (let i = 1; i < l.length; i++) expect(l[i - 1].score).toBeGreaterThanOrEqual(l[i].score);
      for (const x of l) expect(x.card.type).toBe(t);
    }
    expect(n).toBe((supportCards as any[]).length);
    expect(r.counts.global + r.counts.jpOnly).toBe(n);
  });
  it('global bucket only has cards with a Global date', () => {
    for (const t of CARD_TYPES) for (const x of r.global.SSR[t]) expect(x.glDate).toBeTruthy();
    for (const t of CARD_TYPES) for (const x of r.jpOnly.SSR[t]) expect(x.glDate).toBeUndefined();
  });
  it('max level is 50 / 45 / 40 for SSR / SR / R', () => {
    for (const [rar, lv] of [['SSR', 50], ['SR', 45], ['R', 40]] as const) for (const t of CARD_TYPES) for (const x of r.global[rar][t]) expect(x.maxLv).toBe(lv);
  });
});
