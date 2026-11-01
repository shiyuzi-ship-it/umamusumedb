// Support card rankings computed from the public effect values on this site (public/data/supportCards.json).
// Not a tier list from anyone else: a transparent weighted sum, documented on the page. The weights are an editorial assumption, not game data.
//
// score = sum over effects of  weight[effect] x value of that effect at the card's maximum level (full limit break: SSR Lv50, SR Lv45, R Lv40).
// Weights are "roughly how many percent of training value one unit of this effect is worth". Cards are only compared within the same
// type and rarity; the score says nothing about a specific deck, scenario, character or the cards you already own.
export const CARD_TYPES = ['speed', 'stamina', 'power', 'guts', 'wisdom', 'friend', 'group'] as const;
export type CardType = (typeof CARD_TYPES)[number];
export const RARITIES = ['SSR', 'SR', 'R'] as const;

export const WEIGHTS: Record<string, number> = {
  friendship_bonus: 1,          // % — multiplies training gain when training with the card at full bond
  training_bonus: 1,            // % — multiplies every training the card takes part in
  speed_bonus: 3, stamina_bonus: 3, power_bonus: 3, guts_bonus: 3, wisdom_bonus: 3, // raw stat points added to each training with the card
  motivation_bonus: 0.2,        // % — amplifies the mood bonus
  specialty_priority: 0.15,     // appearance weight on its own training
  initial_bond: 0.4,            // starting bond points
  race_bonus: 0.4, fan_bonus: 0.1,
  hint_levels: 2, hint_frequency: 0.1, skill_point_bonus: 2,
  initial_speed: 0.1, initial_stamina: 0.1, initial_power: 0.1, initial_guts: 0.1, initial_wisdom: 0.1,
  wisdom_friendship_recovery: 0.2, event_recovery: 0.1, event_effectiveness: 0.15, failure_protection: 0.2, energy_cost_reduction: 0.3,
};
/** Order in which the weights are listed on the page */
export const WEIGHT_ORDER = Object.keys(WEIGHTS);

export interface RankedCard {
  card: any;
  score: number;
  maxLv: number;
  fr: number; tr: number; typeBonus: number; spec: number; bond: number; initStats: number; hint: number;
  glDate?: string; jpDate?: string;
}

const typeStatKey: Record<string, string> = { speed: 'speed_bonus', stamina: 'stamina_bonus', power: 'power_bonus', guts: 'guts_bonus', wisdom: 'wisdom_bonus' };

export function maxLevelOf(effects: Record<string, Record<string, number>>) {
  let m = 0;
  for (const v of Object.values(effects ?? {})) for (const k of Object.keys(v ?? {})) m = Math.max(m, Number(k.replace('lv', '')) || 0);
  return m;
}

export function scoreCard(card: any): RankedCard {
  const eff = (card.effects ?? {}) as Record<string, Record<string, number>>;
  const maxLv = maxLevelOf(eff);
  const at = (key: string) => Number(eff[key]?.[`lv${maxLv}`] ?? 0);
  let score = 0;
  for (const key of Object.keys(eff)) score += (WEIGHTS[key] ?? 0) * at(key);
  return {
    card, score: Math.round(score * 10) / 10, maxLv,
    fr: at('friendship_bonus'), tr: at('training_bonus'), typeBonus: typeStatKey[card.type] ? at(typeStatKey[card.type]) : 0,
    spec: at('specialty_priority'), bond: at('initial_bond'),
    initStats: at('initial_speed') + at('initial_stamina') + at('initial_power') + at('initial_guts') + at('initial_wisdom'),
    hint: at('hint_levels'), glDate: card.release_date_global || undefined, jpDate: card.release_date_jp || undefined,
  };
}

export interface Rankings {
  /** [rarity][type] -> cards released on Global, best first */
  global: Record<string, Record<string, RankedCard[]>>;
  /** [rarity][type] -> cards not yet on Global (JP only), best first */
  jpOnly: Record<string, Record<string, RankedCard[]>>;
  counts: { global: number; jpOnly: number };
}

const byScore = (a: RankedCard, b: RankedCard) => b.score - a.score || (b.jpDate ?? '').localeCompare(a.jpDate ?? '') || String(a.card.id).localeCompare(String(b.card.id));

export function buildRankings(cards: any[]): Rankings {
  const out: Rankings = { global: {}, jpOnly: {}, counts: { global: 0, jpOnly: 0 } };
  for (const r of RARITIES) { out.global[r] = {}; out.jpOnly[r] = {}; for (const t of CARD_TYPES) { out.global[r][t] = []; out.jpOnly[r][t] = []; } }
  for (const c of cards) {
    if (!CARD_TYPES.includes(c.type) || !RARITIES.includes(c.rarity)) continue;
    const rc = scoreCard(c);
    const bucket = c.release_date_global ? out.global : out.jpOnly;
    bucket[c.rarity][c.type].push(rc);
    out.counts[c.release_date_global ? 'global' : 'jpOnly']++;
  }
  for (const b of [out.global, out.jpOnly]) for (const r of RARITIES) for (const t of CARD_TYPES) b[r][t].sort(byScore);
  return out;
}
