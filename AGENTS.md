# Project conventions

- React 18 + TypeScript + Vite frontend; Express backend in `server/server.mjs`. Requires Node.js 20+.
- UNC path workaround: the project lives on a network share where npm/Vite cannot run. Map it to a drive (`net use B: "<share-path>"`) or work in `C:\Users\Joepeth\dev\bg-build`, then copy `dist/`, `node_modules/`, and `package-lock.json` back to the share.
- Build: `node node_modules\typescript\bin\tsc -b` then `node node_modules\vite\bin\vite.js build` (run from a local/mapped drive, not UNC).
- Run: `node server\server.mjs` (serves `dist/` at http://127.0.0.1:3000). `HOST`/`PORT` env vars optional. Kill stale listeners before restarting.
- Dev mode: `node node_modules\vite\bin\vite.js` (port 5173).
- Verify: `node --test website.test.mjs` (covers /api/health, /api/enquiry validation, security headers, source content, dist serving).
- Structure: `src/App.tsx` (all sections + i18n toggle + reveal/nav observers), `src/components/Icon.tsx`, `src/i18n.ts` (Arabic translations), `src/styles.css` (global stylesheet), `public/` (images incl. logo-transparent.png used in header/favicon).
- The enquiry form prepares a mailto draft; `POST /api/enquiry` validates and acknowledges but does not send email. No data is stored.
- Photography is illustrative, sourced from Unsplash, served locally from `public/`; fonts from Google Fonts. No actual property inventory exists yet.
- Core services are the three licensed activities: leasing property brokerage, buying & selling brokerage, real estate management supervision. Supporting services: investment advisory, tenant sourcing, overseas property search.
- The user supplied 200+ landlords and 5,000 properties; labelled as "supported", not currently managed. Do not add unverified statistics, guaranteed returns, credentials, or testimonials.
- Visual direction: luxury editorial serif (Playfair Display) headlines + Manrope/Inter body; white, cool grey, charcoal, champagne gold. Bilingual EN/AR with RTL toggle.
- Confirm required company and property-advertising disclosures before public launch.
