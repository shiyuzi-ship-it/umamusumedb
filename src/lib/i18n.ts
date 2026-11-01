// Locale helpers. en is the default locale (no URL prefix); the others live under /ja/, /zh/ (Simplified), /zh-tw/ (Traditional), /ko/.
export const SUPPORTED_LOCALES = ['en', 'ja', 'zh', 'zh-tw', 'ko'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const SITE_ORIGIN = 'https://umamusumedb.com';

export const LOCALE_META: Record<Locale, { htmlLang: string; hreflang: string; og: string; native: string; short: string }> = {
  en: { htmlLang: 'en', hreflang: 'en', og: 'en_US', native: 'English', short: 'EN' },
  ja: { htmlLang: 'ja', hreflang: 'ja', og: 'ja_JP', native: '日本語', short: 'JA' },
  zh: { htmlLang: 'zh-Hans', hreflang: 'zh-CN', og: 'zh_CN', native: '简体中文', short: '简' },
  'zh-tw': { htmlLang: 'zh-Hant', hreflang: 'zh-TW', og: 'zh_TW', native: '繁體中文', short: '繁' },
  ko: { htmlLang: 'ko', hreflang: 'ko', og: 'ko_KR', native: '한국어', short: 'KO' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) return locale;
  }
  return DEFAULT_LOCALE;
}

export function ensureLeadingSlash(pathname: string): string {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function ensureTrailingSlash(pathname: string): string {
  if (!pathname) return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function stripLocaleFromPathname(pathname: string): string {
  const normalized = ensureLeadingSlash(pathname);
  const locale = getLocaleFromPathname(normalized);
  if (locale === DEFAULT_LOCALE) return ensureTrailingSlash(normalized);
  const prefix = `/${locale}`;
  const stripped = normalized === prefix ? '/' : normalized.slice(prefix.length);
  return ensureTrailingSlash(stripped || '/');
}

export function localizePathname(pathname: string, locale?: Locale): string {
  const basePath = stripLocaleFromPathname(pathname);
  const resolved: Locale =
    locale ?? (typeof window !== 'undefined' ? getLocaleFromPathname(window.location.pathname) : DEFAULT_LOCALE);
  if (resolved === DEFAULT_LOCALE) return ensureTrailingSlash(basePath);
  return ensureTrailingSlash(basePath === '/' ? `/${resolved}` : `/${resolved}${basePath}`);
}

export const getHtmlLang = (locale: Locale) => LOCALE_META[locale].htmlLang;
export const getOgLocale = (locale: Locale) => LOCALE_META[locale].og;
export const getHreflang = (locale: Locale) => LOCALE_META[locale].hreflang;

/**
 * Which locales have a real page for a (locale-less) path. Used for hreflang, the language switcher and the sitemaps.
 * skillClass: 'all' = indexable skill (global, not evolved) -> every locale; 'jp' = JP-only skill (only the ja page is indexable);
 * 'none' = evolved skill (noindex everywhere, no alternates).
 */
const ALL: Locale[] = ['en', 'ja', 'zh', 'zh-tw', 'ko'];
const NEW_ONLY_EN: Locale[] = ['en'];

export interface AvailOpts { skillClass?: Map<string, 'all' | 'jp' | 'none'>; skillLocales?: Map<string, Locale[]>; categoryLocales?: Map<string, Locale[]> }

export function availableLocalesFor(basePath: string, opts: AvailOpts = {}): Locale[] {
  const p = ensureTrailingSlash(basePath);
  if (p === '/' || p === '/characters/' || p === '/cards/' || p === '/skills/' || p === '/skills/category/' || p === '/updates/' || p === '/tools/' || p === '/global-release-schedule/' || p === '/support-card-rankings/') return ALL;
  if (/^\/(characters|cards)\/[^/]+\/$/.test(p)) return ALL;
  if (/^\/(characters|cards)\/page\/\d+\/$/.test(p)) return ALL; // every locale lists the same entries, so the same number of pages
  const cat = p.match(/^\/skills\/category\/([^/]+)\/$/);
  if (cat) return opts.categoryLocales?.get(cat[1]) ?? [];
  const skill = p.match(/^\/skills\/([^/]+)\/$/);
  if (skill) {
    const sl = opts.skillLocales?.get(skill[1]);
    if (sl) return sl;
    const cls = opts.skillClass?.get(skill[1]) ?? 'none';
    return cls === 'all' ? ALL : cls === 'jp' ? ['ja'] : [];
  }
  if (/^\/tools\/(factor-calculator|skill-builder|support-deck|training-calculator|training-goals)\/$/.test(p)) return ALL;
  if (p === '/tools/character-comparison/') return ALL;
  if (p === '/data-sources/' || p === '/links/' || p === '/privacy-policy/' || p === '/terms-of-service/' || p === '/guides/') return ALL;
  return NEW_ONLY_EN;
}

/** Link to a path in the given locale, falling back to the English page when that locale has no such page. */
export function hrefFor(path: string, locale: Locale, opts: AvailOpts = {}): string {
  return availableLocalesFor(path, opts).includes(locale) ? localizePathname(path, locale) : localizePathname(path, 'en');
}
