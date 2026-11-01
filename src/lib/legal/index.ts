// Legal / info page content for every locale. zh-tw is derived from the authored Simplified Chinese text with OpenCC.
import * as OpenCC from 'opencc-js';
import { twFixLegal } from '../tw-fix';
import type { Locale } from '../i18n';
import type { Doc, Docs } from './types';
import { privacy } from './privacy';
import { terms } from './terms';
import { guides } from './guides';
import { sources } from './sources';

export type DocKind = 'privacy' | 'terms' | 'guides' | 'sources';
const ALL: Record<DocKind, Docs> = { privacy, terms, guides, sources };
const toTw = OpenCC.Converter({ from: 'cn', to: 'twp' });

const mapStrings = (v: any, fn: (s: string) => string): any =>
  typeof v === 'string' ? fn(v) : Array.isArray(v) ? v.map((x) => mapStrings(x, fn)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'id' || k === 'icon' ? x : mapStrings(x, fn)])) : v;

export function getDoc(kind: DocKind, locale: Locale): Doc {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const base = locale === 'zh-tw' ? ALL[kind].zh : ALL[kind][locale as 'en' | 'ja' | 'zh' | 'ko'];
  return mapStrings(base, (s) => {
    let out = s.replace(/\{L\}/g, prefix);
    if (locale === 'zh-tw') out = twFixLegal(toTw(out));
    else if (locale === 'zh') out = out.replace(/耐力/g, '持久力').replace(/毅力/g, '意志力');
    return out;
  });
}
