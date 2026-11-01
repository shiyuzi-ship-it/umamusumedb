// Browser side of the skills list: the HTML only carries one page of skills (plus crawlable pagination links);
// as soon as the visitor searches or filters, the full per-locale list (/skills-data/{locale}.json) is fetched once and matched in memory.
import { renderSkillCard, type SkillEntry, type SkillListKind } from './skill-list-render';

export interface SkillFilters { q: string; rarity: string; type: string; phase: string; distance: string; style: string; effect: string; server: string }

export const normalizeQuery = (s: string) =>
  s.toLowerCase().replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60)).replace(/[\s\-_・·.'’()（）\[\]【】「」]/g, '');

const isAll = (v: string) => !v || v === 'all';

export function filtersActive(f: SkillFilters) {
  return !!normalizeQuery(f.q) || [f.rarity, f.type, f.phase, f.distance, f.style, f.effect, f.server].some((v) => !isAll(v));
}

/** `e.q` must already be normalized with normalizeQuery. */
export function matchSkill(e: SkillEntry, f: SkillFilters, nq = normalizeQuery(f.q)) {
  return (
    (!nq || (e.q ?? '').includes(nq)) &&
    (isAll(f.rarity) || (e.r ?? '') === f.rarity) &&
    (isAll(f.type) || (e.t ?? '') === f.type) &&
    (isAll(f.phase) || (e.p ?? '').split(' ').includes(f.phase)) &&
    (isAll(f.distance) || (e.d ?? 'all') === f.distance) &&
    (isAll(f.style) || (e.y ?? 'all') === f.style) &&
    (isAll(f.effect) || (e.x ?? 'other') === f.effect) &&
    (isAll(f.server) || (e.v ?? '') === f.server)
  );
}

const CONTROLS: Record<keyof SkillFilters, string[]> = {
  q: ['skill-search', 'f-q'], rarity: ['rarity-filter', 'f-rarity'], type: ['type-filter', 'f-type'], phase: ['phase-filter'],
  distance: ['distance-filter'], style: ['style-filter'], effect: ['effect-filter'], server: ['f-server'],
};

export function initSkillsList() {
  const container = (document.getElementById('skills-container') ?? document.getElementById('list')) as HTMLElement | null;
  const url = container?.dataset.skillsJson;
  if (!container || !url) return;
  const kind = (container.dataset.kind ?? 'en') as SkillListKind;
  const opts = { prefix: container.dataset.prefix ?? '', jpLabel: container.dataset.jpLabel ?? 'JP only' };
  const moreLabel = container.dataset.moreLabel ?? 'Show more';
  const step = Number(container.dataset.step ?? 100);
  const pager = document.getElementById('skills-pager');
  const noResults = document.getElementById('no-results') ?? document.getElementById('none');
  const countEl = document.getElementById('result-count') ?? document.getElementById('f-count');
  const tagsEl = document.getElementById('active-filters');
  const originalHtml = container.innerHTML;
  const originalCount = countEl?.textContent ?? '';

  const el = (key: keyof SkillFilters) => CONTROLS[key].map((id) => document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null).find(Boolean) ?? null;
  const read = (): SkillFilters => ({
    q: el('q')?.value ?? '', rarity: el('rarity')?.value ?? '', type: el('type')?.value ?? '', phase: el('phase')?.value ?? '',
    distance: el('distance')?.value ?? '', style: el('style')?.value ?? '', effect: el('effect')?.value ?? '', server: el('server')?.value ?? '',
  });

  let all: SkillEntry[] | null = null;
  let loading: Promise<void> | null = null;
  let limit = step;
  const moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.textContent = moreLabel;
  moreBtn.className = 'hidden mx-auto mt-6 px-5 py-2 rounded-lg border border-uma-primary/30 bg-white hover:bg-gray-50 text-sm font-medium';
  container.insertAdjacentElement('afterend', moreBtn);

  function load() {
    loading ??= fetch(url!)
      .then((r) => r.json())
      .then((d) => { all = (d.items as SkillEntry[]).map((e) => ({ ...e, q: normalizeQuery(e.q ?? e.n) })); });
    return loading;
  }

  function renderTags(f: SkillFilters) {
    if (!tagsEl) return;
    const keys: (keyof SkillFilters)[] = ['rarity', 'type', 'phase', 'distance', 'style', 'effect', 'server'];
    tagsEl.innerHTML = '';
    for (const k of keys) {
      const c = el(k) as HTMLSelectElement | null;
      if (!c || isAll(f[k])) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-uma-primary/10 text-uma-primary text-xs font-medium hover:bg-uma-primary/20 transition';
      b.textContent = `${c.selectedOptions[0]?.textContent?.trim() ?? f[k]} ✕`;
      b.addEventListener('click', () => { c.value = c.querySelector('option[value="all"]') ? 'all' : ''; apply(); });
      tagsEl.appendChild(b);
    }
  }

  function showDefault() {
    container!.innerHTML = originalHtml;
    container!.classList.remove('hidden');
    pager?.classList.remove('hidden');
    moreBtn.classList.add('hidden');
    noResults?.classList.add('hidden');
    if (countEl) countEl.textContent = originalCount;
  }

  async function apply() {
    const f = read();
    renderTags(f);
    if (!filtersActive(f)) { limit = step; showDefault(); return; }
    if (!all) {
      if (countEl) countEl.textContent = '…';
      await load();
      if (!all) return;
      if (filtersActive(read()) === false) { showDefault(); return; }
      return apply();
    }
    const nq = normalizeQuery(f.q);
    const hits = all.filter((e) => matchSkill(e, f, nq));
    pager?.classList.add('hidden');
    const shown = hits.slice(0, limit);
    container!.innerHTML = shown.map((e) => renderSkillCard(kind, e, opts)).join('');
    container!.classList.toggle('hidden', hits.length === 0);
    noResults?.classList.toggle('hidden', hits.length > 0);
    moreBtn.classList.toggle('hidden', hits.length <= limit);
    if (countEl) countEl.textContent = kind === 'l10n' ? `${hits.length} / ${all.length}` : String(hits.length);
  }

  const reset = () => {
    for (const k of Object.keys(CONTROLS) as (keyof SkillFilters)[]) {
      const c = el(k); if (!c) continue;
      c.value = c instanceof HTMLSelectElement && c.querySelector('option[value="all"]') ? 'all' : '';
    }
    limit = step; apply();
  };
  moreBtn.addEventListener('click', () => { limit += step; apply(); });
  for (const k of Object.keys(CONTROLS) as (keyof SkillFilters)[]) {
    const c = el(k);
    c?.addEventListener(k === 'q' ? 'input' : 'change', () => { limit = step; apply(); });
    if (k === 'q') c?.addEventListener('focus', () => { void load(); }, { once: true });
  }
  document.getElementById('reset-filters')?.addEventListener('click', reset);
  document.getElementById('clear-all-filters')?.addEventListener('click', reset);

  const q0 = new URLSearchParams(location.search).get('q');
  const qi = el('q');
  if (q0 && qi) { qi.value = q0; void apply(); }
}

if (typeof document !== 'undefined') initSkillsList();
