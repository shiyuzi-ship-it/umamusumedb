// Per-locale label dictionaries for the interactive tools (server side; passed to the React islands as `labels`).
// zh-tw is generated from zh with OpenCC (Taiwan phrases). Missing keys fall back to English.
import * as OpenCC from 'opencc-js';
import { twFix } from '../tw-fix';
import type { Locale } from '../i18n';
import { common, tc, fc, sb, tg, db, cc, ccPage, type Rec } from './common';

const GROUPS: Record<string, Rec[]> = { tc: [tc], fc: [fc], sb: [sb], tg: [tg], db: [db], cc: [cc, sb, ccPage] };
const toTw = OpenCC.Converter({ from: 'cn', to: 'twp' });
const IDX: Record<Locale, number> = { en: 0, ja: 1, zh: 2, 'zh-tw': 2, ko: 3 };
const cache = new Map<string, Record<string, string>>();

/** Labels for one tool (group key: tc | fc | sb | db | tg | cc) plus the shared stat / mood / scenario terms. */
export function toolLabels(locale: Locale, group: string): Record<string, string> {
  const ck = locale + ':' + group;
  const hit = cache.get(ck);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const rec of [common, ...(GROUPS[group] ?? [])]) {
    for (const [k, v] of Object.entries(rec)) {
      let s = v[IDX[locale]] || v[0];
      if (locale === 'zh-tw') s = twFix(toTw(s));
      out[k] = s;
    }
  }
  cache.set(ck, out);
  return out;
}
