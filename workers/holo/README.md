# umamusumedb-holo

Cloudflare Worker + D1 backend for the daily holographic pack on umamusumedb.com (all five locales).

- Worker name: `umamusumedb-holo`
- D1 database: `umamusumedb-holo` (`3e2f0f58-c73d-450b-b6ea-9033baebe3b5`)
- Routes on umamusumedb.com and www:
  - `*/api/holo*`
  - `*/holo/*`, `*/ja/holo/*`, `*/zh/holo/*`, `*/zh-tw/holo/*`, `*/ko/holo/*`
  - Exact ritual paths (`/holo/`, `/ja/holo/`, `/zh/holo/`, `/zh-tw/holo/`, `/ko/holo/`) are proxied to Cloudflare Pages (`umamusumedb.pages.dev`)
  - `/{locale}/holo/UMA-YYYYMMDD-XXXX` is served by this Worker

## Routes

- `POST /api/holo/draw` — issue or return today's card (signed cookies + optional salted IP soft cap)
- `GET /api/holo/today` — return today's issue for this visitor if it already exists
- `GET /api/holo/issue/:id` — JSON lookup; unknown IDs are 404 (never mapped to a random card)
- `GET /holo/:id`, `/ja/holo/:id`, `/zh/holo/:id`, `/zh-tw/holo/:id`, `/ko/holo/:id` — share HTML (`noindex,follow`, no AdSense); canonical is that locale's `/tools/daily-pack/`

Deploy the Worker with the Cloudflare MCP (upload script + D1 binding + `keep_bindings` for the signing secret + routes). The Pages site is still deployed with `scripts/pages-upload.mjs` as described in CLAUDE.md. Ship Worker and Pages together so non-ZH share URLs are served.
