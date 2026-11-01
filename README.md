# UmamusumeDB

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/site-umamusumedb.com-brightgreen)](https://umamusumedb.com)

A free, fan-made database and tool set for **Uma Musume Pretty Derby** (ウマ娘 プリティーダービー / 赛马娘 / 優俊少女 / 우마무스메), covering both the **Global** and **Japanese** servers. Not affiliated with Cygames.

**Live site: <https://umamusumedb.com>** · Languages: English · 日本語 · 简体中文 · 繁體中文 · 한국어

[日本語 README](README.ja.md)

## What is on the site

- **Database**: characters (with outfits), support cards, skills, scenarios. Content that is not on Global yet is marked "JP only".
- **Global release schedule** (`/global-release-schedule/`): the real JP→Global release date of everything already out, plus clearly labelled *unofficial* estimate windows for what is still JP-only. The method is published on the page.
- **Support card rankings** (`/support-card-rankings/`): a calculated ranking (not a tier list). Score = sum of weight × max-level value of each effect, compared only within the same type and rarity. All weights and limitations are listed on the page.
- **Skill category pages** (`/skills/category/`): gold / white / unique skills by distance, running style and effect.
- **Tools** (`/tools/`): training calculator, factor inheritance calculator, skill builder, support deck builder, character comparison, training goals.
- Character and support card lists with search/filter, a Tier List page, JP/Global news headlines, and a `/data-sources/` page that credits every source.

The site is static (no backend), rebuilt from the data in this repo.

## Data sources and credits

- Game data (characters, support cards, skills, scenarios, release dates) is imported from **[GameTora](https://gametora.com/umamusume)'s public data files** by `scripts/import-gametora.mjs`.
- English and Japanese names/descriptions are the official game text. Korean and Traditional Chinese (TW server) come from GameTora's official in-game text. Simplified Chinese is Traditional Chinese converted with OpenCC, so it is **not** the CN server text and some terms may differ from the CN client.
- Training formulas are community-measured (Cygames has not published them): see [uma.guide](https://uma.guide), [umareference.com](https://umareference.com) and [KamiGame](https://kamigame.jp/umamusume/).
- Prototype racehorse facts use [Wikidata](https://www.wikidata.org) (CC0).
- Images and icons are the property of Cygames, Inc. and are used only to identify game content. They are removed on request.
- Training-event data is deliberately **not** included.

Full details: <https://umamusumedb.com/data-sources/>

## Tech stack

[Astro](https://astro.build) 5 (static output) · React + TypeScript · Tailwind CSS · Cloudflare Pages · Vitest

## Development

Requires Node.js 18+.

```bash
git clone https://github.com/shiyuzi-ship-it/umamusumedb.git
cd umamusumedb
npm install
npm run dev        # dev server
npm run build      # production build (writes dist/ and the sitemaps)
npm test           # unit tests
node scripts/check-seo.mjs   # SEO checks on the built site
```

Layout: `src/pages` (Astro pages, per-locale routes), `src/components`, `src/lib` (data access), `scripts/` (data import, sitemap and SEO tooling), `public/data` (static JSON).

## Contributing

Corrections to data, translations or the ranking weights are very welcome: please [open an issue](https://github.com/shiyuzi-ship-it/umamusumedb/issues) or a pull request. If you maintain a related Uma Musume tool or resource list and think the site belongs there (or something here is wrong), an issue is the best way to reach us.

## License

Code is released under the [MIT License](LICENSE). Game data, names, images and trademarks belong to their respective owners (Cygames, Inc. and others); see the data sources above.
