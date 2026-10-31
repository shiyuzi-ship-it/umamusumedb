import React, { useMemo, useState } from 'react';
import { Calculator, Plus, X } from 'lucide-react';
import { makeT, type Labels } from './tool-i18n';

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

const TYPE_KEY: Record<SparkType, string> = {
  blue: 'fc_t_blue',
  pink: 'fc_t_pink',
  green: 'fc_t_green',
  race: 'fc_t_race',
  white: 'fc_t_white',
};
const TYPES = Object.keys(TYPE_KEY) as SparkType[];

const SOURCES = ['Parent 1', 'Parent 2', 'Grandparent 1', 'Grandparent 2', 'Grandparent 3', 'Grandparent 4'];
const SOURCE_KEY: Record<string, string> = { 'Parent 1': 'fc_p1', 'Parent 2': 'fc_p2', 'Grandparent 1': 'fc_g1', 'Grandparent 2': 'fc_g2', 'Grandparent 3': 'fc_g3', 'Grandparent 4': 'fc_g4' };

interface Entry {
  id: number;
  source: string;
  type: SparkType;
  stars: 1 | 2 | 3;
  affinity: number;
}

export default function FactorCalculator({ labels }: { labels?: Labels }) {
  const t = makeT(labels);
  const TYPE_LABEL: Record<SparkType, string> = { blue: t(TYPE_KEY.blue), pink: t(TYPE_KEY.pink), green: t(TYPE_KEY.green), race: t(TYPE_KEY.race), white: t(TYPE_KEY.white) };
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
            {t('fc_title')}
          </h2>
          <button onClick={add} className="flex items-center gap-1 text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
            <Plus className="w-4 h-4" /> {t('fc_add')}
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end p-3 bg-gray-50 rounded">
              <label className="text-xs text-gray-600">
                {t('fc_who')}
                <select value={r.source} onChange={(e) => update(r.id, { source: e.target.value })} className="block w-full border rounded px-2 py-1 text-sm">
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{t(SOURCE_KEY[s])}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-600">
                {t('fc_type')}
                <select value={r.type} onChange={(e) => update(r.id, { type: e.target.value as SparkType })} className="block w-full border rounded px-2 py-1 text-sm">
                  {TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {TYPE_LABEL[ty]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-600">
                {t('fc_stars')}
                <select value={r.stars} onChange={(e) => update(r.id, { stars: parseInt(e.target.value) as 1 | 2 | 3 })} className="block w-full border rounded px-2 py-1 text-sm">
                  <option value={1}>★1</option>
                  <option value={2}>★2</option>
                  <option value={3}>★3</option>
                </select>
              </label>
              <label className="text-xs text-gray-600">
                {t('fc_affinity')}
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
                <div className="text-xs text-gray-500">{t('fc_base', { n: r.base })}</div>
                <div className="font-bold text-purple-700">{r.chance.toFixed(1)}%</div>
              </div>
              <button onClick={() => setEntries((prev) => prev.filter((e) => e.id !== r.id))} className="text-red-500 hover:text-red-700 justify-self-end" aria-label={t('fc_remove')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {rows.length === 0 && <div className="text-center py-6 text-gray-400">{t('fc_empty')}</div>}
        </div>

        {rows.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded">
            <div className="text-sm text-gray-700">
              {t('fc_combined')}
            </div>
            <div className="text-3xl font-bold text-purple-700">{combined.toFixed(1)}%</div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-sm">
          <h3 className="font-semibold mb-2">{t('fc_base_title')}</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="py-1">{t('fc_spark')}</th>
                <th>★1</th>
                <th>★2</th>
                <th>★3</th>
              </tr>
            </thead>
            <tbody>
              {TYPES.map((ty) => (
                <tr key={ty} className="border-t">
                  <td className="py-1">{TYPE_LABEL[ty]}</td>
                  {BASE_RATES[ty].map((v, i) => (
                    <td key={i}>{v}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-3">
            {t('fc_final')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-sm">
          <h3 className="font-semibold mb-2">{t('fc_which')}</h3>
          <p className="text-xs text-gray-600 mb-2">{t('fc_blue_stars')}</p>
          <ul className="text-xs text-gray-700 space-y-0.5 mb-3">
            <li>• {t('fc_stat_lt600')}: 90% / 10% / 0%</li>
            <li>• {t('fc_stat_mid')}: 45% / 50% / 5%</li>
            <li>• {t('fc_stat_gt1100')}: 20% / 70% / 10%</li>
          </ul>
          <p className="text-xs text-gray-600 mb-2">{t('fc_pink_stars')}</p>
          <p className="text-xs text-gray-600 mb-2">
            {t('fc_white_stars')}
          </p>
          <p className="text-xs text-gray-500">
            {t('fc_sources')}
          </p>
        </div>
      </div>
    </div>
  );
}
