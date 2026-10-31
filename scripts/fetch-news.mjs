#!/usr/bin/env node
// Snapshot the latest Global announcement headlines (title, date, link only) from the umamusume.gg RSS feed
// into public/data/news.json. Run before a build: `node scripts/fetch-news.mjs`.
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/news.json');
const FEED = 'https://umamusume.gg/feed/';

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();

const res = await fetch(FEED, { headers: { 'user-agent': 'umamusumedb-news-snapshot' } });
if (!res.ok) throw new Error(`feed ${res.status}`);
const xml = await res.text();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
  const get = (tag) => decode((m[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1] || '');
  return {
    title: get('title'),
    link: get('link'),
    date: new Date(get('pubDate')).toISOString().slice(0, 10),
    category: get('category'),
  };
});
if (!items.length) throw new Error('no items parsed');
await writeFile(out, JSON.stringify({ fetchedAt: new Date().toISOString(), source: FEED, items }, null, 2) + '\n');
console.log(`[fetch-news] ${items.length} items, latest ${items[0].date}: ${items[0].title}`);
