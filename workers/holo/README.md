# umamusumedb-holo

Cloudflare Worker + D1 backend for the Simplified Chinese daily holographic pack on umamusumedb.com.

- Worker name: `umamusumedb-holo`
- D1 database: `umamusumedb-holo` (`3e2f0f58-c73d-450b-b6ea-9033baebe3b5`)
- Routes (same zone as the Pages site): `umamusumedb.com/api/holo*` and `umamusumedb.com/zh/holo/*`
  - `/zh/holo/` (no extra path) stays on Cloudflare Pages (the ritual UI)
  - `/zh/holo/UMA-YYYYMMDD-XXXX` is served by this Worker

## Routes

- `POST /api/holo/draw` — issue or return today's card (signed cookies + optional salted IP soft cap)
- `GET /api/holo/today` — return today's issue for this visitor if it already exists
- `GET /api/holo/issue/:id` — JSON lookup; unknown IDs are 404 (never mapped to a random card)
- `GET /zh/holo/:id` — share HTML (`noindex,follow`, no AdSense); canonical is `/zh/tools/daily-pack/`

Deploy the Worker with the Cloudflare MCP (upload script + D1 binding + secret + routes). The Pages site is still deployed with `scripts/pages-upload.mjs` as described in CLAUDE.md.
