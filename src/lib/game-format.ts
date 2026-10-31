// Shared helpers for the real game data imported by scripts/import-gametora.mjs

export const EFFECT_LABELS: Record<string, { en: string; ja: string; suffix?: string }> = {
  friendship_bonus: { en: 'Friendship Bonus', ja: '友情ボーナス', suffix: '%' },
  training_bonus: { en: 'Training Effectiveness', ja: 'トレーニング効果アップ', suffix: '%' },
  motivation_bonus: { en: 'Mood Effect', ja: 'やる気効果アップ', suffix: '%' },
  initial_bond: { en: 'Initial Friendship Gauge', ja: '初期絆ゲージ' },
  specialty_priority: { en: 'Specialty Priority', ja: '得意率アップ' },
  speed_bonus: { en: 'Speed Bonus', ja: 'スピードボーナス' },
  stamina_bonus: { en: 'Stamina Bonus', ja: 'スタミナボーナス' },
  power_bonus: { en: 'Power Bonus', ja: 'パワーボーナス' },
  guts_bonus: { en: 'Guts Bonus', ja: '根性ボーナス' },
  wisdom_bonus: { en: 'Wit Bonus', ja: '賢さボーナス' },
  skill_point_bonus: { en: 'Skill Point Bonus', ja: 'スキルPtボーナス' },
  race_bonus: { en: 'Race Bonus', ja: 'レースボーナス', suffix: '%' },
  fan_bonus: { en: 'Fan Bonus', ja: 'ファン数ボーナス', suffix: '%' },
  hint_levels: { en: 'Hint Levels', ja: 'ヒントLvアップ' },
  hint_frequency: { en: 'Hint Frequency', ja: 'ヒント発生率アップ', suffix: '%' },
  initial_speed: { en: 'Initial Speed', ja: '初期スピード' },
  initial_stamina: { en: 'Initial Stamina', ja: '初期スタミナ' },
  initial_power: { en: 'Initial Power', ja: '初期パワー' },
  initial_guts: { en: 'Initial Guts', ja: '初期根性' },
  initial_wisdom: { en: 'Initial Wit', ja: '初期賢さ' },
  max_speed: { en: 'Max Speed', ja: 'スピード上限' },
  max_stamina: { en: 'Max Stamina', ja: 'スタミナ上限' },
  max_power: { en: 'Max Power', ja: 'パワー上限' },
  max_guts: { en: 'Max Guts', ja: '根性上限' },
  max_wisdom: { en: 'Max Wit', ja: '賢さ上限' },
  event_recovery: { en: 'Event Recovery', ja: 'イベント回復量アップ', suffix: '%' },
  event_effectiveness: { en: 'Event Effectiveness', ja: 'イベント効果アップ', suffix: '%' },
  failure_protection: { en: 'Failure Protection', ja: '失敗率ダウン', suffix: '%' },
  energy_cost_reduction: { en: 'Energy Cost Reduction', ja: '体力消費ダウン', suffix: '%' },
  minigame_effectiveness: { en: 'Minigame Effectiveness', ja: 'ミニゲーム効果アップ', suffix: '%' },
  wisdom_friendship_recovery: { en: 'Wit Friendship Recovery', ja: '賢さ友情回復量アップ' },
};

export function effectLabel(key: string, lang: 'en' | 'ja' = 'en'): string {
  return EFFECT_LABELS[key]?.[lang] ?? key.replace(/_/g, ' ');
}

export function effectSuffix(key: string): string {
  return EFFECT_LABELS[key]?.suffix ?? '';
}

/** Value of a per-level effect map at the card's max level (falls back to the highest level present). */
export function effectAtMax(value: unknown, maxLevel?: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const map = value as Record<string, number | undefined>;
    if (maxLevel && typeof map[`lv${maxLevel}`] === 'number') return map[`lv${maxLevel}`] as number;
    for (const lv of [50, 45, 40, 35, 30, 25, 1]) {
      const v = map[`lv${lv}`];
      if (typeof v === 'number') return v;
    }
  }
  return 0;
}

export function maxLevelFor(card: { rarity?: string; max_level?: number }): number {
  if (card.max_level) return card.max_level;
  return card.rarity === 'SSR' ? 50 : card.rarity === 'SR' ? 45 : 40;
}

export function serverLabel(server: string | undefined, lang: 'en' | 'ja' = 'en'): string {
  if (server === 'global') return lang === 'ja' ? 'グローバル版配信中' : 'Released in Global';
  return lang === 'ja' ? '日本版のみ' : 'JP server only (not yet in Global)';
}
