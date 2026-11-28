import { describe, it, expect } from 'vitest';
import {
  HOLO_ISSUE_ALPHABET,
  HOLO_ISSUE_RE,
  HOLO_CARD_POOL,
  isHoloIssueId,
  shanghaiYYYYMMDD,
  previousShanghaiDate,
  msUntilNextShanghaiMidnight,
} from '../holo';
import { availableLocalesFor } from '../i18n';

describe('holo issue ids', () => {
  it('uses the unambiguous 32-character alphabet (no I, O, 0, 1)', () => {
    expect(HOLO_ISSUE_ALPHABET).toHaveLength(32);
    expect(HOLO_ISSUE_ALPHABET).not.toMatch(/[IO01]/);
    expect(new Set(HOLO_ISSUE_ALPHABET).size).toBe(32);
  });
  it('accepts only well-formed UMA-YYYYMMDD-XXXX ids', () => {
    expect(isHoloIssueId('UMA-20261128-K7P4')).toBe(true);
    expect(isHoloIssueId('UMA-20261128-ABCI')).toBe(false);
    expect(isHoloIssueId('UMA-20261128-ABCO')).toBe(false);
    expect(isHoloIssueId('UMA-20261128-ABC0')).toBe(false);
    expect(isHoloIssueId('UMA-20261128-ABC1')).toBe(false);
    expect(isHoloIssueId('UMA-2026-K7P4')).toBe(false);
    expect(HOLO_ISSUE_RE.test('UMA-20261128-2345')).toBe(true);
  });
  it('soft-launch pool is the three approved demo cards with 40/30/30 weights', () => {
    expect(HOLO_CARD_POOL.map((c) => c.id)).toEqual([
      'daring_tact_107501',
      'special_week_100101',
      'gold_ship_100701',
    ]);
    expect(HOLO_CARD_POOL.map((c) => c.weight)).toEqual([40, 30, 30]);
  });
});

describe('Asia/Shanghai day boundary', () => {
  it('treats 16:00 UTC as the start of the next Shanghai calendar day (UTC+8)', () => {
    expect(shanghaiYYYYMMDD(new Date('2026-11-27T15:59:59Z'))).toBe('20261127');
    expect(shanghaiYYYYMMDD(new Date('2026-11-27T16:00:00Z'))).toBe('20261128');
    expect(shanghaiYYYYMMDD(new Date('2026-11-28T15:59:59Z'))).toBe('20261128');
    expect(shanghaiYYYYMMDD(new Date('2026-11-28T16:00:00Z'))).toBe('20261129');
  });
  it('computes the previous Shanghai calendar date', () => {
    expect(previousShanghaiDate('20261128')).toBe('20261127');
    expect(previousShanghaiDate('20260301')).toBe('20260228');
    expect(previousShanghaiDate('20260101')).toBe('20251231');
  });
  it('returns a positive countdown to the next Shanghai midnight', () => {
    const justBefore = new Date('2026-11-27T15:59:00Z');
    const ms = msUntilNextShanghaiMidnight(justBefore);
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(60_000);
    const justAfter = new Date('2026-11-27T16:00:01Z');
    const ms2 = msUntilNextShanghaiMidnight(justAfter);
    expect(ms2).toBeGreaterThan(23 * 3600 * 1000);
  });
});

describe('locale availability', () => {
  it('exposes the intro page only in Simplified Chinese', () => {
    expect(availableLocalesFor('/tools/daily-pack/')).toEqual(['zh']);
  });
});
