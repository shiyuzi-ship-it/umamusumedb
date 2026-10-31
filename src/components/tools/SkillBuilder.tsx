import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { makeT, type Labels } from './tool-i18n';

/**
 * Skill Builder – plan a skill purchase list against a Skill Point budget.
 *
 * Costs are the real base costs from the game data (public/data/skills-lite.json, generated from skills.json).
 * Hint discounts: Lv1 10%, Lv2 20%, Lv3 30%, Lv4 35%, Lv5 40% off the base cost; the "Fast Learner" condition
 * takes a further 10% off (additive with the hint discount).
 * Sources: uma.guide/guides/skills, kamigame.jp/umamusume (ヒントの発生条件と効果), altema.jp/umamusume/hint.
 */

interface LiteSkill {
  id: string;
  name?: string; // localized name (locale files); falls back to name_en
  name_en: string;
  name_jp: string;
  rarity: 'normal' | 'gold' | 'unique' | 'evolved';
  skill_type: string;
  cost: number | null;
  effect: string;
  phases: string[];
  distance: string;
  style: string;
  location: string;
  effect_type: string;
  server: 'global' | 'jp';
  icon_url?: string | null;
}

// Hint level -> discount (%) of the base cost
const HINT_DISCOUNT = [0, 10, 20, 30, 35, 40];
const FAST_LEARNER_DISCOUNT = 10;

const RARITY_COLORS: Record<string, string> = {
  unique: 'text-pink-600 bg-pink-50',
  evolved: 'text-orange-600 bg-orange-50',
  gold: 'text-yellow-700 bg-yellow-50',
  normal: 'text-gray-600 bg-gray-50',
};

const PHASE_KEY: Record<string, string> = { start: 'sb_p_start', middle: 'sb_p_middle', late: 'sb_p_late', final: 'sb_p_final' };
const LOC_KEY: Record<string, string> = { corner: 'sb_l_corner', straight: 'sb_l_straight', slope: 'sb_l_slope' };

export default function SkillBuilder({ labels, locale = 'en' }: { labels?: Labels; locale?: string }) {
  const t = makeT(labels);
  const nameOf = (s: LiteSkill) => s.name || s.name_en;
  const dataUrl = `/data/skills-lite${locale === 'en' ? '' : '.' + locale}.json`;
  const [availableSkills, setAvailableSkills] = useState<LiteSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<LiteSkill[]>([]);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [filterDistance, setFilterDistance] = useState<string>('all');
  const [filterEffect, setFilterEffect] = useState<string>('all');
  const [globalOnly, setGlobalOnly] = useState<boolean>(locale !== 'ja');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [skillPointBudget, setSkillPointBudget] = useState<number>(1600);
  const [globalHintLevel, setGlobalHintLevel] = useState<number>(0);
  const [fastLearner, setFastLearner] = useState<boolean>(false);
  const [perSkillHints, setPerSkillHints] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(dataUrl)
      .then((r) => r.json())
      .then((data: LiteSkill[]) => {
        if (!cancelled) setAvailableSkills(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hintOf = (skill: LiteSkill) => perSkillHints[skill.id] ?? globalHintLevel;

  const getSkillCost = (skill: LiteSkill) => {
    const baseCost = skill.cost ?? 0;
    if (skill.rarity === 'unique' || !baseCost) return baseCost;
    const discount = HINT_DISCOUNT[hintOf(skill)] + (fastLearner ? FAST_LEARNER_DISCOUNT : 0);
    return Math.floor((baseCost * (100 - discount)) / 100);
  };

  const filteredSkills = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return availableSkills
      .filter((skill) => {
        if (globalOnly && skill.server !== 'global') return false;
        if (filterRarity !== 'all' && skill.rarity !== filterRarity) return false;
        if (filterStyle !== 'all' && skill.style !== filterStyle) return false;
        if (filterDistance !== 'all' && skill.distance !== filterDistance) return false;
        if (filterEffect !== 'all' && skill.effect_type !== filterEffect) return false;
        if (q && !`${skill.name ?? ''} ${skill.name_en} ${skill.name_jp} ${skill.effect}`.toLowerCase().includes(q)) return false;
        return !selectedSkills.some((s) => s.id === skill.id);
      })
      .slice(0, 200);
  }, [availableSkills, globalOnly, filterRarity, filterStyle, filterDistance, filterEffect, searchTerm, selectedSkills]);

  const totalCost = useMemo(
    () => selectedSkills.reduce((sum, skill) => sum + getSkillCost(skill), 0),
    [selectedSkills, globalHintLevel, perSkillHints, fastLearner]
  );

  const addSkill = (skill: LiteSkill) => {
    if (totalCost + getSkillCost(skill) <= skillPointBudget) setSelectedSkills([...selectedSkills, skill]);
  };
  const removeSkill = (id: string) => setSelectedSkills(selectedSkills.filter((s) => s.id !== id));
  const cycleSkillHint = (id: string) =>
    setPerSkillHints((prev) => ({ ...prev, [id]: ((prev[id] ?? globalHintLevel) + 1) % HINT_DISCOUNT.length }));

  const tags = (skill: LiteSkill) =>
    [
      ...skill.phases.map((p) => (PHASE_KEY[p] ? t(PHASE_KEY[p]) : p)),
      skill.distance !== 'all' ? t('sb_d_' + skill.distance) : '',
      skill.style !== 'all' ? t('sb_s_' + skill.style) : '',
      skill.location !== 'any' ? (LOC_KEY[skill.location] ? t(LOC_KEY[skill.location]) : skill.location) : '',
    ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{t('sb_title')}</h2>
          <button onClick={() => setSelectedSkills([])} className="text-sm text-gray-500 hover:text-gray-700">
            {t('sb_clear')}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {t('sb_intro')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t('sb_selected')}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">{t('sb_budget')}</span>
              <input
                type="number"
                value={skillPointBudget}
                onChange={(e) => setSkillPointBudget(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded text-sm"
                min="0"
                max="9999"
                step="100"
              />
              <span className="text-sm font-bold text-blue-600">
                {totalCost} / {skillPointBudget}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4 p-2 bg-yellow-50 rounded-lg flex-wrap">
            <span className="text-xs text-gray-600">{t('sb_hint_all')}</span>
            <select
              value={globalHintLevel}
              onChange={(e) => setGlobalHintLevel(parseInt(e.target.value))}
              className="text-xs border rounded px-2 py-1"
            >
              {HINT_DISCOUNT.map((d, lv) => (
                <option key={lv} value={lv}>
                  {lv === 0 ? t('sb_no_hint') : t('sb_hint_lv', { lv, d })}
                </option>
              ))}
            </select>
            <label className="text-xs text-gray-600 flex items-center gap-1">
              <input type="checkbox" checked={fastLearner} onChange={(e) => setFastLearner(e.target.checked)} />
              {t('sb_fast')}
            </label>
            <span className="text-[10px] text-gray-500">{t('sb_click_cost')}</span>
          </div>

          {totalCost > skillPointBudget && (
            <div className="mb-3 p-2 bg-red-50 rounded flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              {t('sb_over', { n: totalCost - skillPointBudget })}
            </div>
          )}

          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {selectedSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-400">{t('sb_select_hint')}</div>
            ) : (
              selectedSkills.map((skill) => {
                const actualCost = getSkillCost(skill);
                const baseCost = skill.cost ?? 0;
                const isDiscounted = actualCost < baseCost;
                return (
                  <div key={skill.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {skill.icon_url && <img src={skill.icon_url} alt="" width={20} height={20} className="w-5 h-5" />}
                        <span className="font-medium text-sm">{nameOf(skill)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${RARITY_COLORS[skill.rarity]}`}>{t('sb_r_' + skill.rarity)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{skill.effect}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cycleSkillHint(skill.id)}
                        className={`text-sm font-medium px-2 py-0.5 rounded cursor-pointer transition ${
                          isDiscounted ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                        }`}
                        title={t('sb_hint_title', { lv: hintOf(skill) })}
                      >
                        {isDiscounted && <span className="line-through text-gray-400 mr-1">{baseCost}</span>}
                        {actualCost}pt
                      </button>
                      <button onClick={() => removeSkill(skill.id)} className="text-red-500 hover:text-red-700">
                        ×
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedSkills.length > 0 && (
            <div className="p-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                {t('sb_summary')}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">{t('sb_skills')}</span>
                  <span className="font-bold ml-1">{selectedSkills.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('sb_gold')}</span>
                  <span className="font-bold ml-1">{selectedSkills.filter((s) => s.rarity === 'gold').length}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('sb_used')}</span>
                  <span className="font-bold ml-1">{skillPointBudget ? Math.round((totalCost / skillPointBudget) * 100) : 0}%</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('sb_left')}</span>
                  <span className="font-bold ml-1">{Math.max(0, skillPointBudget - totalCost)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="font-semibold">{t('sb_available')}</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('sb_search')}
                className="text-sm border rounded px-2 py-1 w-44"
              />
              <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">{t('sb_all_rarities')}</option>
                <option value="normal">{t('sb_r_normal')}</option>
                <option value="gold">{t('sb_r_gold')}</option>
                <option value="unique">{t('sb_r_unique')}</option>
                <option value="evolved">{t('sb_r_evolved')}</option>
              </select>
              <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">{t('sb_all_styles')}</option>
                <option value="escape">{t('sb_s_escape')}</option>
                <option value="lead">{t('sb_s_lead')}</option>
                <option value="between">{t('sb_s_between')}</option>
                <option value="chase">{t('sb_s_chase')}</option>
              </select>
              <select value={filterDistance} onChange={(e) => setFilterDistance(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">{t('sb_all_distances')}</option>
                <option value="sprint">{t('sb_d_sprint')}</option>
                <option value="mile">{t('sb_d_mile')}</option>
                <option value="medium">{t('sb_d_medium')}</option>
                <option value="long">{t('sb_d_long')}</option>
              </select>
              <select value={filterEffect} onChange={(e) => setFilterEffect(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">{t('sb_all_effects')}</option>
                <option value="speed">{t('sb_e_speed')}</option>
                <option value="acceleration">{t('sb_e_acceleration')}</option>
                <option value="recovery">{t('sb_e_recovery')}</option>
                <option value="positioning">{t('sb_e_positioning')}</option>
                <option value="stats">{t('sb_e_stats')}</option>
                <option value="debuff">{t('sb_e_debuff')}</option>
              </select>
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <input type="checkbox" checked={globalOnly} onChange={(e) => setGlobalOnly(e.target.checked)} />
                {t('sb_global_only')}
              </label>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading && <div className="text-center py-8 text-gray-400">{t('sb_loading')}</div>}
            {filteredSkills.map((skill) => {
              const skillCost = getSkillCost(skill);
              const baseCost = skill.cost ?? 0;
              const isDiscounted = skillCost < baseCost;
              const canAfford = totalCost + skillCost <= skillPointBudget;
              return (
                <button
                  key={skill.id}
                  onClick={() => addSkill(skill)}
                  disabled={!canAfford}
                  className={`w-full text-left p-2 rounded hover:bg-gray-50 transition ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {skill.icon_url && <img src={skill.icon_url} alt="" width={20} height={20} className="w-5 h-5" loading="lazy" />}
                        <span className="font-medium text-sm">{nameOf(skill)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${RARITY_COLORS[skill.rarity]}`}>{t('sb_r_' + skill.rarity)}</span>
                        {tags(skill).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{skill.effect}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {isDiscounted && <span className="line-through text-gray-300 mr-1">{baseCost}</span>}
                      <span className={isDiscounted ? 'text-green-600' : ''}>{skillCost}pt</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {!loading && filteredSkills.length === 0 && <div className="text-center py-8 text-gray-400">{t('sb_none')}</div>}
            {filteredSkills.length === 200 && <div className="text-center text-xs text-gray-400 py-2">{t('sb_first200')}</div>}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-yellow-600" />
          {t('sb_know')}
        </h4>
        <ul className="space-y-0.5 text-xs text-gray-700">
          <li>• {t('sb_k1')}</li>
          <li>• {t('sb_k2')}</li>
          <li>• {t('sb_k3')}</li>
        </ul>
      </div>
    </div>
  );
}
