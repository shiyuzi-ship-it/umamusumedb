// Localized display names for the data imported from GameTora (see scripts/import-gametora.mjs).
// en / ja use the official English / Japanese names; ko / zh-tw come from the official Korean / Taiwan-server text.
// zh (Simplified) is derived from the Traditional text by character conversion. Missing translations fall back
// (ko -> English, zh / zh-tw -> Japanese) so JP-only content still shows its real name.

const KEY = { ko: 'ko', zh: 'zh', 'zh-tw': 'zh_tw' };
const FALLBACK = { ko: 'en', zh: 'ja', 'zh-tw': 'ja' };

/** @param {any} rec @param {string} loc */
function i18nOf(rec, loc) {
  const k = KEY[loc];
  return k ? rec?.i18n?.[k] ?? null : null;
}

/** Character outfit: "Name (Title)" */
export function charName(c, loc) {
  if (loc === 'en') return c.name_en;
  if (loc === 'ja') return c.name_jp;
  const t = i18nOf(c, loc);
  if (t?.name) { const ti = titleOrOriginal(c, t); return ti ? `${t.name} (${ti})` : t.name; }
  return charName(c, FALLBACK[loc]);
}
/** Outfit title for zh / ko pages: the localized title, else the original Japanese title (never an invented translation). */
function titleOrOriginal(rec, t) {
  return t?.title || rec.title_jp || '';
}
export function charBaseName(c, loc) {
  if (loc === 'en') return c.base_name_en ?? c.name_en;
  if (loc === 'ja') return String(c.name_jp ?? '').replace(/（.*）$/, '');
  const t = i18nOf(c, loc);
  return t?.name ?? charBaseName(c, FALLBACK[loc]);
}
export function charTitle(c, loc) {
  if (loc === 'en') return c.title_en ?? c.title_jp ?? '';
  if (loc === 'ja') return c.title_jp ?? '';
  const t = i18nOf(c, loc);
  return t?.name ? titleOrOriginal(c, t) : charTitle(c, FALLBACK[loc]);
}
/** Support card: "Name [Title]" */
export function cardName(c, loc) {
  if (loc === 'en') return c.name_en;
  if (loc === 'ja') return c.name_jp;
  const t = i18nOf(c, loc);
  if (t?.name) { const ti = titleOrOriginal(c, t); return ti ? `${t.name} [${ti}]` : t.name; }
  return cardName(c, FALLBACK[loc]);
}
export function cardCharName(c, loc) {
  if (loc === 'en') return c.character ?? c.name_en;
  if (loc === 'ja') return String(c.name_jp ?? '').replace(/\[.*\]$/, '').replace(/【.*】$/, '');
  const t = i18nOf(c, loc);
  return t?.name ?? cardCharName(c, FALLBACK[loc]);
}
export function skillName(s, loc) {
  if (loc === 'en') return s.name_en;
  if (loc === 'ja') return s.name_jp || s.name_en;
  const t = i18nOf(s, loc);
  if (t?.name) return t.name;
  // JP-only skills without a translation keep their original Japanese name (the English one is a fan translation).
  if (loc === 'ko' && s.server === 'jp' && s.name_jp) return s.name_jp;
  return skillName(s, FALLBACK[loc]);
}
export function skillDesc(s, loc) {
  if (loc === 'en') return s.description_en || s.effect || '';
  if (loc === 'ja') return s.description_jp || s.description_en || '';
  const t = i18nOf(s, loc);
  if (t?.desc) return t.desc;
  // JP-only skills without a translation keep the original Japanese text instead of the fan-translated English one.
  if (s.server === 'jp' && s.description_jp) return s.description_jp;
  return s.description_en || '';
}
/** Every known name of an entity (for search haystacks). */
export function allNames(rec) {
  const out = new Set([rec.name_en, rec.name_jp, rec.base_name_en, rec.character]);
  for (const k of Object.values(KEY)) {
    const t = rec.i18n?.[k];
    if (t?.name) { out.add(t.name); if (t.title) out.add(`${t.name} ${t.title}`); }
  }
  return [...out].filter(Boolean);
}
