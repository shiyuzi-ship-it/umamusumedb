import React, { useState, useMemo } from 'react';
import { Plus, X, Search, TrendingUp, Zap, Activity, Heart, Brain, Target, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import type { Character, CharacterStats, CharacterAptitudes } from '@/types';
import PlaceholderImage from '../PlaceholderImage';
import { makeT, type Labels } from './tool-i18n';

interface CharacterComparisonToolProps {
  characters: Character[];
  labels?: Labels;
}

interface ComparisonSlot {
  character: Character | null;
  id: string;
}

const MAX_SLOTS = 4;

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

const APTITUDE_COLORS: Record<string, string> = {
  S: 'bg-red-100 text-red-700 border-red-200',
  A: 'bg-orange-100 text-orange-700 border-orange-200',
  B: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  C: 'bg-gray-100 text-gray-600 border-gray-200',
  D: 'bg-gray-100 text-gray-500 border-gray-200',
  E: 'bg-gray-100 text-gray-500 border-gray-200',
  F: 'bg-gray-100 text-gray-400 border-gray-200',
  G: 'bg-gray-50 text-gray-400 border-gray-200'
};

const APTITUDE_ORDER = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

function getAptitudeValue(rating: string): number {
  const index = APTITUDE_ORDER.indexOf(rating);
  return index === -1 ? 7 : index;
}

function getGrowthColor(rate: number | undefined): string {
  if (!rate) return 'text-gray-400';
  if (rate >= 20) return 'text-green-600 font-bold';
  if (rate >= 10) return 'text-blue-600 font-semibold';
  if (rate > 0) return 'text-yellow-600';
  return 'text-gray-500';
}

function getStatComparison(value1: number, value2: number): string {
  if (value1 > value2) return 'text-green-600 font-bold';
  if (value1 < value2) return 'text-red-600';
  return 'text-gray-700';
}

function formatAptitude(rating: string | undefined): string {
  return rating || 'G';
}

export default function CharacterComparisonTool({ characters, labels }: CharacterComparisonToolProps) {
  const t = makeT(labels);
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { character: null, id: 'slot-0' },
    { character: null, id: 'slot-1' },
    { character: null, id: 'slot-2' },
    { character: null, id: 'slot-3' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'aptitudes' | 'growth'>('stats');

  // Filter available characters (not already selected)
  const availableCharacters = useMemo(() => {
    const selectedIds = new Set(slots.filter(s => s.character).map(s => s.character!.id));
    return characters.filter(c => !selectedIds.has(c.id));
  }, [characters, slots]);

  // Filter by search query
  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return availableCharacters;
    const query = searchQuery.toLowerCase();
    return availableCharacters.filter(c => 
      c.name_en.toLowerCase().includes(query) ||
      c.name_jp.toLowerCase().includes(query)
    );
  }, [availableCharacters, searchQuery]);

  // Get selected characters for comparison
  const selectedCharacters = useMemo(() => {
    return slots.filter(s => s.character).map(s => s.character!);
  }, [slots]);

  // Find best stats for highlighting
  const bestStats = useMemo(() => {
    if (selectedCharacters.length === 0) return null;
    const stats: Record<string, number> = { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0 };
    const maxStats: Record<string, number> = { speed: 0, stamina: 0, power: 0, guts: 0, wisdom: 0 };
    
    selectedCharacters.forEach(char => {
      const init = char.initial_stats || DEFAULT_STATS;
      const max = char.max_stats || DEFAULT_STATS;
      Object.keys(stats).forEach(key => {
        stats[key] = Math.max(stats[key], init[key as keyof CharacterStats] || 0);
        maxStats[key] = Math.max(maxStats[key], max[key as keyof CharacterStats] || 0);
      });
    });
    return { initial: stats, max: maxStats };
  }, [selectedCharacters]);

  // Find best aptitudes
  const bestAptitudes = useMemo(() => {
    if (selectedCharacters.length === 0) return {};
    const best: Record<string, string> = {};
    selectedCharacters.forEach(char => {
      const apt = char.aptitudes || DEFAULT_APTITUDES;
      Object.entries(apt).forEach(([key, value]) => {
        if (!best[key] || getAptitudeValue(value) < getAptitudeValue(best[key])) {
          best[key] = value;
        }
      });
    });
    return best;
  }, [selectedCharacters]);

  const addCharacter = (character: Character, slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], character };
    setSlots(newSlots);
    setActiveSlotIndex(null);
    setSearchQuery('');
  };

  const removeCharacter = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], character: null };
    setSlots(newSlots);
  };

  const clearAll = () => {
    setSlots(slots.map(s => ({ ...s, character: null })));
  };

  const getAptitudeComparisonClass = (rating: string, type: string): string => {
    if (!bestAptitudes[type]) return '';
    const currentValue = getAptitudeValue(rating);
    const bestValue = getAptitudeValue(bestAptitudes[type]);
    if (currentValue === bestValue) return 'ring-2 ring-green-400 ring-offset-1';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Selection Bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-uma-primary" />
            {t('cc_select_title')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {t('cc_selected', { n: selectedCharacters.length, max: MAX_SLOTS })}
            </span>
            {selectedCharacters.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition"
              >
                {t('cc_clear')}
              </button>
            )}
          </div>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className={`relative rounded-lg border-2 transition-all ${
                slot.character
                  ? 'bg-white border-uma-primary/30'
                  : 'bg-gray-50 border-dashed border-gray-300 hover:border-uma-primary/50'
              }`}
            >
              {slot.character ? (
                <div className="p-3">
                  <button
                    onClick={() => removeCharacter(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    {slot.character.image_url ? (
                      <img
                        src={slot.character.image_url}
                        alt={slot.character.name_en}
                        className="w-16 h-16 rounded-lg object-cover mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <PlaceholderImage
                        type="character"
                        name={slot.character.name_en}
                        rarity={slot.character.rarity}
                        className="w-16 h-16 rounded-lg mb-2"
                      />
                    )}
                    <div className="text-sm font-semibold line-clamp-1">{slot.character.name_en}</div>
                    {slot.character.name_jp !== slot.character.name_en && <div className="text-xs text-gray-500 line-clamp-1">{slot.character.name_jp}</div>}
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: slot.character.rarity || 1 }, (_, i) => (
                        <span key={i} className="text-uma-accent text-xs">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveSlotIndex(index)}
                  className="w-full h-full min-h-[120px] flex flex-col items-center justify-center text-gray-400 hover:text-uma-primary transition p-3"
                >
                  <Plus className="w-8 h-8 mb-1" />
                  <span className="text-xs">{t('cc_add')}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Character Picker Modal */}
      {activeSlotIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{t('cc_pick')}</h3>
              <button
                onClick={() => {
                  setActiveSlotIndex(null);
                  setSearchQuery('');
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('cc_search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-uma-primary"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredCharacters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => addCharacter(character, activeSlotIndex)}
                    className="text-left p-3 rounded-lg border border-gray-200 hover:border-uma-primary hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-center gap-2">
                      {character.image_url ? (
                        <img
                          src={character.image_url}
                          alt={character.name_en}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <PlaceholderImage
                          type="character"
                          name={character.name_en}
                          rarity={character.rarity}
                          className="w-12 h-12 rounded flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{character.name_en}</div>
                        {character.name_jp !== character.name_en && <div className="text-xs text-gray-500 truncate">{character.name_jp}</div>}
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: character.rarity || 1 }, (_, i) => (
                            <span key={i} className="text-uma-accent text-[10px]">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {filteredCharacters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t('cc_not_found')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tables */}
      {selectedCharacters.length > 0 && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            {[
              { id: 'stats', label: t('cc_tab_stats'), icon: BarChart3 },
              { id: 'aptitudes', label: t('cc_tab_apt'), icon: Target },
              { id: 'growth', label: t('cc_tab_growth'), icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  activeTab === id
                    ? 'text-uma-primary border-b-2 border-uma-primary'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Stats Comparison */}
          {activeTab === 'stats' && (
            <div className="glass rounded-xl p-4 overflow-x-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                {t('cc_initial')}
              </h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">{t('cc_stat')}</th>
                    {selectedCharacters.map((char) => (
                      <th key={char.id} className="text-center py-2 px-2 min-w-[100px]">
                        <div className="text-sm font-semibold">{char.name_en}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'speed', label: t('stat_speed'), icon: Zap, color: 'text-blue-500' },
                    { key: 'stamina', label: t('stat_stamina'), icon: Heart, color: 'text-red-500' },
                    { key: 'power', label: t('stat_power'), icon: Activity, color: 'text-orange-500' },
                    { key: 'guts', label: t('stat_guts'), icon: Target, color: 'text-purple-500' },
                    { key: 'wisdom', label: t('stat_wisdom'), icon: Brain, color: 'text-green-500' }
                  ].map(({ key, label, icon: Icon, color }) => (
                    <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span className="font-medium">{label}</span>
                        </div>
                      </td>
                      {selectedCharacters.map((char) => {
                        const value = (char.initial_stats || DEFAULT_STATS)[key as keyof CharacterStats];
                        const isBest = bestStats && value === bestStats.initial[key];
                        return (
                          <td key={char.id} className="text-center py-3 px-2">
                            <span className={`text-lg ${isBest ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                              {value}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="py-3 px-2">{t('cc_total')}</td>
                    {selectedCharacters.map((char) => {
                      const stats = char.initial_stats || DEFAULT_STATS;
                      const total = Object.values(stats).reduce((a, b) => a + b, 0);
                      const allTotals = selectedCharacters.map(c => 
                        Object.values(c.initial_stats || DEFAULT_STATS).reduce((a, b) => a + b, 0)
                      );
                      const isHighest = total === Math.max(...allTotals);
                      return (
                        <td key={char.id} className="text-center py-3 px-2">
                          <span className={isHighest ? 'text-green-600' : ''}>{total}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>

              <h3 className="font-semibold mb-4 mt-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                {t('cc_max')}
              </h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">{t('cc_stat')}</th>
                    {selectedCharacters.map((char) => (
                      <th key={char.id} className="text-center py-2 px-2 min-w-[100px]">
                        <div className="text-sm font-semibold">{char.name_en}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'speed', label: t('stat_speed'), icon: Zap, color: 'text-blue-500' },
                    { key: 'stamina', label: t('stat_stamina'), icon: Heart, color: 'text-red-500' },
                    { key: 'power', label: t('stat_power'), icon: Activity, color: 'text-orange-500' },
                    { key: 'guts', label: t('stat_guts'), icon: Target, color: 'text-purple-500' },
                    { key: 'wisdom', label: t('stat_wisdom'), icon: Brain, color: 'text-green-500' }
                  ].map(({ key, label, icon: Icon, color }) => (
                    <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span className="font-medium">{label}</span>
                        </div>
                      </td>
                      {selectedCharacters.map((char) => {
                        const value = (char.max_stats || DEFAULT_STATS)[key as keyof CharacterStats];
                        const isBest = bestStats && value === bestStats.max[key];
                        return (
                          <td key={char.id} className="text-center py-3 px-2">
                            <span className={`text-lg ${isBest ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                              {value}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-purple-50 font-semibold">
                    <td className="py-3 px-2">{t('cc_total')}</td>
                    {selectedCharacters.map((char) => {
                      const stats = char.max_stats || DEFAULT_STATS;
                      const total = Object.values(stats).reduce((a, b) => a + b, 0);
                      const allTotals = selectedCharacters.map(c => 
                        Object.values(c.max_stats || DEFAULT_STATS).reduce((a, b) => a + b, 0)
                      );
                      const isHighest = total === Math.max(...allTotals);
                      return (
                        <td key={char.id} className="text-center py-3 px-2">
                          <span className={isHighest ? 'text-green-600' : ''}>{total}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Aptitudes Comparison */}
          {activeTab === 'aptitudes' && (
            <div className="glass rounded-xl p-4 overflow-x-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                {t('cc_apt_distance')}
              </h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">{t('cc_distance')}</th>
                    {selectedCharacters.map((char) => (
                      <th key={char.id} className="text-center py-2 px-2 min-w-[100px]">
                        <div className="text-sm font-semibold">{char.name_en}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'sprint', label: t('sb_d_sprint') },
                    { key: 'mile', label: t('sb_d_mile') },
                    { key: 'medium', label: t('sb_d_medium') },
                    { key: 'long', label: t('sb_d_long') }
                  ].map(({ key, label }) => (
                    <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{label}</td>
                      {selectedCharacters.map((char) => {
                        const rating = formatAptitude((char.aptitudes || DEFAULT_APTITUDES)[key as keyof CharacterAptitudes]);
                        const colorClass = APTITUDE_COLORS[rating] || APTITUDE_COLORS.G;
                        const isBest = getAptitudeComparisonClass(rating, key);
                        return (
                          <td key={char.id} className="text-center py-3 px-2">
                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg border ${colorClass} ${isBest}`}>
                              {rating}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="font-semibold mb-4 mt-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                {t('cc_apt_style')}
              </h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">{t('cc_style')}</th>
                    {selectedCharacters.map((char) => (
                      <th key={char.id} className="text-center py-2 px-2 min-w-[100px]">
                        <div className="text-sm font-semibold">{char.name_en}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'escape', label: t('sb_s_escape') },
                    { key: 'lead', label: t('sb_s_lead') },
                    { key: 'between', label: t('sb_s_between') },
                    { key: 'chase', label: t('sb_s_chase') }
                  ].map(({ key, label }) => (
                    <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{label}</td>
                      {selectedCharacters.map((char) => {
                        const rating = formatAptitude((char.aptitudes || DEFAULT_APTITUDES)[key as keyof CharacterAptitudes]);
                        const colorClass = APTITUDE_COLORS[rating] || APTITUDE_COLORS.G;
                        const isBest = getAptitudeComparisonClass(rating, key);
                        return (
                          <td key={char.id} className="text-center py-3 px-2">
                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg border ${colorClass} ${isBest}`}>
                              {rating}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="font-semibold mb-4 mt-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                {t('cc_apt_surface')}
              </h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">{t('cc_surface')}</th>
                    {selectedCharacters.map((char) => (
                      <th key={char.id} className="text-center py-2 px-2 min-w-[100px]">
                        <div className="text-sm font-semibold">{char.name_en}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'turf', label: t('cc_turf') },
                    { key: 'dirt', label: t('cc_dirt') }
                  ].map(({ key, label }) => (
                    <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{label}</td>
                      {selectedCharacters.map((char) => {
                        const rating = formatAptitude((char.aptitudes || DEFAULT_APTITUDES)[key as keyof CharacterAptitudes]);
                        const colorClass = APTITUDE_COLORS[rating] || APTITUDE_COLORS.G;
                        const isBest = getAptitudeComparisonClass(rating, key);
                        return (
                          <td key={char.id} className="text-center py-3 px-2">
                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg border ${colorClass} ${isBest}`}>
                              {rating}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Growth Rates Comparison */}
          {activeTab === 'growth' && (
            <div className="glass rounded-xl p-4 overflow-x-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {t('cc_growth_title')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('cc_growth_note')}
              </p>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">{t('cc_stat')}</th>
                    {selectedCharacters.map((char) => (
                      <th key={char.id} className="text-center py-2 px-2 min-w-[100px]">
                        <div className="text-sm font-semibold">{char.name_en}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'speed', label: t('cc_growth_of', { stat: t('stat_speed') }), icon: Zap, color: 'text-blue-500' },
                    { key: 'stamina', label: t('cc_growth_of', { stat: t('stat_stamina') }), icon: Heart, color: 'text-red-500' },
                    { key: 'power', label: t('cc_growth_of', { stat: t('stat_power') }), icon: Activity, color: 'text-orange-500' },
                    { key: 'guts', label: t('cc_growth_of', { stat: t('stat_guts') }), icon: Target, color: 'text-purple-500' },
                    { key: 'wisdom', label: t('cc_growth_of', { stat: t('stat_wisdom') }), icon: Brain, color: 'text-green-500' }
                  ].map(({ key, label, icon: Icon, color }) => {
                    const rates = selectedCharacters.map(char => char.growth_rates?.[key] || 0);
                    const maxRate = Math.max(...rates);
                    return (
                      <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="font-medium">{label}</span>
                          </div>
                        </td>
                        {selectedCharacters.map((char) => {
                          const rate = char.growth_rates?.[key] || 0;
                          const isBest = rate === maxRate && rate > 0;
                          return (
                            <td key={char.id} className="text-center py-3 px-2">
                              <span className={`text-lg ${getGrowthColor(rate)} ${isBest ? 'ring-2 ring-green-400 ring-offset-1 rounded px-2' : ''}`}>
                                {rate > 0 ? `+${rate}%` : `${rate}%`}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedCharacters.map((char) => {
              const totalInitStats = Object.values(char.initial_stats || DEFAULT_STATS).reduce((a, b) => a + b, 0);
              const totalMaxStats = Object.values(char.max_stats || DEFAULT_STATS).reduce((a, b) => a + b, 0);
              const aptitudes = char.aptitudes || DEFAULT_APTITUDES;
              const sCount = Object.values(aptitudes).filter(a => a === 'S').length;
              const aCount = Object.values(aptitudes).filter(a => a === 'A').length;
              
              return (
                <div key={char.id} className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-sm mb-3">{char.name_en}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cc_init_total')}</span>
                      <span className="font-medium">{totalInitStats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cc_max_total')}</span>
                      <span className="font-medium">{totalMaxStats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cc_s_apt')}</span>
                      <span className="font-medium text-red-600">{sCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cc_a_apt')}</span>
                      <span className="font-medium text-orange-600">{aCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cc_growth_bonus')}</span>
                      <span className="font-medium text-green-600">
                        +{Object.values(char.growth_rates || {}).reduce((a, b) => a + (b || 0), 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedCharacters.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('cc_empty_title')}</h3>
          <p className="text-gray-500 mb-4">{t('cc_empty_desc')}</p>
          <div className="text-sm text-gray-400">
            {t('cc_empty_max', { max: MAX_SLOTS })}
          </div>
        </div>
      )}
    </div>
  );
}
