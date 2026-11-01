// Tile markup for the support card / character list pages, shared by the build and the browser (filtered / sorted results).
import type { EntityEntry, EntityKind } from './entity-lists';

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface TileOpts { kind: EntityKind; prefix: string; jpLabel: string; scoreLabel?: string; eager?: number }

export function renderTile(e: EntityEntry, o: TileOpts, index = 99, showScore = false): string {
  const href = `${o.prefix}/${o.kind}/${e.i}/`;
  const sub = `${esc(e.sb)}${e.v === 'jp' ? ` · ${esc(o.jpLabel)}` : ''}${showScore && e.sc != null ? ` · ${esc(o.scoreLabel ?? '')} ${e.sc}` : ''}`;
  const img = e.im ? `<img src="${esc(e.im)}" alt="${esc(e.n)}" width="240" height="320" loading="${index < (o.eager ?? 6) ? 'eager' : 'lazy'}" class="w-full aspect-[3/4] object-cover object-top bg-gray-50">` : '';
  return `<li><a href="${href}" class="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow h-full">${img}<span class="block p-2"><span class="block text-sm font-medium leading-tight">${esc(e.n)}</span>${e.n2 ? `<span class="block text-xs text-gray-400 leading-tight mt-0.5">${esc(e.n2)}</span>` : ''}<span class="block text-xs text-gray-500 mt-1">${sub}</span></span></a></li>`;
}
