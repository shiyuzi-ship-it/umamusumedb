// Skill list card markup, shared by the build (Astro pages) and the browser (filter/search results loaded from /skills-data/{locale}.json),
// so that server-rendered pages and client-rendered results look identical.
export type SkillListKind = 'en' | 'ja' | 'l10n';

/** Compact entry used in the pages and in /skills-data/{locale}.json */
export interface SkillEntry {
  i: string;          // id
  ic?: string;        // icon url
  n: string;          // primary name
  n2?: string;        // secondary name
  r?: string;         // rarity (normal / gold / unique / evolved)
  v?: string;         // server (global / jp)
  e1?: string;        // effect / description text
  e2?: string;        // trigger condition
  p?: string;         // phases (space separated) — en only
  d?: string;         // distance — en only
  y?: string;         // running style — en only
  x?: string;         // effect type — en only
  t?: string;         // skill type (lowercase)
  sb?: string;        // localized rarity label — l10n only
  q?: string;         // search text (JSON only)
}

export const escHtml = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SPARKLES = (cls: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles ${cls}"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>`;
const TARGET = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target w-4 h-4 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;
const FILTER = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-filter w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

const PHASE_TAG: Record<string, string> = { start: '🚀 Early', middle: '⚡ Mid', late: '🔥 Late', final: '🏁 Spurt', corner: '🔄 Corner', straight: '📏 Straight' };
const DIST_TAG: Record<string, string> = { sprint: '⚡ Sprint', mile: '🏃 Mile', medium: '🏇 Medium', long: '🏔️ Long' };
const STYLE_TAG: Record<string, string> = { escape: '💨 Escape', lead: '🏆 Lead', between: '⚡ Between', chase: '🎯 Chase' };
const EFFECT_TAG: Record<string, string> = { speed: '🚀 Speed', acceleration: '⚡ Accel', recovery: '💚 Recovery', positioning: '🎯 Position', debuff: '🧊 Debuff', stats: '📊 Stats' };

const enBadge = (r: string) =>
  r === 'unique' ? 'bg-red-100 text-red-700' : r === 'evolved' ? 'bg-orange-100 text-orange-700' : r === 'gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';

export interface RenderOpts { prefix: string; jpLabel: string }

export function renderSkillCard(kind: SkillListKind, e: SkillEntry, o: RenderOpts): string {
  const href = `${o.prefix}/skills/${e.i}/`;
  const icon = e.ic ? `<img src="${escHtml(e.ic)}" alt="" width="${kind === 'l10n' ? 40 : 32}" height="${kind === 'l10n' ? 40 : 32}" loading="lazy" class="${kind === 'l10n' ? 'w-10 h-10' : 'w-8 h-8 rounded'} flex-shrink-0">` : '';
  if (kind === 'l10n') {
    return `<li><a href="${href}" class="flex gap-3 bg-white rounded-lg p-3 shadow hover:shadow-lg transition-shadow h-full">${icon}<span class="min-w-0"><span class="block font-medium text-sm">${escHtml(e.n)}</span><span class="block text-xs text-gray-500 mb-1">${escHtml(e.sb)}${e.v === 'jp' ? ` · ${escHtml(o.jpLabel)}` : ''}</span><span class="block text-xs text-gray-600 line-clamp-2">${escHtml(e.e1)}</span></span></a></li>`;
  }
  if (kind === 'ja') {
    return `<a href="${href}" style="content-visibility:auto;contain-intrinsic-size:auto 150px" class="skill-item bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-uma-primary/10 p-5 block"><div class="flex items-start justify-between gap-3">${icon}<div class="flex-1 min-w-0"><h2 class="font-bold text-lg">${escHtml(e.n)}</h2><div class="text-sm text-gray-600">${escHtml(e.n2)}</div></div><div class="flex flex-col items-end gap-2">${e.r ? `<span class="text-xs px-2 py-1 rounded-full bg-uma-primary/10 text-uma-primary font-bold">${escHtml(e.r)}</span>` : ''}${e.v === 'jp' ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/80 text-white font-semibold">${escHtml(o.jpLabel)}</span>` : ''}</div></div><div class="mt-3 text-sm text-gray-700"><div class="flex items-center gap-2 text-gray-600">${SPARKLES('w-4 h-4 text-uma-accent')}<span class="truncate">${escHtml(e.e1)}</span></div>${e.e2 ? `<div class="flex items-center gap-2 mt-2 text-gray-500">${FILTER}<span class="truncate">${escHtml(e.e2)}</span></div>` : ''}</div></a>`;
  }
  const phases = (e.p ?? '').split(' ').filter(Boolean);
  const tags: string[] = [];
  if (phases.length && !(phases.length === 1 && phases[0] === 'other')) tags.push(`<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">${phases.map((p) => escHtml(PHASE_TAG[p] ?? p)).join(' · ')}</span>`);
  if (e.d && e.d !== 'all') tags.push(`<span class="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 capitalize">${escHtml(DIST_TAG[e.d] ?? e.d)}</span>`);
  if (e.y && e.y !== 'all') tags.push(`<span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">${escHtml(STYLE_TAG[e.y] ?? e.y)}</span>`);
  if (e.x && e.x !== 'other') tags.push(`<span class="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 capitalize">${escHtml(EFFECT_TAG[e.x] ?? e.x)}</span>`);
  return `<a href="${href}" style="content-visibility:auto;contain-intrinsic-size:auto 170px" class="skill-item bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-uma-primary/10 p-5 block group"><div class="flex items-start justify-between gap-3">${icon}<div class="flex-1 min-w-0"><h2 class="font-bold text-lg group-hover:text-uma-primary transition-colors">${escHtml(e.n)}</h2>${e.n2 ? `<div class="text-sm text-gray-600 font-jp truncate">${escHtml(e.n2)}</div>` : ''}</div><div class="flex flex-col items-end gap-2 flex-shrink-0">${e.r ? `<span class="text-xs px-2 py-1 rounded-full font-bold ${enBadge(e.r)}">${escHtml(e.r)}</span>` : ''}${e.v === 'jp' ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/80 text-white font-semibold">${escHtml(o.jpLabel)}</span>` : ''}</div></div><div class="mt-3 text-sm"><div class="flex items-start gap-2 text-gray-700">${SPARKLES('w-4 h-4 text-uma-accent flex-shrink-0 mt-0.5')}<span class="line-clamp-2">${escHtml(e.e1)}</span></div>${e.e2 ? `<div class="flex items-start gap-2 mt-2 text-gray-500">${TARGET}<span class="line-clamp-1 text-xs">${escHtml(e.e2)}</span></div>` : ''}</div><div class="mt-3 flex flex-wrap gap-1">${tags.join('')}</div></a>`;
}
