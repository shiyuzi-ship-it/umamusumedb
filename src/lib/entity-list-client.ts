// Browser side of the support card / character lists: the HTML carries one page of tiles (+ crawlable pagination);
// searching, filtering or sorting fetches the full per-locale JSON once and renders the result in memory.
import { renderTile } from './entity-list-render';
import type { EntityEntry, EntityKind } from './entity-lists';

const normalizeQuery = (s: string) =>
  s.toLowerCase().replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60)).replace(/[\s\-_・·.'’()（）\[\]【】「」]/g, '');

export function sortEntries(list: EntityEntry[], sort: string, lang: string): EntityEntry[] {
  const idx = new Map(list.map((e, i) => [e.i, i]));
  const by = (f: (a: EntityEntry, b: EntityEntry) => number) => [...list].sort((a, b) => f(a, b) || (idx.get(a.i)! - idx.get(b.i)!));
  switch (sort) {
    case 'old': return [...list].reverse();
    case 'name': return by((a, b) => a.n.localeCompare(b.n, lang));
    case 'score': return by((a, b) => (b.sc ?? 0) - (a.sc ?? 0));
    case 'stars': return by((a, b) => Number(b.r ?? 0) - Number(a.r ?? 0));
    default: return list;
  }
}

export function initEntityList() {
  const root = document.getElementById('entity-list') as HTMLElement | null;
  const url = root?.dataset.json;
  if (!root || !url) return;
  const d = root.dataset;
  const opts = { kind: d.kind as EntityKind, prefix: d.prefix ?? '', jpLabel: d.jpLabel ?? 'JP only', scoreLabel: d.scoreLabel ?? 'Score' };
  const step = Number(d.step ?? 60);
  const lang = document.documentElement.lang || 'en';
  const $ = (id: string) => document.getElementById(id) as (HTMLInputElement | HTMLSelectElement | null);
  const pager = document.getElementById('entity-pager');
  const none = document.getElementById('none');
  const count = document.getElementById('f-count');
  const original = root.innerHTML;
  const originalCount = count?.textContent ?? '';
  let all: EntityEntry[] | null = null;
  let loading: Promise<void> | null = null;
  let limit = step;
  const more = document.createElement('button');
  more.type = 'button'; more.textContent = d.moreLabel ?? 'Show more';
  more.className = 'hidden mx-auto mt-6 px-5 py-2 rounded-lg border border-uma-primary/30 bg-white hover:bg-gray-50 text-sm font-medium';
  root.insertAdjacentElement('afterend', more);

  const load = () => (loading ??= fetch(url).then((r) => r.json()).then((j) => { all = (j.items as EntityEntry[]).map((e) => ({ ...e, q: normalizeQuery(e.q ?? e.n) })); }));
  const read = () => ({ q: normalizeQuery($('f-q')?.value ?? ''), server: $('f-server')?.value ?? '', rarity: $('f-rarity')?.value ?? '', type: $('f-type')?.value ?? '', sort: $('f-sort')?.value ?? '' });
  const active = (f: ReturnType<typeof read>) => !!(f.q || f.server || f.rarity || f.type || (f.sort && f.sort !== 'new'));

  function showDefault() {
    root!.innerHTML = original; root!.classList.remove('hidden');
    pager?.classList.remove('hidden'); more.classList.add('hidden'); none?.classList.add('hidden');
    if (count) count.textContent = originalCount;
  }
  async function apply() {
    const f = read();
    if (!active(f)) { limit = step; showDefault(); return; }
    if (!all) { if (count) count.textContent = '…'; await load(); if (!all) return; return apply(); }
    const hits = sortEntries(all.filter((e) => (!f.q || (e.q ?? '').includes(f.q)) && (!f.server || e.v === f.server) && (!f.rarity || e.r === f.rarity) && (!f.type || e.t === f.type)), f.sort, lang);
    pager?.classList.add('hidden');
    root!.innerHTML = hits.slice(0, limit).map((e, i) => renderTile(e, opts, i, f.sort === 'score')).join('');
    root!.classList.toggle('hidden', hits.length === 0);
    none?.classList.toggle('hidden', hits.length > 0);
    more.classList.toggle('hidden', hits.length <= limit);
    if (count) count.textContent = `${hits.length} / ${all.length}`;
  }
  more.addEventListener('click', () => { limit += step; void apply(); });
  for (const id of ['f-q', 'f-server', 'f-rarity', 'f-type', 'f-sort']) {
    $(id)?.addEventListener(id === 'f-q' ? 'input' : 'change', () => { limit = step; void apply(); });
    if (id === 'f-q') $(id)?.addEventListener('focus', () => { void load(); }, { once: true });
  }
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0 && $('f-q')) { ($('f-q') as HTMLInputElement).value = q0; void apply(); }
}
if (typeof document !== 'undefined') initEntityList();
