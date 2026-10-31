#!/usr/bin/env node
// Build per-locale sitemaps from the built HTML in dist/ (the pages themselves are the source of truth):
//   dist/sitemap-{locale}.xml  (en, ja, zh, zh-tw, ko) with xhtml:link hreflang alternates, and dist/sitemap-index.xml.
// Pages with <meta name="robots" content="noindex…"> are skipped; alternates are copied from each page's own <link rel="alternate" hreflang>.
import { readdirSync, readFileSync, writeFileSync, statSync, openSync, readSync, closeSync, existsSync, rmSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ORIGIN = 'https://umamusumedb.com';
const LOCALES = ['en', 'ja', 'zh', 'zh-tw', 'ko'];
const localeOf = (path) => LOCALES.find((l) => l !== 'en' && (path === `/${l}/` || path.startsWith(`/${l}/`))) ?? 'en';

const lastmod = (() => {
  try { return JSON.parse(readFileSync(join(root, 'public/data/releases.json'), 'utf8')).generatedAt.slice(0, 10); } catch { return new Date().toISOString().slice(0, 10); }
})();

function head(file) {
  const fd = openSync(file, 'r');
  const buf = Buffer.alloc(40000);
  const n = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  const s = buf.toString('utf8', 0, n);
  const end = s.indexOf('</head>');
  return end > 0 ? s.slice(0, end) : s;
}

const pages = { en: [], ja: [], zh: [], 'zh-tw': [], ko: [] };
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (name !== 'index.html') continue;
    const urlPath = '/' + relative(dist, dirname(p)).split('\\').join('/') + (dirname(p) === dist ? '' : '/');
    const h = head(p);
    const robots = (h.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
    if (/noindex/i.test(robots)) continue;
    const canonical = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    if (!canonical || new URL(canonical).pathname !== urlPath) continue; // only canonical-to-self pages
    const alts = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
    pages[localeOf(urlPath)].push({ loc: ORIGIN + urlPath, alts });
  }
})(dist);

const esc = (s) => s.replace(/&/g, '&amp;');
const written = [];
for (const l of LOCALES) {
  const list = pages[l].sort((a, b) => (a.loc < b.loc ? -1 : 1));
  if (!list.length) continue;
  const body = list.map((p) => `  <url>\n    <loc>${esc(p.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${p.alts.map(([h, href]) => `    <xhtml:link rel="alternate" hreflang="${h}" href="${esc(href)}"/>`).join('\n')}${p.alts.length ? '\n' : ''}  </url>`).join('\n');
  writeFileSync(join(dist, `sitemap-${l}.xml`), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`);
  written.push([l, list.length]);
}
writeFileSync(
  join(dist, 'sitemap-index.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written.map(([l]) => `  <sitemap>\n    <loc>${ORIGIN}/sitemap-${l}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`).join('\n')}\n</sitemapindex>\n`
);
for (const stale of ['sitemap-0.xml']) if (existsSync(join(dist, stale))) rmSync(join(dist, stale));
console.log('[sitemaps]', written.map(([l, n]) => `${l}=${n}`).join(' '), 'total', written.reduce((a, [, n]) => a + n, 0));
