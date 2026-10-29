# ezPen landing page

A small, static promotional site for ezPen. Built with Vite, TypeScript, and plain CSS. No framework runtime, analytics, cookies, external fonts, or backend.

## Local development

Requires Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev
```

`npm run build` type-checks and writes the production site to `dist`. `npm run preview` serves that build locally.

## Vercel

Import this directory as a Vercel project. The included configuration selects Vite, runs `npm run build`, and serves `dist`. No server or SPA rewrite is required.

The application repository did not have a public packaged release when this site was created. The download section deliberately shows a release-in-preparation state rather than linking visitors to an inaccessible repository or a nonexistent executable.

When a public Windows build is available, add these Vercel environment variables and redeploy:

| Variable | Purpose |
| --- | --- |
| `VITE_EZPEN_DOWNLOAD_URL` | Public HTTPS URL for the Windows executable. Enables the real download button. |
| `VITE_EZPEN_RELEASES_URL` | Optional public release-notes page. |
| `VITE_SITE_URL` | Optional canonical production origin. |

For local configuration, copy `.env.example` to `.env.local`. Vite embeds these public values at build time; never put secrets in `VITE_` variables. Invalid URLs cause an explicit error, not a misleading download fallback.

## Visuals and product copy

- A concise chalkboard-inspired page: blue-black grain, chalk-white type, handwritten notes, and cyan/pink marker strokes. It stays dark under both system preferences. Colour and handwriting tokens are at the top of `src/style.css`; handwriting uses local system fonts, with no external font requests.
- Optimised supplied logo derivatives live in `public/brand`; originals are untouched in `Logos`. Both derivatives preserve the full nontransparent artwork bounds with transparent padding, including the complete bottom flourish. Do not crop using assumed source-image dimensions. A regression test compares their silhouettes against the originals.
- The hero reserves space for an actual application capture. There is no browser drawing demo or imitation application UI.
- To add your hero asset, place it in `public` (for example `public/ezpen-hero.webp`) and replace the entire `.product-media-placeholder` div inside `.product-figure` with `<img src="/ezpen-hero.webp" alt="Describe the actual ezPen drawing and controls shown" width="1920" height="1080" fetchpriority="high" />`. Use the asset's actual dimensions. The figure styles support responsive images or video without cropping.
- For a film, use a `<video controls playsinline preload="metadata" poster="/ezpen-hero.webp">` element with the actual source and accessible fallback text in the same figure. Do not autoplay.
- The tool shelf and feature illustrations use the actual application icons, not redrawn approximations. The former simulated pen studies and per-pen marketing paragraphs have been removed.
- `public/icons` contains padded, native-size crops from the application's `Assets/ui_icons.png`, retrieved from `hurfleplurp/ezPen`. Crop coordinates come from `Source/Render/UIIconAtlas.h`. The shelf follows `WhiteboardApp.cpp`'s actual pen picker mapping: Marker, Chisel, and Chalk Marker share the same icon, while Chalk uses atlas entry 3. This reuse is intentional.
- Decorative marker lines and grain are website decoration, not examples of the application's ink rendering. Your real hero capture remains the place to demonstrate that.
- Copy prioritises the product's simple, local, no-account workflow. It avoids unverified latency, memory, frame-rate, download-size, and competitive benchmark claims.
- Storage, undo history, and platform details are kept in one collapsed "A few details" disclosure rather than full-length feature sections.

## Validation

```powershell
npm run build
npx playwright install chromium
npm test
```

The Playwright suite starts and stops its own local servers. It checks responsive overflow, real icon mappings and asset dimensions, a measurable visible-word budget (230 collapsed / 310 expanded), keyboard access to practical details, full-logo silhouettes, download states, the absence of imitation drawing UI, dark blue-grey surfaces under both system preferences, and automated accessibility rules.
