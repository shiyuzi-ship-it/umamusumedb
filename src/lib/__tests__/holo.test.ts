import { describe, it, expect } from 'vitest';
import {
  HOLO_ISSUE_ALPHABET,
  HOLO_ISSUE_RE,
  HOLO_POOL_SLUGS,
  HOLO_ROSTER_COUNT,
  HOLO_LEGACY_ALIASES,
  isHoloIssueId,
  holoRitualHref,
  holoIntroHref,
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
  it('covers every official-portrait character and keeps soft-launch aliases', () => {
    expect(HOLO_ROSTER_COUNT).toBe(274);
    expect(HOLO_POOL_SLUGS.size).toBe(274);
    expect(HOLO_POOL_SLUGS.has('special_week_special_dreamer')).toBe(true);
    expect(HOLO_POOL_SLUGS.has('daring_tact_107501')).toBe(true);
    expect(HOLO_LEGACY_ALIASES['daring_tact_107501']).toBe('daring_tact_107501');
    expect(HOLO_LEGACY_ALIASES['special_week_100101']).toBe('special_week_special_dreamer');
    expect(HOLO_LEGACY_ALIASES['gold_ship_100701']).toBe('gold_ship_red_strife');
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
  it('exposes the intro and ritual routes in all five locales', () => {
    expect(availableLocalesFor('/tools/daily-pack/')).toEqual(['en', 'ja', 'zh', 'zh-tw', 'ko']);
    expect(availableLocalesFor('/holo/')).toEqual(['en', 'ja', 'zh', 'zh-tw', 'ko']);
    expect(holoIntroHref('en')).toBe('/tools/daily-pack/');
    expect(holoIntroHref('zh')).toBe('/zh/tools/daily-pack/');
    expect(holoRitualHref('ja')).toBe('/ja/holo/');
    expect(holoRitualHref('zh-tw', 'UMA-20261128-2AG2')).toBe('/zh-tw/holo/UMA-20261128-2AG2');
  });
});
