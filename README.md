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

Import this directory as a Vercel project. The included configuration selects Vite, runs `npm run build`, and serves `dist`. No server or SPA rewrite is required. The Vite multi-page build includes both the ezPen home page and `ggezpen.html`; product navigation uses ordinary links, so both pages work directly and without JavaScript.

## Windows Server / Caddy

Build locally with `npm ci` and `npm run build`, then upload the contents of `dist` to a new directory under `C:\Sites\ezpen\releases`. Node.js is not required on the server.

Caddy serves the static files without URL rewriting. Preserve the security headers in `vercel.json`, and explicitly serve `.apng` files as `image/apng`. Store Caddy's executable and configuration under `C:\Sites\ezpen\server`. The `ezpen-web` Windows scheduled task starts Caddy at boot and restarts it after failure; its certificate storage must persist between deployments.

Stage each update in a new release directory and update the Caddyfile's root only after validating the upload. Validate with `caddy validate`, then apply with `caddy reload`; keep the previous release for rollback. Verify both pages, animation and font requests, and download links before changing DNS. Point the domain's A record to the server and remove conflicting A/AAAA records; enable the domain's HTTPS site in Caddy and verify certificate issuance before considering the migration complete. Leave Vercel available until cutover is verified.

## Leaderboard backend

The authoritative backend lives in the game repository's `Leaderboard` directory, not this static website. The VPS runs its Node 24 LTS service and native `ggezPenVerify.exe` under LocalService through the `ggezpen-leaderboard` startup task. It listens only on `127.0.0.1:8787`. Caddy proxies `/v1/*`, `/health`, `/leaderboard` and root requests with a `chart` query; normal home-page requests remain static. The game client origin is `https://ezpen.ink` (`GGEZPEN_LEADERBOARD_URL`). Existing public builds may need a newer client release or that environment setting.

Code/runtime are under `C:\Sites\ggezpen-leaderboard\releases` and `runtime`; SQLite and approved charts are in the private `data` directory, never the web root. Operators alone may replace code and approved charts. Caddy caps API request bodies at 16 MiB and bounds header/body reads. The backend permits two concurrent verification uploads and throttles each player; its registration cooldown sees the loopback proxy as one source, so currently applies conservatively across all users. Do not trust arbitrary forwarded-IP headers.

The `ggezpen-leaderboard-backup` daily task uses SQLite `VACUUM INTO` for consistent snapshots, retaining the latest 14 in `backups`. These are same-server recovery copies: configure off-site backups separately. Backend errors are in `logs\server.log`. Keep native scoring version 1 aligned with the game; only the six pinned official charts are approved. Server-scored replays are not proof of human play. Public retention/recovery information is in `public/leaderboard-privacy.html`.

### Client ticker notices

The anonymous `GET https://ezpen.ink/v1/announcements` returns the current notice as uncached UTF-8 plain text. Clients poll on launch and every 60 seconds, even with Online disabled. Empty responses hide the ticker. Notices persist in SQLite; no service restart is required. Public writes are not supported.

The operator helper `scripts\Set-Ticker.ps1` is installed on the VPS at `C:\Sites\ggezpen-leaderboard\Set-Ticker.ps1`. Run it in an administrator PowerShell session (including over SSH):

```powershell
& C:\Sites\ggezpen-leaderboard\Set-Ticker.ps1 -Message 'Leaderboards are live! Ranked play is coming later.'
& C:\Sites\ggezpen-leaderboard\Set-Ticker.ps1 -Clear
```

It accepts at most 512 printable ASCII characters, preserves spaces/quotes, validates the existing database path, and verifies delivery from the running backend. Backend failures are reported explicitly. Override `-ServerScript` when moving the backend to a new release. Never send private credentials or identities in a public ticker notice.

## Download configuration

The download section links to the latest public Windows executable and its SHA-256 checksum in `hurfleplurp/ezPen-releases`. These default links work without JavaScript and follow the latest GitHub release. Optional Vercel environment variables can override them when JavaScript is enabled:

The approximate size beside the download button is maintained in `index.html` for the current release (4,243,456 bytes, or about 4.2 MB). Update it when publishing a release with a different executable size. It is hidden when a custom executable URL is configured.

| Variable | Purpose |
| --- | --- |
| `VITE_EZPEN_DOWNLOAD_URL` | Optional public HTTPS URL overriding the Windows executable. |
| `VITE_EZPEN_CHECKSUM_URL` | Optional public HTTPS URL for the matching SHA-256 checksum. If the executable is overridden without this, the default checksum link is hidden to avoid mismatching files. |
| `VITE_EZPEN_RELEASES_URL` | Optional public release-notes page. |
| `VITE_SITE_URL` | Optional canonical production origin. |

For local configuration, copy `.env.example` to `.env.local`. Vite embeds these public values at build time; never put secrets in `VITE_` variables. Invalid URLs cause an explicit error, not a misleading download fallback.

## Visuals and product copy

- ggezPen has its own companion page at `/ggezpen.html`, with a grey header and title area above a darker, colourful page. Its locally hosted Proggy Square font matches the game; use font sizes that are whole multiples of 16px, its native glyph-grid size. Proggy Vector supplies symbols missing from Square. Both fonts and their licenses come from the official `bluescan/proggyfonts` project. Its ribbon artwork is decorative, not a gameplay capture. Download links follow the latest public release in `hurfleplurp/ggezPen-releases`, including the optional chart generator and checksums. The approximate game download size is maintained in `ggezpen.html` (7,456,768 bytes, about 7.5 MB). Leaderboards are live on the VPS, with ranked play to follow. Both applications are labelled free beside their download actions. Supporting browsers animate navigation between the two pages with a vertical-axis flip; other browsers and visitors who prefer reduced motion get normal navigation.
- A concise chalkboard-inspired page: blue-black grain, chalk-white type, handwritten notes, and marker strokes. Four `--art-*` accent tokens in `src/style.css` are sampled directly from `public/ezpen-main.png`: purple `#8a1bff`, magenta `#ec2dff`, cyan `#00e7e7`, and yellow `#f1f907`. The original softer accents remain available for other text and details. The site stays dark under both system preferences and uses local system fonts, with no external font requests.
- Optimised supplied logo derivatives live in `public/brand`; originals are untouched in `Logos`. Both derivatives preserve the full nontransparent artwork bounds with transparent padding, including the complete bottom flourish. Do not crop using assumed source-image dimensions. A regression test compares their silhouettes against the originals.
- The hero displays the supplied artwork in `public/ezpen-main.png`. There is no browser drawing demo or imitation application UI.
- To replace the hero asset, place the new file in `public` and update the image inside `.product-figure`, including its descriptive alt text and actual dimensions. The figure styles support responsive images or video without cropping.
- For a film, use a `<video controls playsinline preload="metadata" poster="/ezpen-hero.webp">` element with the actual source and accessible fallback text in the same figure. Do not autoplay.
- The infinite-canvas, "Watch it back", and "Like Glass" features use the supplied looping APNGs unchanged. First-frame stills are shown instead when the visitor prefers reduced motion.
- The supplied ggezPen gameplay loop appears below the decorative ribbon in the hero's right column, stacking below the introduction on mobile. The APNG is unchanged; reduced-motion visitors see its first-frame poster.
- The native pen feature uses the supplied `public/screenshots/stylus-feature.png` artwork.
- Feature highlights appear in order: infinite canvas, Like Glass, Watch it back, and native pen support. Their images alternate sides on desktop.
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
