# BG Venture Properties

The marketing website for **BG Venture Properties** — a Dubai real estate brokerage
focused on three licensed activities: **leasing property brokerage**,
**buying & selling brokerage**, and **real estate management supervision**.

Built for an international investor audience, with a luxury editorial design
and full English / Arabic / Chinese support.

**Live site:** https://bg-venture-properties.pages.dev

---

## How the website works

### Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Frontend  | React 18 + TypeScript, bundled by Vite      |
| Styling   | Single global stylesheet (`src/styles.css`) |
| Backend   | Express server (`server/server.mjs`)        |
| Hosting   | Cloudflare Pages (static `dist/` output)    |
| Fonts     | Playfair Display + Manrope (Google Fonts)   |

### Page structure (single-page app)

All sections live in `src/App.tsx` and scroll through one landing page:

1. **Top contact bar** — static, bold contact strip (address, email, landline)
2. **Hero** — cinematic Dubai imagery with parallax and crossfade
3. **Quick links** — "How can we help?" three-path strip
4. **Developer marquee** — infinite scrolling UAE developer logos (`public/devlogos/`)
5. **About + stats** — 200+ landlords, 5,000 properties (labelled "supported")
6. **Scope panel** — dark investment-grade statement of the three licensed services
7. **What we do** — the three core service cards, each opening a detail page
   via hash routing (`#/service-leasing`, `#/service-selling`, `#/service-management`)
8. **The right space** — 14-photo horizontal carousel (`public/p1-p10.jpg` + extras)
9. **International investors** — overseas-client section
10. **Landlords** — dark section with three service rows
11. **Process** — 4-step "clear path forward"
12. **FAQ** — animated accordion
13. **Contact** — enquiry form + Google Maps embed (Offices 3101 &amp; 3104, Regal Tower)
14. **Footer** — logo, nav columns, map

### Hash routing

Service detail pages are client-side routes (`#/service-<id>`).
`App.tsx` watches `location.hash` and swaps the landing view for the
`ServicePage` view. No server routing is involved, so it works on static hosting.

### Multilingual (EN / AR / 中文)

- Dictionaries live in `src/i18n.ts` (`ar` and `zh` key maps).
- `App.tsx` renders `tr ? L(key) : 'English default'` per string.
- The toggle in the nav cycles **EN → عربي → 中文**.
- Arabic sets `dir="rtl"` on `<html>`; Chinese stays LTR.
- Service detail pages and form labels are currently English-only.

### Enquiry form

- On **Cloudflare Pages** (static), the form prepares a `mailto:` draft —
  it opens the visitor's email app with the message pre-filled.
  Nothing is submitted or stored.
- `POST /api/enquiry` exists on the Express server for future use: it validates
  fields and acknowledges but does not send email yet.

### Animations

CSS-driven: hero crossfade/parallax, scroll-reveal via `IntersectionObserver`,
3D tilt on service cards, marquee tracks, FAQ accordion, button shine.
All of it respects `prefers-reduced-motion`.

---

## Local development

> **Windows network-share note:** npm/Vite cannot run on the UNC path.
> Map the project to a drive (`net use B: "\\terra-master\...\bg-venture-properties"`)
> or copy it to a local folder (`C:\Users\<you>\dev\bg-build`), work there, then
> copy `dist/` and `node_modules/` back to the share. Requires Node.js 20+.

```bash
npm install          # first time only

# Build (typecheck + bundle)
node node_modules\typescript\bin\tsc -b
node node_modules\vite\bin\vite.js build

# Run the Express server — serves dist/ on http://127.0.0.1:3000
node server\server.mjs

# Vite dev server with HMR (optional) — http://127.0.0.1:5173
node node_modules\vite\bin\vite.js
```

## Testing

```bash
node --test website.test.mjs
```

Covers: `/api/health`, `/api/enquiry` validation, security headers,
required source content, and `dist/` serving.

## Deployment (Cloudflare Pages)

```bash
npx wrangler pages deploy dist --project-name=bg-venture-properties --branch=main
```

Typical release flow: edit `src/` → `tsc -b` + `vite build` → `node --test` →
commit + push → `wrangler pages deploy dist`.

## Repository layout

```
src/
  App.tsx            all sections, routing, i18n toggle, observers
  i18n.ts            Arabic + Chinese dictionaries, t() helper
  styles.css         complete visual system
  components/Icon.tsx  SVG icon set
server/
  server.mjs         Express app: static serving, /api/health, /api/enquiry, CSP headers
public/              images, devlogos/, logo-transparent.png, favicon
dist/                production build output (deployed to Pages)
website.test.mjs     node:test suite
```

## Content guidelines

- Do not add unverified statistics, guaranteed returns, credentials, or testimonials.
- "200+ landlords supported" / "5,000 properties supported" — never "currently managed".
- Developer logos are illustrative; do not claim partnerships.
- Photography is illustrative (Unsplash, served locally) — not real listings.
- Company registration details are intentionally omitted.
