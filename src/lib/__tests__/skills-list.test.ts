import { describe, it, expect } from 'vitest';
import { matchSkill, filtersActive, normalizeQuery, type SkillFilters } from '../skills-list-client';
import { pagerHtml, pageSlice, totalPages, pageHref, pageNumbers, PAGE_SIZE } from '../pagination';
import { renderSkillCard, type SkillEntry } from '../skill-list-render';
import { buildSkillEntries } from '../skills-list-data';

const none: SkillFilters = { q: '', rarity: 'all', type: 'all', phase: 'all', distance: 'all', style: 'all', effect: 'all', server: '' };
const e: SkillEntry = { i: 'a_1', n: 'Certain Victory', n2: '絶対は、ボクだ', r: 'unique', t: 'unique', p: 'final corner', d: 'all', y: 'all', x: 'speed', v: 'global', e1: 'Speed up', q: normalizeQuery('certain victory 絶対は、ボクだ') };

describe('skills list filters', () => {
  it('detects active filters', () => {
    expect(filtersActive(none)).toBe(false);
    expect(filtersActive({ ...none, q: ' ' })).toBe(false);
    expect(filtersActive({ ...none, phase: 'final' })).toBe(true);
  });
  it('matches search ignoring spaces/case and by every filter', () => {
    expect(matchSkill(e, { ...none, q: 'Certain  Victory' })).toBe(true);
    expect(matchSkill(e, { ...none, q: 'nope' })).toBe(false);
    expect(matchSkill(e, { ...none, rarity: 'gold' })).toBe(false);
    expect(matchSkill(e, { ...none, phase: 'corner', effect: 'speed', rarity: 'unique' })).toBe(true);
    expect(matchSkill(e, { ...none, phase: 'start' })).toBe(false);
    expect(matchSkill(e, { ...none, server: 'jp' })).toBe(false);
  });
});

describe('pagination', () => {
  it('slices and links pages', () => {
    const arr = Array.from({ length: 250 }, (_, i) => i);
    expect(totalPages(arr.length)).toBe(3);
    expect(pageSlice(arr, 3)).toHaveLength(250 - 2 * PAGE_SIZE);
    expect(pageHref('/skills/', 1)).toBe('/skills/');
    expect(pageHref('/skills/', 2)).toBe('/skills/page/2/');
    expect(pageNumbers(3)).toEqual([2, 3]);
  });
  it('pager links every page', () => {
    const html = pagerHtml('/skills/', 2, 4, { aria: 'x', prev: 'P', next: 'N', page: 'Page' });
    for (const h of ['/skills/"', '/skills/page/3/', '/skills/page/4/']) expect(html).toContain(h);
    expect(html).toContain('aria-current="page"');
    expect(pagerHtml('/skills/', 1, 1, { aria: 'x', prev: 'P', next: 'N', page: 'Page' })).toBe('');
  });
});

describe('skill card render + data', () => {
  it('escapes html and links to the localized page', () => {
    const html = renderSkillCard('l10n', { ...e, n: '<b>x</b>', sb: 'Unique' }, { prefix: '/ko', jpLabel: 'JP' });
    expect(html).toContain('href="/ko/skills/a_1/"');
    expect(html).not.toContain('<b>x</b>');
  });
  it('builds one entry per skill, with a real icon or the shared placeholder for every skill', () => {
    const en = buildSkillEntries('en');
    expect(en.length).toBeGreaterThan(1000);
    expect(new Set(en.map((s) => s.i)).size).toBe(en.length);
    expect(en.every((s) => !s.ic || s.ic.startsWith('/img/skills/'))).toBe(true);
    expect(en.find((s) => s.i === 'saintesss_trial_204452')?.ic).toBe('/img/skills/placeholder.webp');
    expect(buildSkillEntries('zh').length).toBeLessThan(en.length);
  });
});
