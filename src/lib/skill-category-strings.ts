// Strings for the skill category pages (/skills/category/...). zh-tw = OpenCC conversion of zh (+ twFix), like the other pages.
import * as OpenCC from 'opencc-js';
import type { Locale } from './i18n';
import { twFix } from './tw-fix';

type Dict = Record<string, string>;

const en: Dict = {
  navSkillGroups: 'Skill categories',
  adj_kind_evolved: 'Evolved',
  adj_rarity_gold: 'Gold', adj_rarity_normal: 'White', adj_rarity_unique: 'Unique',
  adj_effect_speed: 'Speed', adj_effect_acceleration: 'Acceleration', adj_effect_recovery: 'Recovery', adj_effect_debuff: 'Debuff',
  adj_distance_sprint: 'Sprint', adj_distance_mile: 'Mile', adj_distance_medium: 'Medium-Distance', adj_distance_long: 'Long-Distance',
  adj_style_escape: 'Front Runner', adj_style_lead: 'Pace Chaser', adj_style_between: 'Late Surger', adj_style_chase: 'End Closer',
  adj_surface_dirt: 'Dirt', adj_surface_turf: 'Turf',
  adj_phase_start: 'Early-Race', adj_phase_middle: 'Mid-Race', adj_phase_late: 'Late-Race', adj_phase_final: 'Last-Spurt',
  adj_location_corner: 'Corner', adj_location_straight: 'Straight', adj_location_slope: 'Slope',
  joiner: ' ',
  title: '{adj} Skills in Uma Musume: Full List ({n})',
  titleEvolved: '{adj} Skills in Uma Musume (JP): Full List ({n})',
  description: 'All {n} {adj} skills in Uma Musume Pretty Derby (Global): effect text, SP cost, duration, and the characters and support cards that give each skill.',
  descriptionEvolved: 'All {n} {adj} skills from Uma Musume Pretty Derby (JP server): effect text, SP cost, and the characters and support cards linked to each skill.',
  h1: '{adj} Skills in Uma Musume',
  intro: 'These are the {n} {adj} skills in the Global data of this site, sorted by SP cost. Every row shows the effect text, SP cost and duration, and links to the characters and support cards that can give the skill.',
  introEvolved: 'These are the {n} {adj} skills of the JP server (evolved skills are not in Global yet), sorted by SP cost. Every row shows the effect text and SP cost, and links to related characters and support cards.',
  groupNoteTitle: 'How skills are grouped',
  def_kind: 'Evolved: upgraded versions of normal skills that currently exist on the JP server only.',
  def_rarity: 'Rarity "{v}": the in-game rarity of the skill (gold = rare, white = normal, unique = a character\'s own skill).',
  def_effect: 'Effect "{v}": the main effect of the skill, taken from its effect text (speed boost, acceleration, stamina recovery, or a debuff on rivals).',
  def_distance: 'Distance "{v}": the skill only activates in races of this distance.',
  def_style: 'Running style "{v}": the skill only activates for this running style.',
  def_surface: 'Surface "{v}": the skill is tagged for this track surface in the game text.',
  def_phase: 'Timing "{v}": the part of the race in which the skill activates.',
  def_location: 'Place "{v}": the part of the course where the skill activates.',
  colSkill: 'Skill', colEffect: 'Effect', colCost: 'SP', colDuration: 'Duration', colGivenBy: 'Given by',
  chars: 'Characters', cards: 'Support cards',
  truncated: 'Showing the first {max} of {n} skills (highest SP cost first). Narrow it down with the more specific lists below or use the skill search.',
  moreLists: 'More skill lists', allSkills: 'All skills (search and filters)', hubLink: 'All skill categories',
  hubTitle: 'Uma Musume Skill Categories: Gold, White, Unique by Distance, Style and Effect',
  hubDescription: 'Browse Uma Musume skills by rarity, distance, running style, surface, effect and timing: gold and white skill lists, recovery, acceleration and speed skills, with effects and SP costs.',
  hubH1: 'Uma Musume Skill Categories',
  hubIntro: 'Every list below is generated from the skill data of this site. A list only exists when enough skills match, so each page is a real, complete list.',
  hubGlobal: 'Skills in Global', hubEvolved: 'Evolved skills (JP server)',
  chipsTitle: 'Skill lists this skill belongs to',
  skillsWord: 'skills',
};

const ja: Dict = {
  navSkillGroups: 'スキル分類',
  adj_kind_evolved: '進化',
  adj_rarity_gold: '金', adj_rarity_normal: '白', adj_rarity_unique: '固有',
  adj_effect_speed: '速度', adj_effect_acceleration: '加速', adj_effect_recovery: '回復', adj_effect_debuff: 'デバフ',
  adj_distance_sprint: '短距離', adj_distance_mile: 'マイル', adj_distance_medium: '中距離', adj_distance_long: '長距離',
  adj_style_escape: '逃げ', adj_style_lead: '先行', adj_style_between: '差し', adj_style_chase: '追込',
  adj_surface_dirt: 'ダート', adj_surface_turf: '芝',
  adj_phase_start: '序盤', adj_phase_middle: '中盤', adj_phase_late: '終盤', adj_phase_final: 'ラストスパート',
  adj_location_corner: 'コーナー', adj_location_straight: '直線', adj_location_slope: '坂',
  joiner: '・',
  title: 'ウマ娘 {adj}スキル一覧（全{n}件）',
  titleEvolved: 'ウマ娘 {adj}スキル一覧（全{n}件）',
  description: 'ウマ娘の{adj}スキル全{n}件（グローバル版）。効果・必要Pt・持続時間と、そのスキルを持つウマ娘・サポートカードを一覧で確認できます。',
  descriptionEvolved: 'ウマ娘の{adj}スキル全{n}件（日本サーバー）。効果・必要Ptと、関連するウマ娘・サポートカードを一覧で確認できます。',
  h1: 'ウマ娘 {adj}スキル一覧',
  intro: 'このサイトのグローバル版データにある{adj}スキル{n}件を、必要Pt順に並べました。各行に効果・必要Pt・持続時間と、そのスキルを持つウマ娘・サポートカードへのリンクを載せています。',
  introEvolved: '日本サーバーの{adj}スキル{n}件を必要Pt順に並べました（進化スキルはグローバル版にはまだありません）。各行に効果・必要Ptと、関連するウマ娘・サポートカードへのリンクを載せています。',
  groupNoteTitle: '分類の基準',
  def_kind: '進化: 通常スキルの上位版で、現在は日本サーバーのみにあります。',
  def_rarity: 'レア度「{v}」: ゲーム内のスキルのレア度（金＝レア、白＝通常、固有＝ウマ娘専用）。',
  def_effect: '効果「{v}」: 効果テキストから判定したスキルの主効果（速度アップ・加速・持久力回復・他のウマ娘へのデバフ）。',
  def_distance: '距離「{v}」: この距離のレースでのみ発動するスキル。',
  def_style: '脚質「{v}」: この脚質のときだけ発動するスキル。',
  def_surface: 'バ場「{v}」: スキル説明にこのバ場の指定があるスキル。',
  def_phase: '発動時期「{v}」: レースのどの局面で発動するか。',
  def_location: '発動場所「{v}」: コースのどの場所で発動するか。',
  colSkill: 'スキル', colEffect: '効果', colCost: 'Pt', colDuration: '持続', colGivenBy: '入手元',
  chars: 'ウマ娘', cards: 'サポートカード',
  truncated: '全{n}件のうち、必要Ptが高い順に先頭{max}件を表示しています。下の細かい分類やスキル検索で絞り込めます。',
  moreLists: 'ほかのスキル一覧', allSkills: 'スキル一覧（検索・絞り込み）', hubLink: 'スキル分類の一覧',
  hubTitle: 'ウマ娘 スキル分類：金・白・固有スキルを距離・脚質・効果別に',
  hubDescription: 'ウマ娘のスキルをレア度・距離・脚質・バ場・効果・発動時期で分類。金スキル・白スキル一覧、回復・加速・速度スキルを効果と必要Pt付きで確認できます。',
  hubH1: 'ウマ娘 スキル分類',
  hubIntro: '以下の一覧はすべてこのサイトのスキルデータから自動生成しています。十分な件数が該当する分類だけを掲載しているため、どのページも実際の一覧です。',
  hubGlobal: 'グローバル版のスキル', hubEvolved: '進化スキル（日本サーバー）',
  chipsTitle: 'このスキルが載っている一覧',
  skillsWord: 'スキル',
};

const zh: Dict = {
  navSkillGroups: '技能分类',
  adj_kind_evolved: '进化',
  adj_rarity_gold: '金色', adj_rarity_normal: '白色', adj_rarity_unique: '固有',
  adj_effect_speed: '速度', adj_effect_acceleration: '加速', adj_effect_recovery: '回复', adj_effect_debuff: '减益',
  adj_distance_sprint: '短距离', adj_distance_mile: '一哩', adj_distance_medium: '中距离', adj_distance_long: '长距离',
  adj_style_escape: '领头', adj_style_lead: '前列', adj_style_between: '居中', adj_style_chase: '后追',
  adj_surface_dirt: '沙地', adj_surface_turf: '草地',
  adj_phase_start: '序盘', adj_phase_middle: '中盘', adj_phase_late: '终盘', adj_phase_final: '最后冲刺',
  adj_location_corner: '弯道', adj_location_straight: '直线', adj_location_slope: '坡道',
  joiner: '·',
  title: '赛马娘{adj}技能一览（共{n}个）',
  titleEvolved: '赛马娘{adj}技能一览（共{n}个）',
  description: '赛马娘{adj}技能全部{n}个（国际服）：效果说明、技能点消耗、持续时间，以及拥有该技能的角色和支援卡。',
  descriptionEvolved: '赛马娘{adj}技能全部{n}个（日服）：效果说明、技能点消耗，以及相关的角色和支援卡。',
  h1: '赛马娘{adj}技能一览',
  intro: '本站国际服数据中的{adj}技能共{n}个，按技能点消耗从高到低排列。每一行都有效果说明、技能点消耗、持续时间，并链接到拥有该技能的角色和支援卡。',
  introEvolved: '日服的{adj}技能共{n}个（进化技能国际服尚未实装），按技能点消耗从高到低排列。每一行都有效果说明、技能点消耗，并链接到相关角色和支援卡。',
  groupNoteTitle: '分类依据',
  def_kind: '进化：普通技能的升级版，目前只存在于日服。',
  def_rarity: '稀有度“{v}”：技能在游戏内的稀有度（金色＝稀有，白色＝普通，固有＝角色专属技能）。',
  def_effect: '效果“{v}”：根据效果说明判断的技能主要效果（提升速度、加速、回复体力或对其他赛马娘减益）。',
  def_distance: '距离“{v}”：只在该距离的比赛中发动的技能。',
  def_style: '跑法“{v}”：只在该跑法时发动的技能。',
  def_surface: '场地“{v}”：技能说明中指定了该场地的技能。',
  def_phase: '发动时机“{v}”：技能在比赛的哪个阶段发动。',
  def_location: '发动位置“{v}”：技能在赛道的哪个位置发动。',
  colSkill: '技能', colEffect: '效果', colCost: '技能点', colDuration: '持续', colGivenBy: '获得来源',
  chars: '角色', cards: '支援卡',
  truncated: '共{n}个技能，这里按技能点消耗从高到低显示前{max}个。可用下方更细的分类或技能搜索继续缩小范围。',
  moreLists: '更多技能列表', allSkills: '全部技能（搜索与筛选）', hubLink: '全部技能分类',
  hubTitle: '赛马娘技能分类：金色、白色、固有技能按距离、跑法、效果整理',
  hubDescription: '按稀有度、距离、跑法、场地、效果和发动时机整理赛马娘技能：金技能、白技能列表，回复、加速、速度技能，附效果说明和技能点消耗。',
  hubH1: '赛马娘技能分类',
  hubIntro: '下面所有列表都由本站的技能数据自动生成。只有符合条件的技能足够多时才会生成分类，所以每个页面都是真实完整的列表。',
  hubGlobal: '国际服技能', hubEvolved: '进化技能（日服）',
  chipsTitle: '这个技能所在的列表',
  skillsWord: '技能',
};

const ko: Dict = {
  navSkillGroups: '스킬 분류',
  adj_kind_evolved: '진화',
  adj_rarity_gold: '골드', adj_rarity_normal: '일반(흰색)', adj_rarity_unique: '고유',
  adj_effect_speed: '속도', adj_effect_acceleration: '가속', adj_effect_recovery: '회복', adj_effect_debuff: '디버프',
  adj_distance_sprint: '단거리', adj_distance_mile: '마일', adj_distance_medium: '중거리', adj_distance_long: '장거리',
  adj_style_escape: '도주', adj_style_lead: '선행', adj_style_between: '선입', adj_style_chase: '추입',
  adj_surface_dirt: '더트', adj_surface_turf: '잔디',
  adj_phase_start: '초반', adj_phase_middle: '중반', adj_phase_late: '종반', adj_phase_final: '라스트 스퍼트',
  adj_location_corner: '코너', adj_location_straight: '직선', adj_location_slope: '언덕',
  joiner: ' · ',
  title: '우마무스메 {adj} 스킬 목록 (총 {n}개)',
  titleEvolved: '우마무스메 {adj} 스킬 목록 (총 {n}개)',
  description: '우마무스메 {adj} 스킬 {n}개 전체(글로벌): 효과, 스킬 포인트, 지속 시간과 해당 스킬을 가진 캐릭터·서포트 카드.',
  descriptionEvolved: '우마무스메 {adj} 스킬 {n}개 전체(일본 서버): 효과, 스킬 포인트와 관련 캐릭터·서포트 카드.',
  h1: '우마무스메 {adj} 스킬 목록',
  intro: '이 사이트 글로벌 데이터의 {adj} 스킬 {n}개를 스킬 포인트가 높은 순으로 정리했습니다. 각 줄에 효과, 스킬 포인트, 지속 시간과 해당 스킬을 가진 캐릭터·서포트 카드 링크가 있습니다.',
  introEvolved: '일본 서버의 {adj} 스킬 {n}개를 스킬 포인트 순으로 정리했습니다(진화 스킬은 아직 글로벌에 없습니다). 각 줄에 효과, 스킬 포인트와 관련 캐릭터·서포트 카드 링크가 있습니다.',
  groupNoteTitle: '분류 기준',
  def_kind: '진화: 일반 스킬의 상위 버전으로 현재 일본 서버에만 있습니다.',
  def_rarity: '레어도 "{v}": 게임 내 스킬 레어도 (골드 = 레어, 일반 = 흰색, 고유 = 캐릭터 전용).',
  def_effect: '효과 "{v}": 효과 텍스트로 판단한 스킬의 주요 효과 (속도 상승, 가속, 체력 회복, 상대 디버프).',
  def_distance: '거리 "{v}": 이 거리의 레이스에서만 발동하는 스킬.',
  def_style: '작전 "{v}": 이 작전일 때만 발동하는 스킬.',
  def_surface: '마장 "{v}": 스킬 설명에 이 마장이 지정된 스킬.',
  def_phase: '발동 시기 "{v}": 레이스의 어느 구간에서 발동하는지.',
  def_location: '발동 위치 "{v}": 코스의 어느 위치에서 발동하는지.',
  colSkill: '스킬', colEffect: '효과', colCost: 'SP', colDuration: '지속', colGivenBy: '획득처',
  chars: '캐릭터', cards: '서포트 카드',
  truncated: '총 {n}개 중 스킬 포인트가 높은 순으로 {max}개를 보여줍니다. 아래의 더 세부적인 분류나 스킬 검색으로 좁혀 보세요.',
  moreLists: '다른 스킬 목록', allSkills: '전체 스킬 (검색·필터)', hubLink: '전체 스킬 분류',
  hubTitle: '우마무스메 스킬 분류: 골드·일반·고유 스킬을 거리·작전·효과별로',
  hubDescription: '레어도, 거리, 작전, 마장, 효과, 발동 시기별로 우마무스메 스킬을 정리했습니다. 골드·일반 스킬 목록, 회복·가속·속도 스킬을 효과와 스킬 포인트와 함께 확인하세요.',
  hubH1: '우마무스메 스킬 분류',
  hubIntro: '아래 목록은 모두 이 사이트의 스킬 데이터에서 자동 생성됩니다. 충분한 수의 스킬이 해당될 때만 분류가 생기므로 모든 페이지가 실제 전체 목록입니다.',
  hubGlobal: '글로벌 스킬', hubEvolved: '진화 스킬 (일본 서버)',
  chipsTitle: '이 스킬이 속한 목록',
  skillsWord: '스킬',
};

const toTw = OpenCC.Converter({ from: 'cn', to: 'twp' });
const zhTw: Dict = Object.fromEntries(Object.entries(zh).map(([k, v]) => [k, /^[\x00-\x7f]*$/.test(v) ? v : twFix(toTw(v)).replace(/回覆/g, '回復')]));
const zhFixed: Dict = Object.fromEntries(Object.entries(zh).map(([k, v]) => [k, twFix(v)]));
export const CATEGORY_STRINGS: Record<Locale, Dict> = { en, ja, zh: zhFixed, 'zh-tw': zhTw, ko };

export function cs(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  let v = CATEGORY_STRINGS[locale]?.[key] ?? en[key] ?? key;
  for (const [k, val] of Object.entries(vars)) v = v.split(`{${k}}`).join(String(val));
  return v;
}

import type { Category } from './skill-categories';
/** "Gold Mile" / "金・マイル" ... the adjective phrase of a category in a locale. */
export function categoryAdj(loc: Locale, c: Category): string {
  return c.parts.map(([k, v]) => cs(loc, `adj_${k}_${v}`)).join(cs(loc, 'joiner'));
}
export function categoryTexts(loc: Locale, c: Category) {
  const n = c.ids[loc]?.length ?? 0;
  const adj = categoryAdj(loc, c);
  const ev = c.scope === 'evolved';
  return {
    n, adj,
    title: cs(loc, ev ? 'titleEvolved' : 'title', { adj, n }),
    description: cs(loc, ev ? 'descriptionEvolved' : 'description', { adj, n }),
    h1: cs(loc, 'h1', { adj }),
    intro: cs(loc, ev ? 'introEvolved' : 'intro', { adj, n }),
  };
}
