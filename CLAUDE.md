# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UmamusumeDB is a comprehensive database and tools platform for the game Umamusume: Pretty Derby, optimized for SEO around the "umamusumedb" keyword. The project is configured as a **static site** deployed to Cloudflare Pages.

**Live URL**: https://umamusumedb.com
**Pages URL**: https://umamusumedb.pages.dev
**Image CDN**: https://img.umamusumedb.com (Cloudflare R2 custom domain)

## Tech Stack

- **Frontend**: Astro (Static Site Generator) + React components + Tailwind CSS
- **Data Storage**: Static JSON files served via CDN
- **Image Storage**: Cloudflare R2 (Object storage)
- **Deployment**: Cloudflare Pages (Static hosting)
- **Build Tool**: Vite
- **Language**: TypeScript

## Project Structure

```
umamusumedb/
├── src/
│   ├── pages/          # Astro pages (static generation)
│   ├── components/     # React components
│   ├── layouts/        # Page layouts
│   ├── lib/           # Utilities and data fetching
│   └── styles/        # Global styles
├── public/
│   └── data/          # Static JSON data files
├── scripts/           # Data collection and export scripts
├── database/          # SQLite database (development only)
├── dist/             # Build output (static files)
└── astro.config.mjs   # Astro configuration
```

## Common Commands

```bash
# Development
npm install                    # Install dependencies
node scripts/export-to-json.js # Export database to JSON (required first time)
npm run dev                    # Start development server (http://localhost:4321)

# Build & Deploy
npm run build                  # Build static site
npm run preview                # Preview production build locally
npm run deploy                 # Deploy to Cloudflare Pages

# Data Management
node scripts/collect-characters.js    # Update character data
node scripts/collect-support-cards.js # Update support card data
node scripts/collect-skills.js        # Update skills data
node scripts/create-tier-lists.js     # Create tier list data
node scripts/export-to-json.js        # Export all data to JSON (rebuild JSON files)
node scripts/update-image-urls.js     # Update image URLs to custom domain
```

## Core Architecture (Static Site)

### Data Flow
1. **Build Time**: SQLite database → JSON export → Static files
2. **Runtime**: Static HTML + JSON files served from CDN
3. **Client-Side**: React components fetch and display JSON data
4. **CDN**: All assets cached at Cloudflare edge locations

### Key Features
- **Characters Page**: Browse all Uma Musume with stats and skills
- **Support Cards**: Filter and search support cards
- **Tier Lists**: Community rankings with voting
- **Search**: Client-side search across all data

### Performance Strategy
- Pre-rendered HTML for instant page loads
- JSON data cached at CDN edge
- Client-side filtering and sorting
- Lazy loading for images

## Deployment to Cloudflare Pages

### Environment Variables
```env
R2_ACCESS_KEY_ID=<configured>
R2_SECRET_ACCESS_KEY=<configured>
R2_BUCKET_NAME=umamusume
R2_PUBLIC_URL=https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev
CLOUDFLARE_API_TOKEN=<configured>
CLOUDFLARE_ACCOUNT_ID=<configured>
```

### Image Storage Configuration
- **R2 Bucket**: umamusume
- **Custom Domain**: img.umamusumedb.com (configured in Cloudflare R2 settings)
- **Image URLs**: All images should use `https://img.umamusumedb.com/` prefix
- **Update Script**: `node scripts/update-image-urls.js` (updates database URLs from R2 default to custom domain)

### Manual Deployment
```bash
npm run build
npm run deploy  # Uses wrangler pages deploy
```

### Architecture Decision (January 2025)
**Staying with Cloudflare Pages** - Not migrating to Workers because:
- Pure static site with no server-side requirements
- Pages provides simpler deployment for static content
- Already successfully deployed and working at https://umamusumedb.pages.dev
- No immediate benefits from Workers for this use case

## Why Static Site Architecture?

1. **Performance**: Static files served from CDN edge locations (< 50ms latency)
2. **Cost**: No compute costs, only storage and bandwidth
3. **Reliability**: No server to maintain or scale
4. **SEO**: Pre-rendered HTML for search engines
5. **Simplicity**: Single deployment to Cloudflare Pages
6. **Scalability**: Can handle millions of requests with CDN

## Compliance baseline (applies to every data source, every update)

- Never use, scrape, mirror or redistribute a source that explicitly refuses citation / scraping / redistribution (terms of service, robots.txt, site notice, or a direct request). If in doubt, leave it out and tell the owner.
- Never decode, de-obfuscate or reverse-engineer data that a source deliberately obfuscates or encodes to stop bulk reuse, even if the technique is simple. Only use data a source publishes openly as data (public JSON / RSS / API intended for reading).
- Always credit sources on `/data-sources/`; remove content immediately on a takedown request. Artwork belongs to Cygames, Inc.; the site is an unofficial fan project.
- Keep these rules when a source changes its format: if a previously open file becomes encoded / blocked, drop that data instead of working around it.

## Weekly update procedure (since 2026-10) — follow this exactly

The site is static. All data in `public/data/*.json` comes from GameTora's public data files (no SQLite, no hand-written data).
Five locales are built from the same data: `en` (default, no prefix), `ja` (`/ja/`), `zh` Simplified (`/zh/`), `zh-tw` Traditional (`/zh-tw/`), `ko` (`/ko/`).
Nothing depends on GitHub Actions; run these steps from a checkout of `shiyuzi-ship-it/umamusumedb` (branch `main`).

### 1. Refresh data (idempotent, safe to re-run)
```bash
npm ci                              # first time / after dependency changes
node scripts/import-gametora.mjs    # characters, supportCards, skills, scenarios, releases, *-lite.json, i18n names (ko / zh-TW / zh-CN), images
node scripts/fetch-news.mjs         # Global headlines (umamusume.gg RSS) -> news.json; official JP news (umamusume.jp) -> news-ja.json
```
- `import-gametora.mjs` also calls `scripts/fetch-images.mjs`: real GameTora artwork is downloaded only for ids that have no file yet
  (`public/img/characters/{card_id}.webp`, `public/img/cards/{support_id}.webp`, `public/img/skills/{icon_id}.webp`; webp via sharp) and
  `image_url` / `icon_url` are written into the JSON. Set `GT_CACHE=/some/dir` to cache the downloaded JSON for offline re-runs.
- Every character / card / skill gets `i18n: { ko, zh_tw, zh }` (official Korean text and Taiwan-server text from GameTora). **Simplified Chinese
  is derived from the Traditional text with `opencc-js` (character conversion, not CN-server text)** — say so on `/data-sources/`. Missing translations
  fall back (ko -> English, zh/zh-tw -> Japanese) in `src/lib/localized.js`, so new JP-only items still show their real names.
- **Training / story events are NOT included (removed 2026-11).** GameTora ships event data deliberately obfuscated (XOR+base64, numeric dictionaries); decoding it for bulk reuse is a compliance risk, so the decoder (`import-events.mjs`), `src/lib/events.ts`, the events UI and `training-events.json` were deleted. Do not re-add them or any equivalent unless an openly licensed / explicitly permitted source exists. `/data-sources/` states this in all locales.
- Scenarios carry official ko / zh-tw names from GameTora (`i18n`); zh is OpenCC of zh-tw; missing ones fall back to Japanese.
- News: `/ja/updates/` shows official Japanese headlines (`news-ja.json`, from umamusume.jp's own `/api/ajax/pr_info_index`, same endpoint its news page
  uses; the microCMS key is not used). en / zh / zh-tw / ko show the English Global headlines with a note (official KR / TW news hosts were unreachable).
- `npm run build` runs `scripts/build-lite-i18n.mjs` first: localized `skills-lite.<loc>.json` / `support-cards-lite.<loc>.json` for the tools (do not commit-edit).
- Not imported on purpose: anything without a verifiable source (e.g. the Training Goals checklist is the site's legacy, unsourced content — only its UI is localized).
  Known gaps: 8 skill icon ids that GameTora has no image for (2010011, 20361, 20362, 20366, 20376, 20381, 20382, 20386 — new JP-only skills; they use the site-made shared `/img/skills/placeholder.webp`, generated by `fetch-images.mjs`, and are re-tried on every run so a real icon replaces it once GameTora publishes one); a few newest support cards use GameTora's small
  `support_card_s_{id}.png` fallback art.
- Never edit `public/data/*.json` by hand — fix the importer instead. New game ids appear automatically on all five locales (pages are generated from the JSON).

### 2. Build and check
```bash
npm run build                # astro build + scripts/build-sitemaps.mjs (dist/sitemap-{en,ja,zh,zh-tw,ko}.xml + sitemap-index.xml)
node scripts/check-seo.mjs   # must print "0 problems": hreflang targets exist/reciprocal/indexable, titles unique, canonical, html lang, no ads on noindex pages
npx vitest run
```
- Page budget: Cloudflare Pages allows **20,000 files** per deployment; the build is ~10,000 pages + ~1,000 images (~11,100 files). Check
  `find dist -type f | wc -l` after a data refresh; if it nears 18k, reduce pages (e.g. stop building a locale's skill pages) before deploying.
- Pages per locale: en/ja build every character, card and skill (evolved, JP-only (en) and placeholder skills are `noindex`); zh / zh-tw / ko build all
  characters, cards, indexable global skills, updates and tools. `src/lib/i18n.ts` (`availableLocalesFor`) is the single source of truth for which locales have
  which page (hreflang, language switcher); `src/lib/skill-class.ts` classifies skills (`all` / `jp` / `none`).
- Skills list pages are paginated (100 per page, `src/lib/pagination.ts`): `/skills/`, `/skills/page/N/` (and the same under `/ja/`, `/zh/`, `/zh-tw/`, `/ko/`). Every page links to every other page, page N>1 is indexable with its own title and self-canonical (no hreflang). Search/filters fetch the full list from `/skills-data/{locale}.json` (built by `src/pages/skills-data/[lang].json.ts`) on first use and render with the same card markup (`src/lib/skill-list-render.ts`, client logic `src/lib/skills-list-client.ts`). Do not put all skills back into one HTML page.
- Search: `src/pages/search/[lang].json.ts` emits `/search/{locale}.json` (names in every language + English/romaji, loaded by the header search box).
- Sitemaps are built from the built HTML (`scripts/build-sitemaps.mjs`): noindex pages are skipped, hreflang alternates are copied from each page.
  `robots.txt` points to `sitemap-index.xml`; `/sitemap.xml` and `/sitemap-0.xml` redirect to it (`public/_redirects`).
- UI strings for all locales: `src/lib/ui-strings.ts` (add a key to `en`; `ja`, `zh`, `ko` need their own; `zh-tw` is converted from `zh`).
  New-locale templates: `src/components/l10n/` + `src/pages/[lang]/`; en/ja keep their own pages (`src/pages/*`, `src/pages/ja/*`).

### 3. Commit and push
```bash
git add -A && git commit -m "Data update YYYY-MM-DD" && git push origin main
```

### 4. Deploy to Cloudflare Pages (project `umamusumedb`, production branch `main`, no API token needed)
Uses the Cloudflare MCP (`execute` tool) and an upload JWT; the JWT is written to a file and never printed.
1. MCP `execute` (with `write_to_file: true`): `GET /accounts/2a1d5be78bef5d6b2063bd45ebc2a3da/pages/projects/umamusumedb/upload-token` -> the response file contains `{ jwt }`.
2. `node scripts/pages-upload.mjs <that-file> <commit-hash> "<commit message>"` — hashes dist/ (blake3, same as wrangler), calls
   `/pages/assets/check-missing`, `/pages/assets/upload`, `/pages/assets/upsert-hashes` with the JWT, then writes `/workspace/deploy/create.js`
   (the deployment request incl. `_redirects` / `_headers`) and the manifest.
3. MCP `execute` with `"code": "$file:/workspace/deploy/create.js"` -> creates the production deployment; note the deployment id.
4. Delete the JWT file. If step 5 shows a problem, roll back to the previous deployment (MCP `POST .../deployments/{id}/rollback`, or the dashboard).
5. Verify live with curl: `/`, `/ja/`, `/zh/`, `/zh-tw/`, `/ko/`, one character + one card page per locale (200, `<html lang>`, hreflang block incl. `x-default`),
   `/search/en.json` (and the other four), `/sitemap-index.xml` + the five `sitemap-*.xml`, an image (`/img/characters/100101.webp` -> 200 image/webp with cache-control),
   old redirects (`/tier-list/` and legacy ids -> 301).
(`npm run deploy` with wrangler + `CLOUDFLARE_API_TOKEN` also works if a token ever exists, but never ask the user for one.)

### Notes
- Formulas in the tools (training gain, spark inheritance, hint discounts) are community-measured; sources are cited in the tool components and `/data-sources/`.
- Tool UIs are localized (en / ja / zh / zh-tw / ko): label dictionaries in `src/lib/tool-strings/common.ts` (`[en, ja, zh(=TW text via OpenCC), ko]` tuples; zh-tw is
  converted at build with `src/lib/tw-fix.ts` corrections), served by `toolLabels(locale, group)` and passed to each React island as `labels` (`src/components/tools/tool-i18n.ts`).
  Add a tool string once in `common.ts`, then `t('key')` in the component. Tool pages: `src/pages/tools/*`, `src/pages/ja/tools/*`, `src/pages/[lang]/tools/*`.
- Legal / info pages (privacy, terms, data sources, guides) are data-driven in all five locales: content in `src/lib/legal/{privacy,terms,guides,sources}.ts`
  (en / ja / zh / ko authored; zh-tw = OpenCC of zh + `twFixLegal`), rendered by `src/components/l10n/DocPage.astro`. `{L}` = locale URL prefix.
  Keep the privacy policy truthful about what the site does (Google Analytics, Google AdSense cookies, localStorage in tools) whenever code changes. There is no separate "about" page.
- The old `collect-*` / `export-to-json` / R2 scripts and `database/` no longer feed the site.
- AdSense (auto ads script) and GA live in `src/layouts/Layout.astro`; the AdSense script is intentionally not loaded on `noindex` pages. Keep the ad code intact.
- `/guides/`, `/privacy-policy/`, `/terms-of-service/`, `/data-sources/` and every tool (incl. `/tools/character-comparison/`) exist in all five locales.

## Common Issues and Solutions

### Data Not Loading
- Ensure JSON files exist in `public/data/`
- Run `node scripts/export-to-json.js` before building
- Check browser console for 404 errors

### Build Errors
- Clear cache: `rm -rf dist .astro node_modules`
- Reinstall: `npm install`
- Ensure Node.js version is 18+

### Cloudflare Pages Issues
- Build output must be in `dist` directory
- No server-side features allowed
- All data must be static JSON files

### Image 403 Errors
If images return 403 errors, ensure they use the custom domain:
1. Check R2 custom domain is active in Cloudflare: Settings > Custom Domains > img.umamusumedb.com
2. Update database image URLs: `node scripts/update-image-urls.js`
3. Re-export data: `node scripts/export-to-json.js`
4. Deploy: `npm run deploy`
- **Note**: Always use `https://img.umamusumedb.com/` not the R2 default domain

## Performance Targets

- Page load: < 1 second (static HTML)
- Data fetch: < 100ms (CDN cached JSON)
- Support unlimited users (CDN scales automatically)

## SEO Optimization

- Target keyword: "umamusumedb"
- Static HTML for search engine crawlers
- Structured data for rich snippets
- Multi-language support: EN / JA / ZH-Hans / ZH-Hant / KO with hreflang + x-default and per-locale sitemaps

## Future Enhancements

- Upload actual character/card images to R2
- Implement user voting system for tier lists
- Add more detailed guides and strategy content
- Enhance mobile app experience
- Add sitemap.xml for better SEO