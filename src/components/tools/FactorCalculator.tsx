import React, { useMemo, useState } from 'react';
import { Calculator, Plus, X } from 'lucide-react';

/**
 * Spark (factor) inheritance calculator.
 *
 * Mechanics (sources: uma.guide/guides/parenting-in-umamusume, uma.guide/guides/sparks,
 * umareference.com/guide/legacies/chance-of-inheriting-sparks):
 *  - Every parent and grandparent rolls each of their sparks separately at the Inspiration events.
 *  - Base chance at 0 affinity depends on the spark type and its stars:
 *      Blue 70/80/90%, Pink 2/3/5%, Green (unique) 5/10/15%, Race 1/2/3%, White skill & scenario 3/6/9%.
 *  - Affinity scales the base chance: chance = base × (1 + affinity / 100). Each legacy has its own affinity value.
 */

type SparkType = 'blue' | 'pink' | 'green' | 'race' | 'white';

const BASE_RATES: Record<SparkType, [number, number, number]> = {
  blue: [70, 80, 90],
  pink: [2, 3, 5],
  green: [5, 10, 15],
  race: [1, 2, 3],
  white: [3, 6, 9],
};

const TYPE_LABEL: Record<SparkType, string> = {
  blue: 'Blue (stat)',
  pink: 'Pink (aptitude)',
  green: 'Green (unique skill)',
  race: 'White – race',
  white: 'White – skill / scenario',
};

const SOURCES = ['Parent 1', 'Parent 2', 'Grandparent 1', 'Grandparent 2', 'Grandparent 3', 'Grandparent 4'];

interface Entry {
  id: number;
  source: string;
  type: SparkType;
  stars: 1 | 2 | 3;
  affinity: number;
}

export default function FactorCalculator() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: 1, source: 'Parent 1', type: 'white', stars: 3, affinity: 30 },
  ]);
  const [nextId, setNextId] = useState(2);

  const rows = useMemo(
    () =>
      entries.map((e) => {
        const base = BASE_RATES[e.type][e.stars - 1];
        return { ...e, base, chance: Math.min(100, base * (1 + Math.max(0, e.affinity) / 100)) };
      }),
    [entries]
  );

  const combined = useMemo(() => {
    if (!rows.length) return 0;
    return (1 - rows.reduce((acc, r) => acc * (1 - r.chance / 100), 1)) * 100;
  }, [rows]);

  const update = (id: number, patch: Partial<Entry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const add = () => {
    setEntries((prev) => [...prev, { id: nextId, source: 'Parent 2', type: 'blue', stars: 3, affinity: 0 }]);
    setNextId(nextId + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            Spark inheritance chance
          </h2>
          <button onClick={add} className="flex items-center gap-1 text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
            <Plus className="w-4 h-4" /> Add spark
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end p-3 bg-gray-50 rounded">
              <label className="text-xs text-gray-600">
                Who has it
                <select value={r.source} onChange={(e) => update(r.id, { source: e.target.value })} className="block w-full border rounded px-2 py-1 text-sm">
                  {SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-600">
                Spark type
                <select value={r.type} onChange={(e) => update(r.id, { type: e.target.value as SparkType })} className="block w-full border rounded px-2 py-1 text-sm">
                  {(Object.keys(TYPE_LABEL) as SparkType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-600">
                Stars
                <select value={r.stars} onChange={(e) => update(r.id, { stars: parseInt(e.target.value) as 1 | 2 | 3 })} className="block w-full border rounded px-2 py-1 text-sm">
                  <option value={1}>★1</option>
                  <option value={2}>★2</option>
                  <option value={3}>★3</option>
                </select>
              </label>
              <label className="text-xs text-gray-600">
                Affinity with this legacy
                <input
                  type="number"
                  min={0}
                  max={400}
                  value={r.affinity}
                  onChange={(e) => update(r.id, { affinity: parseInt(e.target.value) || 0 })}
                  className="block w-full border rounded px-2 py-1 text-sm"
                />
              </label>
              <div className="text-sm">
                <div className="text-xs text-gray-500">Base {r.base}%</div>
                <div className="font-bold text-purple-700">{r.chance.toFixed(1)}%</div>
              </div>
              <button onClick={() => setEntries((prev) => prev.filter((e) => e.id !== r.id))} className="text-red-500 hover:text-red-700 justify-self-end" aria-label="Remove">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {rows.length === 0 && <div className="text-center py-6 text-gray-400">Add a spark to calculate its chance.</div>}
        </div>

        {rows.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded">
            <div className="text-sm text-gray-700">
              Chance that at least one of the listed sparks is inherited in one Inspiration roll (rolls are independent):
            </div>
            <div className="text-3xl font-bold text-purple-700">{combined.toFixed(1)}%</div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-sm">
          <h3 className="font-semibold mb-2">Base chance at 0 affinity</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="py-1">Spark</th>
                <th>★1</th>
                <th>★2</th>
                <th>★3</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(TYPE_LABEL) as SparkType[]).map((t) => (
                <tr key={t} className="border-t">
                  <td className="py-1">{TYPE_LABEL[t]}</td>
                  {BASE_RATES[t].map((v, i) => (
                    <td key={i}>{v}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-3">
            Final chance = base × (1 + affinity / 100). Each parent and grandparent has its own affinity value and is rolled separately.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-sm">
          <h3 className="font-semibold mb-2">Which stars does a legacy get?</h3>
          <p className="text-xs text-gray-600 mb-2">Blue spark stars depend on the stat total (1★ / 2★ / 3★):</p>
          <ul className="text-xs text-gray-700 space-y-0.5 mb-3">
            <li>• Stat under 600: 90% / 10% / 0%</li>
            <li>• Stat 600–1100: 45% / 50% / 5%</li>
            <li>• Stat over 1100: 20% / 70% / 10%</li>
          </ul>
          <p className="text-xs text-gray-600 mb-2">Pink sparks (from A or S aptitudes): 20% / 70% / 10%.</p>
          <p className="text-xs text-gray-600 mb-2">
            White and green sparks depend on the final rank: B to SS (6500–17499) 45% / 50% / 5%; SS to UE (17500–28799) 20% / 70% / 10%;
            UE and above (28800+) 17.5% / 70% / 12.5%.
          </p>
          <p className="text-xs text-gray-500">
            Sources: uma.guide (Sparks &amp; Inheritance, Parenting in Umamusume) and umareference.com. These are community-measured rates, not published by Cygames.
          </p>
        </div>
      </div>
    </div>
  );
}
