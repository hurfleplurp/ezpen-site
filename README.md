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

- A concise chalkboard-inspired page: blue-black grain, chalk-white type, handwritten notes, and marker strokes. Four `--art-*` accent tokens in `src/style.css` are sampled directly from `public/ezpen-main.png`: purple `#8a1bff`, magenta `#ec2dff`, cyan `#00e7e7`, and yellow `#f1f907`. The original softer accents remain available for other text and details. The site stays dark under both system preferences and uses local system fonts, with no external font requests.
- Optimised supplied logo derivatives live in `public/brand`; originals are untouched in `Logos`. Both derivatives preserve the full nontransparent artwork bounds with transparent padding, including the complete bottom flourish. Do not crop using assumed source-image dimensions. A regression test compares their silhouettes against the originals.
- The hero displays the supplied artwork in `public/ezpen-main.png`. There is no browser drawing demo or imitation application UI.
- To replace the hero asset, place the new file in `public` and update the image inside `.product-figure`, including its descriptive alt text and actual dimensions. The figure styles support responsive images or video without cropping.
- For a film, use a `<video controls playsinline preload="metadata" poster="/ezpen-hero.webp">` element with the actual source and accessible fallback text in the same figure. Do not autoplay.
- The infinite-canvas, "Watch it back", and "Like Glass" features use the supplied looping APNGs unchanged. First-frame stills are shown instead when the visitor prefers reduced motion.
- The native pen feature uses the supplied `public/screenshots/stylus-feature.png` artwork.
- The tool shelf and feature illustrations use the actual application icons, not redrawn approximations. The former simulated pen studies and per-pen marketing paragraphs have been removed.
- `public/icons` contains application icons, including the supplied replacements for Marker, Chalk, and Chalk Marker.
- The pen shelf keeps every pen accessible. Hovering expands the selected item with a horizontal stroke preview immediately to its right; earlier pens stay left and later pens move right. Leaving the shelf restores the evenly spaced row. Keyboard focus also previews a pen (Escape closes it), and touch users can tap to toggle. Selection is driven by pointer movement rather than layout-triggered hover events to prevent disappearance during reflow.
- Stroke previews in `public/strokes` are the real application captures (`fineliner_stroke.png`, `pencil_stroke.png`, `brush_stroke.png`, `marker_stroke.png`, `chalk_stroke.png`, `chalk_marker_stroke.png`). They were copied unchanged from the application's `Exports` folder. Keep their actual intrinsic dimensions in `index.html`; the layout preserves their aspect ratio without cropping or rotation. These filenames replace the old labelled placeholders.
- Decorative marker lines and grain are website decoration, not examples of the application's ink rendering. Your real hero capture remains the place to demonstrate that.
- Copy prioritises the product's simple, local, no-account workflow. Feature claims reflect copy supplied by the product owner, not independently measured benchmarks.
- Storage, undo history, and platform details are kept in one collapsed "A few details" disclosure rather than full-length feature sections.

## Validation

```powershell
npm run build
npx playwright install chromium
npm test
```

The Playwright suite starts and stops its own local servers. It checks responsive overflow, real icon mappings and asset dimensions, each pen's expanded layout and reset at three desktop widths, gaps and direct switching between pens, real horizontal stroke assets, keyboard/touch previews, a measurable visible-word budget (230 collapsed / 310 expanded), keyboard access to practical details, full-logo silhouettes, download states, the absence of imitation drawing UI, dark blue-grey surfaces under both system preferences, and automated accessibility rules.
