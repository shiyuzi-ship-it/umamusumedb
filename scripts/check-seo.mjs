#!/usr/bin/env node
// Post-build sanity check (run after `npm run build`): hreflang targets exist, are indexable and reciprocal;
// every indexable page has title, description, canonical, matching <html lang>; no duplicate titles per locale.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const ORIGIN = 'https://umamusumedb.com';
const HTML_LANG = { '': 'en', ja: 'ja', zh: 'zh-Hans', 'zh-tw': 'zh-Hant', ko: 'ko' };
const pages = new Map();
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n === 'index.html') {
      const html = readFileSync(p, 'utf8');
      const urlPath = '/' + relative(dist, dirname(p)).split('\\').join('/') + (dirname(p) === dist ? '' : '/');
      const head = html.slice(0, html.indexOf('</head>'));
      pages.set(urlPath, {
        noindex: /<meta name="robots" content="noindex/.test(head),
        title: (head.match(/<title>([^<]*)<\/title>/) || [])[1],
        desc: (head.match(/<meta name="description" content="([^"]*)"/) || [])[1],
        canonical: (head.match(/<link rel="canonical" href="([^"]*)"/) || [])[1],
        lang: (html.match(/<html lang="([^"]+)"/) || [])[1],
        alts: new Map([...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]])),
        ads: head.includes('adsbygoogle.js'),
      });
    }
  }
})(dist);
const errors = [];
const titles = new Map();
for (const [path, pg] of pages) {
  const loc = ['ja', 'zh-tw', 'zh', 'ko'].find((l) => path.startsWith(`/${l}/`)) ?? '';
  if (!pg.title || !pg.canonical) errors.push(`${path}: missing title/canonical`);
  if (pg.lang !== HTML_LANG[loc]) errors.push(`${path}: html lang ${pg.lang}`);
  if (pg.noindex) { if (pg.alts.size) errors.push(`${path}: noindex but has hreflang`); if (pg.ads) errors.push(`${path}: ads on noindex page`); continue; }
  if (!pg.desc) errors.push(`${path}: missing description`);
  if (pg.canonical !== ORIGIN + path) errors.push(`${path}: canonical ${pg.canonical}`);
  const key = `${loc}|${pg.title}`;
  if (titles.has(key)) errors.push(`${path}: duplicate title with ${titles.get(key)} (${pg.title})`); else titles.set(key, path);
  for (const [hl, href] of pg.alts) {
    if (hl === 'x-default') continue;
    const tp = new URL(href).pathname;
    const target = pages.get(tp);
    if (!target) errors.push(`${path}: hreflang ${hl} -> ${tp} does not exist`);
    else if (target.noindex) errors.push(`${path}: hreflang ${hl} -> ${tp} is noindex`);
    else if (target.alts.get(HTML_LANG_TO_HREFLANG(loc)) !== ORIGIN + path) errors.push(`${path}: ${tp} does not link back`);
  }
}
function HTML_LANG_TO_HREFLANG(loc) { return { '': 'en', ja: 'ja', zh: 'zh-CN', 'zh-tw': 'zh-TW', ko: 'ko' }[loc]; }
console.log(`[check-seo] ${pages.size} pages, ${[...pages.values()].filter((p) => p.noindex).length} noindex, ${errors.length} problems`);
for (const e of errors.slice(0, 40)) console.log('  ' + e);
process.exit(errors.length ? 1 : 0);
