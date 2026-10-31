# BG Venture Properties

The marketing website and property portal for **BG Venture Properties** — a Dubai
real estate brokerage covering **leasing property brokerage**,
**buying & selling brokerage**, and **real estate management supervision**.

Luxury editorial design (Playfair Display + Manrope), English / Arabic / Chinese
with RTL support.

**Live site:** https://bgventureproperties.ae/

---

## Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite (real-URL SPA)  |
| Backend  | Express (`server/server.mjs` + `store.mjs`)  |
| Data     | `data/properties.json` + live admin API merge|
| Images   | `public/img/<category>/` pools + live API    |

## Pages

`/`, `/buy[/:category]`, `/rent[/:category]`, `/property/:slug`,
`/services/property-management`, `/about`, `/contact`. The Express SPA fallback
serves `index.html` for all non-API paths; legacy `#/...` links redirect.

## Property data

- `data/properties.json` — 570 seeded **sample** listings (`sample:true`, badged
  in the UI). Regenerate: `node scripts/generate-properties.mjs` (also rebuilds
  `public/sitemap.xml`). Replace with real records in the same shape to go live.
- Live published listings are merged server-side from the admin API
  (`ADMIN_API` env, default `https://bgv-admin.joepethj.workers.dev`) with a
  5-minute cache — real listings always appear first.
- Category image pools: `node scripts/download-images.mjs` (Unsplash, verified).

## API

- `GET /api/meta` — totals, locations, category counts
- `GET /api/properties?purpose=&category=&location=&min_price=&max_price=&min_size=&max_size=&beds=&baths=&furnishing=&availability=&q=&sort=&page=&limit=`
- `GET /api/properties/:slugOrRef`
- `POST /api/inquiries` — validates + persists to `data/inquiries.json`
- `GET /api/inquiries` — `Authorization: Bearer $ADMIN_TOKEN` (disabled if unset)
- `POST /api/enquiry` — legacy general enquiry (also persisted)

## Commands

```bash
node node_modules/typescript/bin/tsc -b      # typecheck
node node_modules/vite/bin/vite.js build     # build to dist/
node server/server.mjs                       # serve at http://127.0.0.1:3000
node node_modules/vite/bin/vite.js           # dev server (5173, /api proxied)
node --test website.test.mjs                 # test suite
```

Build must run from a local drive (`C:\Users\Joepeth\dev\bg-build`), not the
UNC share — see `AGENTS.md`.

## Notes

- Listings marked **"Sample listing"** are demonstration properties — never
  presented as verified inventory.
- Inquiries are stored in `data/inquiries.json` (gitignored); no email is sent.
  Set `ADMIN_TOKEN` to enable the staff retrieval endpoint.
- No unverified statistics, guaranteed returns, or testimonials — returns are
  explicitly not guaranteed (see the compliance note on the About page).
