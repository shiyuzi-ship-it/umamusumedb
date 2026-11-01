import { describe, it, expect } from 'vitest';
import { categories, skillLocales, MIN_SKILLS, categoryBySlug } from '../skill-categories';
import { availableLocalesFor } from '../i18n';
import { seoOpts } from '../skill-class';

describe('skill categories', () => {
  it('has unique slugs and no thin pages', () => {
    expect(new Set(categories.map((c) => c.slug)).size).toBe(categories.length);
    for (const c of categories) for (const l of c.locales) expect(c.ids[l]!.length).toBeGreaterThanOrEqual(MIN_SKILLS);
  });
  it('global categories exist in all 5 locales, evolved ones never in en', () => {
    for (const c of categories) {
      if (c.scope === 'global') expect(c.locales).toEqual(['en', 'ja', 'zh', 'zh-tw', 'ko']);
      else expect(c.locales).not.toContain('en');
    }
  });
  it('every listed skill has an indexable page in that locale', () => {
    for (const c of categories) for (const l of c.locales) for (const id of c.ids[l]!) expect(skillLocales.get(id)).toContain(l);
  });
  it('hreflang availability follows the category / skill locales', () => {
    const c = categories.find((x) => x.scope === 'evolved')!;
    expect(availableLocalesFor(`/skills/category/${c.slug}/`, seoOpts)).toEqual(c.locales);
    expect(availableLocalesFor('/skills/category/nope/', seoOpts)).toEqual([]);
    expect(categoryBySlug.has('gold-mile')).toBe(true);
    expect(availableLocalesFor('/skills/category/', seoOpts)).toHaveLength(5);
  });
});
