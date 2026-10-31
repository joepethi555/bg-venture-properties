# Project conventions

- React 18 + TypeScript + Vite frontend; Express backend in `server/server.mjs`. Requires Node.js 20+.
- UNC path workaround: the project lives on a network share where npm/Vite cannot run. Work in `C:\Users\Joepeth\dev\bg-build` (or a mapped drive), then copy `src/`, `server/`, `public/`, `data/`, `scripts/`, `dist/`, `index.html`, `website.test.mjs`, `package*.json` back to the share.
- Build: `node node_modules\typescript\bin\tsc -b` then `node node_modules\vite\bin\vite.js build` (run from a local drive, not UNC).
- Run: `node server\server.mjs` (serves `dist/` at http://127.0.0.1:3000). `HOST`/`PORT` env vars optional. Kill stale listeners before restarting.
- Dev mode: `node node_modules\vite\bin\vite.js` (port 5173).
- Verify: `node --test website.test.mjs` (health, properties API, inquiry validation/persistence, security headers, source content, dist serving).

## Architecture

- Real-URL SPA (history router in `src/lib/router.tsx`): `/`, `/buy[/:category]`, `/rent[/:category]`, `/property/:slug`, `/services/property-management`, `/about`, `/contact`. Express SPA fallback serves `index.html` for all paths; legacy `#/...` links redirect.
- Property data: `data/properties.json` = 570 generated sample listings (`sample:true`, badged "Sample listing" in UI). Regenerate with `node scripts/generate-properties.mjs` (also rebuilds `public/sitemap.xml`). Category image pools live in `public/img/<category>/` — refresh with `node scripts/download-images.mjs` (Unsplash, verified).
- `server/store.mjs` merges the sample inventory with LIVE published listings from the admin API (`ADMIN_API` env, default `https://bgv-admin.joepethj.workers.dev`, 5-min cache, graceful fallback). Live listings always sort first and are never marked as samples.
- API: `GET /api/meta`, `GET /api/properties` (purpose/category/location/price/size/beds/baths/furnishing/availability/q/sort/page/limit), `GET /api/properties/:slugOrRef`, `POST /api/inquiries` (validates + persists to `data/inquiries.json`), `GET /api/inquiries` (Bearer `ADMIN_TOKEN` env; disabled without it), `POST /api/enquiry` (legacy, also persists).
- To go live with real inventory, replace `data/properties.json` with real records in the same shape — no frontend changes needed.
- Structure: `src/App.tsx` (shell + routes), `src/lib/` (router, api client, content constants), `src/pages/` (Home, Marketplace, PropertyDetail, Management, About, Contact, NotFound), `src/components/` (Header, Footer, PropertyCard, FilterBar, InquiryForm, Gallery, Icon, FloatingContactButtons), `src/i18n.ts` (EN/AR/ZH; AR adds RTL).
- Frontend talks ONLY to `/api/*`; the admin Workers API is merged server-side (also used for anonymous `track()` analytics events — CSP allows it).
- The user supplied 200+ landlords and 5,000 properties; labelled as "supported", not currently managed. Do not add unverified statistics, guaranteed returns, credentials, or testimonials.
- Photography: sample listings use Unsplash pools in `public/img/`; hero/branding images in `public/` root; live listing images stream from the admin API domain (allowed by CSP img-src).
- Visual direction: luxury editorial serif (Playfair Display) headlines + Manrope/Inter body; white, light grey, navy (#16233a), champagne gold (#c9a24b). Bilingual EN/AR (+ZH) with RTL toggle.
- Confirm required company and property-advertising disclosures before public launch.
