# Mohamed Negm — Portfolio

A single-page portfolio built as a scroll-driven journey through one persistent
WebGL world. React 19 + Vite, React-Three-Fiber, GSAP and Motion, deployed on
Vercel with a serverless contact endpoint.

**Live:** https://mohamed-negm.vercel.app

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

To exercise the contact form locally you need the serverless function, which
Vite alone does not run:

```bash
vercel dev
```

## Scripts

| Command                 | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Vite dev server                                         |
| `npm run build`         | Production build into `dist/`                           |
| `npm run preview`       | Serve the production build locally                      |
| `npm run lint`          | ESLint (flat config, with `jsx-a11y` and hooks rules)   |
| `npm run typecheck`     | `tsc --noEmit` over the typed surface                   |
| `npm run format`        | Prettier, write                                         |
| `npm run test`          | Vitest, single run                                      |
| `npm run test:coverage` | Vitest with V8 coverage                                 |
| `npm run test:a11y`     | axe-core audit against the built site (needs `preview`) |
| `npm run budget`        | Fail if the critical-path bundle exceeded its budget    |
| `npm run images`        | Regenerate responsive AVIF/WebP derivatives             |
| `npm run check`         | Everything CI runs, in order                            |

---

## Architecture

### The rendering budget is the design constraint

The heaviest thing here is the R3F world: three.js + drei + postprocessing is
~330 kB gzipped on its own. Three mechanisms keep it off the critical path:

1. **Device tiering** — `useDeviceProfile` reads reduced-motion, `saveData`,
   `deviceMemory`, `hardwareConcurrency` and pointer type, and resolves a
   `low`/`mid`/`high` tier. Low-tier hardware never downloads the 3D chunk at
   all; it gets a cheap GLSL aurora instead.
2. **Deferred activation** — even on capable devices the world is not requested
   until the visitor starts leaving the opaque cover screen (or 30s idle).
   Downloading it behind a fully opaque portrait would be pure waste.
3. **Chunk pinning** — `vite.config.js` hand-assigns `manualChunks` so the 3D
   stack, GSAP core, the GSAP club plugins and Motion each land in their own
   lazy chunk, and `modulePreload` is told not to preload any of them.

`scripts/check-bundle-budget.mjs` enforces the result in CI, so a stray eager
import of three.js fails the build rather than quietly costing every visitor
300 kB.

### TypeScript

Adopted from the logic layer outward rather than in one risky rename. `src/lib`,
`src/config` and `src/data` are `.ts` today and type-checked under `strict` plus
`noUncheckedIndexedAccess`; the `.jsx` components still compile through
`allowJs` with `checkJs: false`, and join the checked surface as they are
touched. `npm run typecheck` runs in CI, so the typed part cannot rot while the
migration finishes.

TypeScript is pinned to 6.x deliberately: `typescript-eslint` does not support
the 7.0 compiler API yet, and lint coverage on the typed files is worth more
here than being on the newest compiler.

### Structure

```
src/
  components/
    sections/     one file per page section (Hero, About, Projects, …)
    three/        the R3F world: MorphField, CinematicWorld, HeroModel…
    showcase/     interchangeable project-gallery modes (classic/globe/cards/timeline)
    ui/           reusable presentation + interaction pieces
  hooks/          device profile, active section, Lenis, cursor, scroll lock
  lib/            navigation, app events, toast, GSAP loaders, audio, motion tokens
  data/           all copy and project data — edit here, not in components
  config/         site-wide constants (public URL, contact email)
                  (lib / data / config are TypeScript)
api/
  contact.js      Vercel Function: validation, rate limit, Resend delivery
scripts/          image pipeline + bundle budget
```

### Navigation

Everything that scrolls goes through `src/lib/navigation.js`. The Lenis
instance and the cinematic page transition register themselves there on mount;
callers just ask for `goToSection(id)` and get the best behaviour available —
curtain transition, else Lenis, else native scroll. Nothing reads globals.

Cross-tree commands (open the CV modal, open the command palette) go through
named events in `src/lib/appEvents.js` rather than prop drilling.

### Resilience

Most of this page is WebGL, and GPU reality is not uniform — a shader that will
not compile on one Android driver used to take down the entire React tree.
`ErrorBoundary` now wraps the 3D world (falling back to the 2D background), each
lazy section, the ambient chrome, the cursor layer, and the app root.

### Accessibility

- One `<h1>`; landmarks and a skip link.
- Split-text effects expose the real sentence once (visually hidden) and hide
  the per-letter spans, instead of spelling words out to screen readers.
- The custom cursor hides the native one via a class it owns, so a JS failure
  can never leave a visitor with no pointer.
- `prefers-reduced-motion` collapses the choreography site-wide via
  `MotionConfig`, and the low tier forces it.

Enforced, not assumed: `npm run test:a11y` runs axe-core against the production
build in a real browser, at desktop and mobile widths, scrolled through the
whole page so the lazy sections have actually mounted — auditing first paint
alone would miss most of this site. It runs as its own CI job.

Three violations it caught, worth naming because they are the kinds that
survive code review: the chapter rail was an `aria-hidden` `<aside>` full of
focusable buttons (keyboard-reachable, invisible to screen readers); the
preloader put `role="progressbar"` on the full-screen wrapper that also held
the Skip button; and a corner label sat at 1.26:1 contrast, which is not
subtle, it is invisible.

---

## Contact endpoint

`api/contact.js` delivers through [Resend]. Configure these **server-side** in
Vercel — never with a `VITE_` prefix, which would ship them to the browser:

| Variable            | Required | Default                    |
| ------------------- | -------- | -------------------------- |
| `RESEND_API_KEY`    | yes      | —                          |
| `CONTACT_TO_EMAIL`  | no       | the portfolio address      |
| `RESEND_FROM_EMAIL` | no       | Resend's onboarding sender |

Without `RESEND_API_KEY` the endpoint returns a typed `503`
(`CONTACT_NOT_CONFIGURED`) and the UI honestly falls back to opening the
visitor's mail app — it never claims a message was sent when it was not.

Guards: POST-only, 20 kB payload cap, honeypot field answered with a fake
success, per-IP rate limit, HTML escaping of all visitor input, and an
idempotency key so a double submit cannot double-send.

### Rate limiting

The limiter prefers a durable store and degrades honestly without one:

| Configured                                            | Behaviour                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Global counter across all serverless instances                               |
| Neither                                               | Per-instance in-memory counter — stops casual abuse, not a distributed flood |

Upstash is reached over its REST API rather than a Redis client: a serverless
function's connection lifetime makes TCP pooling a liability. The window is a
fixed counter (`INCR` + `EXPIRE … NX`) rather than a sliding log, so it is one
round trip and cannot grow unbounded. **If Redis is unreachable the request
still goes through** on the in-memory fallback — a limiter must never be the
reason a genuine message fails to send.

## Configuration

Public, non-secret values live in `.env` (see `.env.example`):

```
VITE_SITE_URL=https://mohamed-negm.vercel.app
VITE_CONTACT_EMAIL=mohammednegm11234@gmail.com
```

`VITE_SITE_URL` is the single place the domain is written. It feeds the
canonical tag, the Open Graph and JSON-LD URLs in `index.html`, and the
generated `sitemap.xml` and `robots.txt`. Moving to a custom domain is a
one-line change. `vite.config.js` carries the same values as defaults so a
clean checkout with no `.env` still builds correct URLs.

## Structured data

`index.html` carries Person and WebSite JSON-LD, plus a `CreativeWork` entry
per project generated at build time from the same `projects` array the UI
renders (see `projectSchema` in `vite.config.js`). Add a project to
`data/content.js` and it appears in the structured data — the two cannot drift.

## Deployment notes

`vercel.json` deliberately has **no catch-all rewrite**. There is no
client-side router here, so rewriting `/(.*)` to `/` only meant every mistyped
URL returned HTTP 200 with the app shell — a soft 404 that search engines
index. Without it, unknown paths get the static `public/404.html` at a real 404
status, and it needs no JavaScript to render.

Security headers (CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`) are set there too. The CSP allows
inline scripts only because the JSON-LD blocks in `index.html` are inline;
`connect-src` is locked to this origin plus the Vercel vitals endpoint, which
is what actually constrains exfiltration.

## Licence

Source is published for reference under [CC BY-NC-ND 4.0](LICENSE) — read it,
learn from it, but the design, copy, photography and CV are personal and not
for redistribution or reuse as your own portfolio.

[Resend]: https://resend.com
