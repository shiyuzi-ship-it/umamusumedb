// Compact entries for the support card / character list pages and their JSON (/cards-data/{locale}.json, /characters-data/{locale}.json).
// The list pages only carry one paginated slice; searching, filtering and sorting load the full JSON on demand.
import { characters, supportCards } from '@/lib/static-content';
import { allNames, charName, cardName, charBaseName } from '@/lib/localized.js';
import { typeLabel } from '@/lib/page-helpers';
import { scoreCard } from '@/lib/card-rankings';
import type { Locale } from '@/lib/i18n';

export type EntityKind = 'cards' | 'characters';

export interface EntityEntry {
  i: string;       // id
  n: string;       // name
  n2?: string;     // name in the other site language (en <-> ja)
  im?: string;     // image
  sb: string;      // sub line (rarity / type / stars)
  v?: string;      // server
  r?: string;      // rarity (cards: SSR/SR/R, characters: star count)
  t?: string;      // card type
  sc?: number;     // calculated ranking score (cards)
  q?: string;      // search text (JSON only)
}

const releaseKey = (c: any, loc: Locale) => (loc === 'ja' ? c.release_date_jp ?? '' : (c.release_date_global ?? '') + '|' + (c.release_date_jp ?? ''));

const clean = <T extends Record<string, any>>(o: T): T => {
  for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === '') delete o[k];
  return o;
};

export function buildEntityEntries(kind: EntityKind, loc: Locale, withSearch = false): EntityEntry[] {
  if (kind === 'cards') {
    return [...(supportCards as any[])]
      .sort((a, b) => releaseKey(b, loc).localeCompare(releaseKey(a, loc)) || (b.support_id ?? 0) - (a.support_id ?? 0))
      .map((c) => clean({
        i: c.id as string, n: cardName(c, loc), n2: loc === 'en' ? c.name_jp : loc === 'ja' ? c.name_en : undefined, im: c.image_url || undefined,
        sb: `${c.rarity} · ${typeLabel(loc, c.type)}`, v: c.server, r: c.rarity, t: c.type, sc: Math.round(scoreCard(c).score * 10) / 10,
        q: withSearch ? allNames(c).join(' ') : undefined,
      }));
  }
  return [...(characters as any[])]
    .sort((a, b) => releaseKey(b, loc).localeCompare(releaseKey(a, loc)) || (b.card_id ?? 0) - (a.card_id ?? 0))
    .map((c) => clean({
      i: c.id as string, n: charName(c, loc), n2: loc === 'en' ? c.name_jp : loc === 'ja' ? c.name_en : undefined, im: c.image_url || undefined,
      sb: '★'.repeat(c.rarity), v: c.server, r: String(c.rarity),
      q: withSearch ? [...allNames(c), charBaseName(c, loc)].join(' ') : undefined,
    }));
}
