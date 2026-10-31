import charactersData from '../../public/data/characters.json';
import supportCardsData from '../../public/data/supportCards.json';
import skillsData from '../../public/data/skills.json';
import realHorsesData from '../../public/data/realHorses.json';

import type {
  Character,
  CharacterAptitudes,
  CharacterGrowthRates,
  CharacterRecord,
  CharacterStats,
  SupportCard,
  SupportCardRecord,
  Skill,
  RealHorsesPayload
} from '@/types';
import { parseJsonField } from './parse-json-field';

const DEFAULT_STATS: CharacterStats = {
  speed: 0,
  stamina: 0,
  power: 0,
  guts: 0,
  wisdom: 0
};

const DEFAULT_APTITUDES: CharacterAptitudes = {
  turf: 'G',
  dirt: 'G',
  sprint: 'G',
  mile: 'G',
  medium: 'G',
  long: 'G',
  escape: 'G',
  lead: 'G',
  between: 'G',
  chase: 'G'
};

const charactersRaw = charactersData as CharacterRecord[];
const supportCardsRaw = supportCardsData as SupportCardRecord[];

// Process character data
export const characters: Character[] = charactersRaw.map((char) => {
  const initialStats =
    parseJsonField<CharacterStats>(char.initial_stats, {
      fallback: DEFAULT_STATS,
      context: `character:${char.id}.initial_stats`
    }) ?? DEFAULT_STATS;

  const maxStats =
    parseJsonField<CharacterStats>(char.max_stats, {
      fallback: DEFAULT_STATS,
      context: `character:${char.id}.max_stats`
    }) ?? DEFAULT_STATS;

  const growthRates = parseJsonField<CharacterGrowthRates>(char.growth_rates, {
    fallback: {},
    context: `character:${char.id}.growth_rates`
  }) ?? {};

  const aptitudes = parseJsonField<CharacterAptitudes>(char.aptitudes, {
    fallback: DEFAULT_APTITUDES,
    context: `character:${char.id}.aptitudes`
  }) ?? DEFAULT_APTITUDES;

  const uniqueSkill = parseJsonField(char.unique_skill, {
    fallback: null,
    context: `character:${char.id}.unique_skill`
  }) ?? null;

  const awakeningSkills =
    parseJsonField<string[]>(char.awakening_skills, {
      fallback: [],
      context: `character:${char.id}.awakening_skills`
    }) ?? [];

  const innateSkills =
    parseJsonField<string[]>(char.innate_skills, {
      fallback: [],
      context: `character:${char.id}.innate_skills`
    }) ?? [];

  const attributes =
    parseJsonField<CharacterStats>(char.attributes, {
      fallback: initialStats,
      context: `character:${char.id}.attributes`
    }) ?? initialStats;

  const skills =
    parseJsonField<string[]>(char.skills, {
      fallback: awakeningSkills,
      context: `character:${char.id}.skills`
    }) ?? awakeningSkills;

  return {
    ...char,
    initial_stats: initialStats,
    max_stats: maxStats,
    growth_rates: growthRates,
    aptitudes,
    unique_skill: uniqueSkill,
    awakening_skills: awakeningSkills,
    attributes,
    skills,
    innate_skills: innateSkills,
    initial_stats_4star: parseJsonField<CharacterStats>(char.initial_stats_4star) ?? null,
    initial_stats_5star: parseJsonField<CharacterStats>(char.initial_stats_5star) ?? null
  };
});

// Process support card data
export const supportCards: SupportCard[] = supportCardsRaw.map((card) => ({
  ...card,
  effects:
    parseJsonField(card.effects, {
      fallback: {},
      context: `support_card:${card.id}.effects`
    }) ?? {},
  skills:
    parseJsonField<string[]>(card.skills, {
      fallback: [],
      context: `support_card:${card.id}.skills`
    }) ?? [],
  events:
    parseJsonField<string[]>(card.events, {
      fallback: [],
      context: `support_card:${card.id}.events`
    }) ?? [],
  hint_skills:
    parseJsonField<string[]>(card.hint_skills, {
      fallback: [],
      context: `support_card:${card.id}.hint_skills`
    }) ?? [],
  event_skills:
    parseJsonField<string[]>(card.event_skills, {
      fallback: [],
      context: `support_card:${card.id}.event_skills`
    }) ?? []
}));

// Export skills
export const skills = skillsData as Skill[];

// Export prototype racehorse data (Wikidata / CC0)
export const realHorses = realHorsesData as RealHorsesPayload;

// Helper functions
export function getCharacterById(id: string) {
  return characters.find((char) => char.id === id) || null;
}

export function getSupportCardById(id: string) {
  return supportCards.find((card) => card.id === id) || null;
}

export function getSkillById(id: string) {
  return skills.find((skill) => skill.id === id) || null;
}
