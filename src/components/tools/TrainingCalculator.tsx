import React, { useMemo, useState } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';

/**
 * Training stat-gain calculator.
 *
 * StatGain = floor( (Base + ΣStatBonus)
 *                   × Π(1 + Friendship_i / 100)
 *                   × (1 + Mood × (1 + ΣMoodEffect / 100))
 *                   × (1 + ΣTrainingEffect / 100)
 *                   × (1 + 0.05 × NumberOfCards)
 *                   × (1 + Growth / 100) )
 *
 * Sources: uma.guide/guides/career-mechanics, umareference.com, game8.co/games/Umamusume.
 * Base values are the facility Lv1–Lv5 values per scenario (URA Finale / Unity Cup).
 * Friendship only applies while the card's friendship gauge is 80+ on its specialty training; it is multiplicative across cards.
 */

type StatKey = 'speed' | 'stamina' | 'power' | 'guts' | 'wisdom';
const STATS: StatKey[] = ['speed', 'stamina', 'power', 'guts', 'wisdom'];
const STAT_LABEL: Record<StatKey, string> = { speed: 'Speed', stamina: 'Stamina', power: 'Power', guts: 'Guts', wisdom: 'Wit' };

type Gain = Partial<Record<StatKey, number>>;
interface Level {
  gain: Gain;
  sp: number;
  energy: number;
}

const lv = (list: [Gain, number][], sp: number): Level[] => list.map(([gain, energy]) => ({ gain, sp, energy }));

const TABLES: Record<'ura' | 'unity', Record<StatKey, Level[]>> = {
  ura: {
    speed: lv([[{ speed: 11, power: 6 }, -21], [{ speed: 12, power: 6 }, -22], [{ speed: 13, power: 6 }, -23], [{ speed: 14, power: 7 }, -25], [{ speed: 15, power: 8 }, -27]], 4),
    stamina: lv([[{ stamina: 10, guts: 6 }, -19], [{ stamina: 11, guts: 6 }, -20], [{ stamina: 12, guts: 6 }, -21], [{ stamina: 13, guts: 7 }, -23], [{ stamina: 14, guts: 8 }, -25]], 4),
    power: lv([[{ stamina: 6, power: 9 }, -20], [{ stamina: 6, power: 10 }, -21], [{ stamina: 6, power: 11 }, -22], [{ stamina: 7, power: 12 }, -24], [{ stamina: 8, power: 13 }, -26]], 4),
    guts: lv([[{ speed: 5, power: 5, guts: 8 }, -22], [{ speed: 5, power: 5, guts: 9 }, -23], [{ speed: 5, power: 5, guts: 10 }, -24], [{ speed: 6, power: 5, guts: 11 }, -26], [{ speed: 6, power: 5, guts: 13 }, -28]], 4),
    wisdom: lv([[{ speed: 2, wisdom: 10 }, 5], [{ speed: 2, wisdom: 11 }, 5], [{ speed: 2, wisdom: 12 }, 5], [{ speed: 3, wisdom: 13 }, 5], [{ speed: 4, wisdom: 14 }, 5]], 5),
  },
  unity: {
    speed: lv([[{ speed: 8, power: 4 }, -19], [{ speed: 9, power: 4 }, -20], [{ speed: 10, power: 4 }, -21], [{ speed: 11, power: 5 }, -23], [{ speed: 12, power: 6 }, -25]], 4),
    stamina: lv([[{ stamina: 8, guts: 6 }, -20], [{ stamina: 9, guts: 6 }, -21], [{ stamina: 10, guts: 6 }, -22], [{ stamina: 11, guts: 7 }, -24], [{ stamina: 12, guts: 8 }, -26]], 4),
    power: lv([[{ stamina: 4, power: 9 }, -20], [{ stamina: 4, power: 10 }, -21], [{ stamina: 4, power: 11 }, -22], [{ stamina: 5, power: 12 }, -24], [{ stamina: 6, power: 13 }, -26]], 4),
    guts: lv([[{ speed: 3, power: 3, guts: 6 }, -20], [{ speed: 3, power: 3, guts: 7 }, -21], [{ speed: 3, power: 3, guts: 8 }, -22], [{ speed: 4, power: 3, guts: 9 }, -24], [{ speed: 4, power: 4, guts: 10 }, -26]], 4),
    wisdom: lv([[{ speed: 2, wisdom: 6 }, 5], [{ speed: 2, wisdom: 7 }, 5], [{ speed: 2, wisdom: 8 }, 5], [{ speed: 3, wisdom: 9 }, 5], [{ speed: 4, wisdom: 10 }, 5]], 5),
  },
};

const MOODS = [
  { label: 'Great (+20%)', value: 0.2 },
  { label: 'Good (+10%)', value: 0.1 },
  { label: 'Normal (0%)', value: 0 },
  { label: 'Bad (−10%)', value: -0.1 },
  { label: 'Awful (−20%)', value: -0.2 },
];

interface CardInput {
  id: number;
  name: string;
  friendshipTraining: boolean;
  friendship: number;
  trainingEffect: number;
  moodEffect: number;
}

const newCard = (id: number): CardInput => ({ id, name: `Card ${id}`, friendshipTraining: false, friendship: 0, trainingEffect: 0, moodEffect: 0 });

export default function TrainingCalculator() {
  const [scenario, setScenario] = useState<'ura' | 'unity'>('ura');
  const [training, setTraining] = useState<StatKey>('speed');
  const [facility, setFacility] = useState(1);
  const [mood, setMood] = useState(0.2);
  const [flatBonus, setFlatBonus] = useState(0);
  const [growth, setGrowth] = useState<Record<StatKey, number>>({ speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0 });
  const [cards, setCards] = useState<CardInput[]>([newCard(1)]);
  const [nextId, setNextId] = useState(2);

  const level = TABLES[scenario][training][facility - 1];

  const result = useMemo(() => {
    const friendMult = cards.reduce((acc, c) => acc * (c.friendshipTraining ? 1 + c.friendship / 100 : 1), 1);
    const moodEffectSum = cards.reduce((acc, c) => acc + c.moodEffect, 0);
    const moodMult = 1 + mood * (1 + moodEffectSum / 100);
    const trainingMult = 1 + cards.reduce((acc, c) => acc + c.trainingEffect, 0) / 100;
    const cardMult = 1 + 0.05 * cards.length;
    const gains = STATS.map((stat) => {
      const base = level.gain[stat];
      if (!base) return { stat, base: 0, gain: 0 };
      const raw = (base + flatBonus) * friendMult * moodMult * trainingMult * cardMult * (1 + growth[stat] / 100);
      return { stat, base, gain: Math.floor(raw) };
    }).filter((g) => g.base > 0);
    return { friendMult, moodMult, trainingMult, cardMult, gains, total: gains.reduce((s, g) => s + g.gain, 0) };
  }, [cards, mood, level, flatBonus, growth]);

  const updateCard = (id: number, patch: Partial<CardInput>) => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const reset = () => {
    setCards([newCard(1)]);
    setNextId(2);
    setFlatBonus(0);
    setGrowth({ speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0 });
    setMood(0.2);
    setFacility(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Training setup</h2>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-gray-600">
              Scenario
              <select value={scenario} onChange={(e) => setScenario(e.target.value as 'ura' | 'unity')} className="block w-full border rounded px-2 py-1 text-sm">
                <option value="ura">URA Finale</option>
                <option value="unity">Unity Cup</option>
              </select>
            </label>
            <label className="text-xs text-gray-600">
              Training
              <select value={training} onChange={(e) => setTraining(e.target.value as StatKey)} className="block w-full border rounded px-2 py-1 text-sm">
                {STATS.map((s) => (
                  <option key={s} value={s}>
                    {STAT_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-600">
              Facility level
              <select value={facility} onChange={(e) => setFacility(parseInt(e.target.value))} className="block w-full border rounded px-2 py-1 text-sm">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    Lv{n}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-600">
              Mood
              <select value={mood} onChange={(e) => setMood(parseFloat(e.target.value))} className="block w-full border rounded px-2 py-1 text-sm">
                {MOODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-600 col-span-2">
              Flat stat bonus (added to the base gain of each stat this training raises)
              <input type="number" min={0} value={flatBonus} onChange={(e) => setFlatBonus(parseInt(e.target.value) || 0)} className="block w-full border rounded px-2 py-1 text-sm" />
            </label>
          </div>

          <div>
            <div className="text-xs text-gray-600 mb-1">Character growth rate (%)</div>
            <div className="grid grid-cols-5 gap-2">
              {STATS.map((s) => (
                <label key={s} className="text-[11px] text-gray-500">
                  {STAT_LABEL[s]}
                  <input
                    type="number"
                    min={0}
                    value={growth[s]}
                    onChange={(e) => setGrowth({ ...growth, [s]: parseInt(e.target.value) || 0 })}
                    className="block w-full border rounded px-1 py-1 text-sm"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Support cards on this training</h2>
            <button
              onClick={() => {
                if (cards.length < 5) {
                  setCards([...cards, newCard(nextId)]);
                  setNextId(nextId + 1);
                }
              }}
              disabled={cards.length >= 5}
              className="flex items-center gap-1 text-sm px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Add card
            </button>
          </div>
          <div className="space-y-3">
            {cards.map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <input value={c.name} onChange={(e) => updateCard(c.id, { name: e.target.value })} className="text-sm font-medium bg-transparent border-b border-gray-300 w-40" />
                  <button onClick={() => setCards(cards.filter((x) => x.id !== c.id))} className="text-red-500" aria-label="Remove card">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <label className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                  <input type="checkbox" checked={c.friendshipTraining} onChange={(e) => updateCard(c.id, { friendshipTraining: e.target.checked })} />
                  Friendship training (card is on its specialty training and gauge is 80+)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[11px] text-gray-500">
                    Friendship %
                    <input type="number" min={0} value={c.friendship} onChange={(e) => updateCard(c.id, { friendship: parseInt(e.target.value) || 0 })} className="block w-full border rounded px-1 py-1 text-sm" />
                  </label>
                  <label className="text-[11px] text-gray-500">
                    Training eff. %
                    <input type="number" min={0} value={c.trainingEffect} onChange={(e) => updateCard(c.id, { trainingEffect: parseInt(e.target.value) || 0 })} className="block w-full border rounded px-1 py-1 text-sm" />
                  </label>
                  <label className="text-[11px] text-gray-500">
                    Mood eff. %
                    <input type="number" min={0} value={c.moodEffect} onChange={(e) => updateCard(c.id, { moodEffect: parseInt(e.target.value) || 0 })} className="block w-full border rounded px-1 py-1 text-sm" />
                  </label>
                </div>
              </div>
            ))}
            {cards.length === 0 && <div className="text-center py-6 text-gray-400">No cards on this training.</div>}
          </div>
          <p className="text-[11px] text-gray-500 mt-3">Look up each card's Friendship, Training Effectiveness and Mood Effect values on its card page.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Result</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {result.gains.map((g) => (
            <div key={g.stat} className="p-3 bg-purple-50 rounded text-center">
              <div className="text-xs text-gray-500">{STAT_LABEL[g.stat]}</div>
              <div className="text-2xl font-bold text-purple-700">+{g.gain}</div>
              <div className="text-[11px] text-gray-500">base {g.base}</div>
            </div>
          ))}
          <div className="p-3 bg-blue-50 rounded text-center">
            <div className="text-xs text-gray-500">Skill points (base)</div>
            <div className="text-2xl font-bold text-blue-700">+{level.sp}</div>
          </div>
          <div className="p-3 bg-green-50 rounded text-center">
            <div className="text-xs text-gray-500">Energy (base)</div>
            <div className="text-2xl font-bold text-green-700">{level.energy > 0 ? `+${level.energy}` : level.energy}</div>
          </div>
        </div>
        <div className="text-sm text-gray-700">
          Total stats: <b>{result.total}</b>
        </div>
        <div className="text-xs text-gray-500 mt-2 grid sm:grid-cols-2 gap-x-6">
          <div>Friendship multiplier: ×{result.friendMult.toFixed(3)}</div>
          <div>Mood multiplier: ×{result.moodMult.toFixed(3)}</div>
          <div>Training effectiveness: ×{result.trainingMult.toFixed(3)}</div>
          <div>Multi-card bonus (+5% per card): ×{result.cardMult.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4 text-xs text-gray-700 space-y-1">
        <p className="font-semibold text-sm">Formula</p>
        <p>
          StatGain = ⌊(Base + ΣStatBonus) × Π(1 + Friendship/100) × (1 + Mood × (1 + ΣMoodEffect/100)) × (1 + ΣTrainingEffect/100) × (1 + 0.05 × Cards) × (1 + Growth/100)⌋
        </p>
        <p>
          Base values are the facility Lv1–5 values for each scenario. In URA a facility levels up after four trainings; in Unity Cup it follows the team rating;
          summer camp sets every facility to Lv5. Sources: uma.guide (Career Mechanics), umareference.com, game8. Community-measured formula, not published by Cygames.
        </p>
      </div>
    </div>
  );
}
