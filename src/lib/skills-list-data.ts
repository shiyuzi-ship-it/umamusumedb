// Build the compact skill entries for a locale (used by the list pages and by /skills-data/{locale}.json).
import { skills } from '@/lib/static-content';
import { skillIdsFor } from '@/lib/skill-class';
import { allNames, skillName, skillDesc } from '@/lib/localized.js';
import { skillRarityLabel } from '@/lib/page-helpers';
import type { Locale } from '@/lib/i18n';
import type { SkillEntry, SkillListKind } from '@/lib/skill-list-render';

export const skillKindFor = (loc: Locale): SkillListKind => (loc === 'en' ? 'en' : loc === 'ja' ? 'ja' : 'l10n');

const clean = <T extends Record<string, any>>(o: T): T => {
  for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === '') delete o[k];
  return o;
};

export function buildSkillEntries(loc: Locale, withSearch = false): SkillEntry[] {
  const kind = skillKindFor(loc);
  const ok = new Set(skillIdsFor(loc));
  const list = kind === 'l10n' ? (skills as any[]).filter((s) => ok.has(s.id)) : (skills as any[]);
  return list.map((s: any) => {
    const base = { i: s.id as string, ic: s.icon_url ?? undefined, r: s.rarity || undefined, v: s.server || undefined, t: (s.skill_type || '').toLowerCase() || undefined };
    if (kind === 'en') {
      const phase = [...(s.phases ?? []), ...(s.location === 'corner' || s.location === 'straight' ? [s.location] : [])].join(' ') || 'other';
      return clean({
        ...base, n: s.name_en, n2: s.name_jp || undefined, e1: s.effect || s.description_en || '—', e2: s.trigger_condition || undefined,
        p: phase, d: s.distance ?? 'all', y: s.style ?? 'all', x: s.effect_type ?? 'other',
        q: withSearch ? `${s.name_en} ${s.name_jp || ''} ${s.effect || ''} ${s.trigger_condition || ''}`.toLowerCase() : undefined,
      });
    }
    if (kind === 'ja') {
      return clean({
        ...base, n: s.name_jp || s.name_en, n2: s.name_en, e1: s.description_jp || s.effect || s.description_en || '—', e2: s.trigger_condition || undefined,
        q: withSearch ? `${s.name_en} ${s.name_jp || ''} ${s.effect || ''} ${s.trigger_condition || ''}`.toLowerCase() : undefined,
      });
    }
    return clean({
      ...base, n: skillName(s, loc), e1: skillDesc(s, loc), sb: skillRarityLabel(loc, s.rarity),
      q: withSearch ? allNames({ ...s, base_name_en: undefined }).join(' ') : undefined,
    });
  }) as SkillEntry[];
}
