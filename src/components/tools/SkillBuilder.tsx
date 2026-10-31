import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';

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

const PHASE_LABEL: Record<string, string> = { start: 'Early', middle: 'Mid', late: 'Late', final: 'Spurt' };

export default function SkillBuilder() {
  const [availableSkills, setAvailableSkills] = useState<LiteSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<LiteSkill[]>([]);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [filterDistance, setFilterDistance] = useState<string>('all');
  const [filterEffect, setFilterEffect] = useState<string>('all');
  const [globalOnly, setGlobalOnly] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [skillPointBudget, setSkillPointBudget] = useState<number>(1600);
  const [globalHintLevel, setGlobalHintLevel] = useState<number>(0);
  const [fastLearner, setFastLearner] = useState<boolean>(false);
  const [perSkillHints, setPerSkillHints] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch('/data/skills-lite.json')
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
        if (q && !`${skill.name_en} ${skill.name_jp} ${skill.effect}`.toLowerCase().includes(q)) return false;
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
      ...skill.phases.map((p) => PHASE_LABEL[p] ?? p),
      skill.distance !== 'all' ? skill.distance : '',
      skill.style !== 'all' ? skill.style : '',
      skill.location !== 'any' ? skill.location : '',
    ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Skill Point calculator</h2>
          <button onClick={() => setSelectedSkills([])} className="text-sm text-gray-500 hover:text-gray-700">
            Clear All
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Base skill costs come from the game data. A hint level reduces the cost by 10 / 20 / 30 / 35 / 40% (Lv1–Lv5);
          the Fast Learner condition takes another 10% off. Costs may differ by 1 SP from the game because of rounding.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Selected Skills</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Budget:</span>
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
            <span className="text-xs text-gray-600">Hint level (all skills):</span>
            <select
              value={globalHintLevel}
              onChange={(e) => setGlobalHintLevel(parseInt(e.target.value))}
              className="text-xs border rounded px-2 py-1"
            >
              {HINT_DISCOUNT.map((d, lv) => (
                <option key={lv} value={lv}>
                  {lv === 0 ? 'No hint (full price)' : `Hint Lv${lv} (-${d}%)`}
                </option>
              ))}
            </select>
            <label className="text-xs text-gray-600 flex items-center gap-1">
              <input type="checkbox" checked={fastLearner} onChange={(e) => setFastLearner(e.target.checked)} />
              Fast Learner (-10%)
            </label>
            <span className="text-[10px] text-gray-500">Click a cost badge to change that skill's hint level</span>
          </div>

          {totalCost > skillPointBudget && (
            <div className="mb-3 p-2 bg-red-50 rounded flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              Over budget by {totalCost - skillPointBudget} skill points
            </div>
          )}

          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {selectedSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Select skills from the list on the right</div>
            ) : (
              selectedSkills.map((skill) => {
                const actualCost = getSkillCost(skill);
                const baseCost = skill.cost ?? 0;
                const isDiscounted = actualCost < baseCost;
                return (
                  <div key={skill.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{skill.name_en}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${RARITY_COLORS[skill.rarity]}`}>{skill.rarity}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{skill.effect}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cycleSkillHint(skill.id)}
                        className={`text-sm font-medium px-2 py-0.5 rounded cursor-pointer transition ${
                          isDiscounted ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                        }`}
                        title={`Hint level ${hintOf(skill)} – click to change`}
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
                Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Skills:</span>
                  <span className="font-bold ml-1">{selectedSkills.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Gold skills:</span>
                  <span className="font-bold ml-1">{selectedSkills.filter((s) => s.rarity === 'gold').length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Budget used:</span>
                  <span className="font-bold ml-1">{skillPointBudget ? Math.round((totalCost / skillPointBudget) * 100) : 0}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Points left:</span>
                  <span className="font-bold ml-1">{Math.max(0, skillPointBudget - totalCost)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="font-semibold">Available Skills</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or effect"
                className="text-sm border rounded px-2 py-1 w-44"
              />
              <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">All Rarities</option>
                <option value="normal">Normal</option>
                <option value="gold">Gold</option>
                <option value="unique">Unique</option>
                <option value="evolved">Evolved</option>
              </select>
              <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">All Styles</option>
                <option value="escape">Front Runner</option>
                <option value="lead">Pace Chaser</option>
                <option value="between">Late Surger</option>
                <option value="chase">End Closer</option>
              </select>
              <select value={filterDistance} onChange={(e) => setFilterDistance(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">All Distances</option>
                <option value="sprint">Sprint</option>
                <option value="mile">Mile</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
              <select value={filterEffect} onChange={(e) => setFilterEffect(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="all">All Effects</option>
                <option value="speed">Speed</option>
                <option value="acceleration">Acceleration</option>
                <option value="recovery">Recovery</option>
                <option value="positioning">Position</option>
                <option value="stats">Stat boost</option>
                <option value="debuff">Debuff</option>
              </select>
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <input type="checkbox" checked={globalOnly} onChange={(e) => setGlobalOnly(e.target.checked)} />
                Global server only
              </label>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading && <div className="text-center py-8 text-gray-400">Loading skills…</div>}
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
                        <span className="font-medium text-sm">{skill.name_en}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${RARITY_COLORS[skill.rarity]}`}>{skill.rarity}</span>
                        {tags(skill).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                            {t}
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
            {!loading && filteredSkills.length === 0 && <div className="text-center py-8 text-gray-400">No skills match your filters</div>}
            {filteredSkills.length === 200 && <div className="text-center text-xs text-gray-400 py-2">Showing the first 200 matches – refine your search.</div>}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-yellow-600" />
          Good to know
        </h4>
        <ul className="space-y-0.5 text-xs text-gray-700">
          <li>• Non-green skills activate with a chance of max(20, 100 − 9000 / Wit)% — more Wit means more reliable skills (uma.guide/guides/skills).</li>
          <li>• A skill can only be bought after you have at least one hint for it (or the trainee unlocks it through potential/awakening).</li>
          <li>• Unique skills are not bought with Skill Points; their cost is shown as 0.</li>
        </ul>
      </div>
    </div>
  );
}
