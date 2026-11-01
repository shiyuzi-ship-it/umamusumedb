// Static pagination for the big list pages (skills). Page 1 lives at the list URL itself, page N at {base}page/N/.
export const PAGE_SIZE = 100;
export const totalPages = (n: number, size = PAGE_SIZE) => Math.max(1, Math.ceil(n / size));
export const pageSlice = <T,>(arr: T[], page: number, size = PAGE_SIZE) => arr.slice((page - 1) * size, page * size);
export const pageHref = (base: string, page: number) => (page <= 1 ? base : `${base}page/${page}/`);
export const pageNumbers = (total: number, from = 2) => Array.from({ length: Math.max(0, total - from + 1) }, (_, i) => i + from);

export interface PagerLabels { aria: string; prev: string; next: string; page: string }

/** Crawlable <nav> with a plain link to every page (so each page is reachable from each other page). */
export function pagerHtml(base: string, page: number, total: number, l: PagerLabels): string {
  if (total <= 1) return '';
  const a = (p: number, text: string, extra = '', rel = '') =>
    `<a href="${pageHref(base, p)}"${rel ? ` rel="${rel}"` : ''} class="px-3 py-1.5 rounded-lg border border-uma-primary/20 bg-white hover:bg-gray-50 text-sm${extra}">${text}</a>`;
  const nums = Array.from({ length: total }, (_, i) => i + 1).map((p) =>
    p === page
      ? `<span aria-current="page" class="px-3 py-1.5 rounded-lg bg-uma-primary text-white text-sm font-semibold">${p}</span>`
      : `<a href="${pageHref(base, p)}" aria-label="${l.page} ${p}" class="px-3 py-1.5 rounded-lg border border-uma-primary/20 bg-white hover:bg-gray-50 text-sm">${p}</a>`
  );
  return `<nav id="skills-pager" aria-label="${l.aria}" class="mt-8 flex flex-wrap items-center justify-center gap-2">${page > 1 ? a(page - 1, `← ${l.prev}`, '', 'prev') : ''}${nums.join('')}${page < total ? a(page + 1, `${l.next} →`, '', 'next') : ''}</nav>`;
}
