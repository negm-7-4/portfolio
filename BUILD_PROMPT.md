# MASTER PROMPT — Build a Cinematic, Award-Grade Developer Portfolio

> Paste everything below into any capable coding AI (Claude, GPT, Cursor, etc.).
> Fill the two blocks marked **`<<< FILL IN >>>`** — your details and your hero-photo
> instructions — then send. Everything else is a complete specification.

---

## 0. ROLE & MISSION

You are a **senior creative front-end engineer + motion designer + WebGL artist**. Build a
**production-ready, single-page personal portfolio** that feels like an Awwwards "Site of the Day":
cinematic, premium, alive, and fast. This is NOT a template site. Every section must feel
art-directed, and one or two "signature moments" must be genuinely screenshot-worthy.

Golden rule: **Clarity > beauty > novelty.** Never let an effect hurt readability, performance, or
accessibility. Premium = restraint, consistency, and hierarchy — not effects everywhere.

Work in passes: (1) architecture + design tokens, (2) layout in grayscale, (3) visual + motion,
(4) accessibility + performance + responsive, (5) polish. After each pass, self-review as an
Awwwards judge AND a senior engineer, and cut anything that doesn't earn its place.

---

## 1. TECH STACK (use exactly this — nothing more)

Core runtime:

- **React 19 + Vite 6** (JavaScript; TypeScript optional)
- **Tailwind CSS v4** (via `@tailwindcss/vite`) for all styling — no other CSS framework
- **motion** (Framer Motion v12, `motion/react`) — the primary animation engine
- **Lenis** — smooth scroll (expose the instance on `window.__lenis`)

Loaded lazily, only where used:

- **GSAP + ScrollTrigger** — one shared lazy import, ONLY for the scrubbed/pinned scroll timelines
  (stats counters, the signature statement beat). Nothing else needs it.
- **three + @react-three/fiber + @react-three/drei + @react-three/postprocessing** — the ambient 3D
  world (§6). Isolate the WHOLE stack into ONE lazy chunk, fetched only on mid/high tiers.
- **zustand** — a tiny store; the ONLY bridge between the DOM and the 3D canvas.

That's the entire dependency list. Deliberately EXCLUDED (do not add): Spline/@splinetool, any UI-kit
(shadcn, Aceternity, Magic UI), any chart lib (D3, Chart.js, Recharts…), extra animation libs
(Anime.js, Lottie, Rive, Theatre.js, AOS…), 2D engines (PixiJS, Matter.js, tsParticles…), and XR
(A-Frame, WebXR). Those are skills to _list_ in §7, not dependencies to install. Draw all icons as
inline SVG — no icon-font libraries. Output must be a static build (zero-config Vercel/Netlify deploy).

---

## 2. THE PERSON

- **Name:** Mohamed Negm (first: Mohamed · last: Negm)
- **Role / headline:** Software Engineer (sub: Front-End & Motion — React · Three.js)
- **Tagline:** CS & AI student crafting fast, immersive web experiences with React, Three.js and
  cutting-edge motion design.
- **Cycling role words (typewriter):** Software Engineer · Front-End Developer · React Specialist ·
  Motion Designer
- **Location:** Sadat City, Monufia, Egypt
- **Email:** mohammednegm11234@gmail.com · **Phone:** +20 10 1227 9297
- **Education:** B.Sc Computer Science & AI — 2nd Year, Al-Ryada University (RST)
- **Status:** Open to opportunities
- **Socials:** GitHub https://github.com/negm-7-4 ·
  LinkedIn https://www.linkedin.com/in/mohammed-negm-a45624335/ ·
  Facebook https://www.facebook.com/share/1HwyZgZLtQ/ ·
  Instagram https://www.instagram.com/mohamednegm_74
- **Résumé/CV:** link + download a PDF (`/Mohamed_Negm_CV.pdf`).
- **Hero photo:** a professional headshot at `/portrait-negm.jpg` — treat it per §5.
- **Brand accent:** restrained cool silver-steel `#8a93a6 → #aab4c4 → #c8d2dd` on near-black
  (`#0b0d11` / `#06080c`). Each section may carry a subtle hue within this family.

**Bio (About):** I'm Mohamed Negm — a software engineer and 2nd-year CS & AI student who builds the
kind of websites I want to use: fast, immersive interfaces with React, Three.js and Framer Motion.
From accounting ERPs to 3D web experiences — every pixel, every easing curve, every detail matters.
Always learning, always building.

**Skills (grouped — render as the constellation wall):**

- **Frontend:** React, JavaScript, TypeScript, Next.js, Tailwind CSS, HTML & CSS, Vite
- **Animation & Motion:** Framer Motion, GSAP, Motion One, Lottie, Rive, React Spring
- **3D & WebGL:** Three.js, React Three Fiber, Drei, Spline
- **Scroll & Transitions:** Lenis, GSAP ScrollTrigger, Locomotive Scroll
- **Backend:** Node.js, Python, REST APIs
- **Tools:** Git, GitHub, Figma
  (Featured/larger tiles: React, Next.js, Tailwind CSS, Three.js, Framer Motion, GSAP.)

**Projects (8 — each with real screenshots; support multiple images where noted):**

1. **SAMS** — _Multi-Agent AI Platform_ — "An AI Company That Runs Itself." A virtual AI office
   where autonomous agents each own a role, collaborate peer-to-peer, negotiate, hold meetings and
   deliver real work end-to-end; live model brains, QA agents that read real files, a day/night
   office you can watch working. Tech: React, Node.js, Multi-Agent AI, WebSockets, OpenAI/DeepSeek.
   GitHub: github.com/negm-7-4. **Flagship.** Images: sams-1.
2. **Vera** — _3D E-Commerce_ — "A Perfume House Told in Scroll." Full store: cinematic 3D bottles,
   scroll-driven camera storytelling, motion on every surface, plus an owner dashboard for
   products/orders/analytics. Tech: React, Three.js, GSAP, Scroll Camera, Dashboard.
   Images: vera-1, vera-2, vera-3.
3. **Nexora ERP** — _AI-Powered ERP · SaaS_ — "The ERP You Can Talk To." ERP with a voice AI copilot
   driving inventory/sales/purchasing, plus invoicing, reporting, multi-user and a SaaS tier.
   Tech: React, Node.js, MongoDB, Voice AI, SaaS. Images: nexora, nexora-2, nexora-3.
4. **AutomationHub** — _Automation SaaS_ — "Connect Everything, Automate Anything." Automation
   platform with a growing connector library; visual workflows on schedules/triggers, multi-tenant
   SaaS. Tech: NestJS, React, Workflow Engine, PostgreSQL, SaaS. Images: automation-1.
5. **Acoustic Room Mapper** — _DSP / Signal Processing_ — "Real-Time Acoustic Floorplan Mapping."
   Builds 2D floorplans of halls from real-time audio, sub-meter precision via FFT cross-correlation
   at 48 kHz; heatmap/wireframe/hybrid views, bilingual RTL. Tech: Flutter, Python/Flask, C++17 DSP,
   FFT, Material 3. GitHub: github.com/negm-7-4/Acoustic-Room-Mapper. **Production-Ready.**
   Images: acoustic-1.
6. **Social Network Analyzer** — _Data Visualisation_ — "Graph-Based Network Intelligence." Maps
   social connections, finds influencers, detects communities via graph theory. Tech: Python,
   NetworkX, React, D3.js. Images: social.
7. **BASCALSCALAR** — _Utility App_ — "Advanced Mathematical Computation." Scalar/matrix engine with
   expression parsing and real-time visualisation. Tech: React, Math.js, Canvas API, Tailwind.
   Images: bascalscalar.
8. **To Do List App** — _Productivity_ — "Focus Without Friction." Task manager with categories,
   priorities, due dates, drag-and-drop, local persistence. Tech: React, Framer Motion,
   LocalStorage, Tailwind. Images: todo.

Assign each project a subtle brand tint from the palette family for its accent.

---

## 3. DESIGN SYSTEM (define as tokens first, reuse everywhere — no magic numbers)

**Palette (dark, cinematic).** Background NOT pure black — use `#0b0d11`/`#06080c`. Text NOT pure
white — use ~`#e6e9ee`. One restrained accent family (this reference: cool silver-steel
`#8a93a6`→`#aab4c4`→`#c8d2dd`). Neutrals carry ~90% of the UI; the accent does brand + primary
actions only. Each section may carry its own subtle hue within the family.

**Typography.** One characterful display face (e.g. Space Grotesk / Clash Display) + one clean
text face (Inter). Huge hero headline `clamp(2.8rem, 7vw, 7rem)`. Body 16px+, line-height 1.6–1.7,
measure 60–70ch. Tighten letter-spacing on big display (−0.02em); loosen small uppercase labels
(+0.3em). Tabular numerals for stats.

**Spacing.** 4/8-pt scale only: `4 8 12 16 24 32 48 64 96 128`. Space within a group < space
between groups. Generous, consistent padding = premium.

**Radius / elevation.** One rounding scale (e.g. 12/16/24). Soft, layered, low-opacity shadows,
light from above. 1px low-opacity borders (`rgba(255,255,255,.08)`) for crisp glass edges.
`backdrop-filter: blur()` glass — sparingly, with a fallback.

**Motion tokens (define once).**

```
--dur-instant:100ms  --dur-fast:160ms  --dur-base:240ms  --dur-slow:400ms  --dur-intro:1000ms
--ease-out: cubic-bezier(.16,1,.3,1)     /* enters — the premium expo-out */
--ease-in:  cubic-bezier(.7,0,.84,0)      /* exits — faster */
--ease-curtain: cubic-bezier(.83,0,.17,1) /* overlays / page transitions */
--ease-back: cubic-bezier(.34,1.4,.5,1)   /* playful pops */
```

One easing family + one duration scale = a coherent "voice". Enters use ease-out and are longer;
exits are faster.

---

## 4. ARCHITECTURE (this is what makes it fast AND smooth)

**Device tiers.** Detect a `tier` = `low | mid | high` (via `navigator.hardwareConcurrency`,
`deviceMemory`, `matchMedia('(pointer:coarse)')`, and a WebGL probe). Also read
`prefers-reduced-motion`. Everything heavy is gated on tier:

- **high**: full 3D world + postprocessing + all micro-interactions
- **mid** (most phones): 3D world at reduced particle counts / no depth-of-field
- **low / reduced-motion**: NO 3D — a cheap CSS/GLSL gradient background + fades instead of big
  motion. The message must fully land with zero effects.

**Code-splitting.** Above-the-fold sections in the main bundle; everything else `React.lazy` +
`Suspense` with a skeleton placeholder that reserves height (no layout shift). The entire
three/R3F stack is ONE lazy chunk, requested only on mid/high — low tier never downloads it.
Verify the 3D chunk is NOT modulepreloaded in `index.html`.

**The DOM ↔ Canvas bridge (critical pattern).** A single zustand store holds hot per-frame state:
`{ scroll 0..1, velocity, pointer{x,y}, sectionIndex, ready, quality, reducedMotion }`. The DOM
(one rAF loop) WRITES it; the 3D canvas READS it transiently inside its render loop
(`store.getState()` — never via React subscription). This means scrolling never re-renders React,
and the two worlds stay decoupled. Pause the rAF + the canvas frameloop when the tab is hidden.

**Performance monitor.** Use drei `PerformanceMonitor`/`AdaptiveDpr` to step quality down at
runtime if FPS drops — but never let a heavy element vanish when it does (keep the composition
stable). Target a **locked 60fps**.

---

## 5. THE HERO — A PHOTO-DRIVEN CINEMATIC OPENING ⭐ (your signature moment)

> In THIS build the hero centrepiece is **my personal photo**, art-directed into a cinematic
> reveal — not a stock 3D object. Treat the photo as the star of the first screen. Keep the
> ambient 3D world (§6) as a subtle backdrop BEHIND it, dimmed so it never competes.

Layout: split hero. LEFT = copy (status pill "Available for work", "Hi, I'm", **massive name**
with a masked line-reveal + per-word blur→focus, a cycling role typewriter, tagline, two CTAs
"View my work" / "Get in touch", a row of tech tags). RIGHT = **my photo**, framed and treated.

**Photo asset & framing:** cover-crop to a portrait ratio, faced/centered, optimized (≤ ~120KB,
WebP/JPEG), served from `/public`. Provide a graceful `<img>` fallback that is always in the DOM
for accessibility, with descriptive `alt`.

```
WHAT TO DO WITH MY PHOTO — exact treatment (this is the required hero look):

A cinematic **duotone portrait that MELTS into the hero background** — no frame, no card, no hard
edges. The photo lives on the RIGHT ~45–55% of the hero; the big headline sits on the LEFT.

 1) GRADE — DUOTONE. Desaturate the photo to luminance, then remap it to a two-tone gradient:
    shadows → the hero background colour (so darks vanish into the page), highlights → a warm
    accent. Implement with CSS (`filter: grayscale(1) contrast(1.05)` + a `mix-blend-mode:screen`
    accent-gradient overlay) OR a small fragment shader (cleaner). Expose the two tones as tokens
    `--duo-shadow` and `--duo-highlight` so the colour is trivially tunable.
    → Reference grade is a deep maroon/red (shadow ≈ #14060a, highlight ≈ #e23b3b). Also give me a
      one-line switch to the site's cool steel-blue grade (shadow ≈ #06080c, highlight ≈ #aab4c4).

 2) BLEND — FEATHERED, NO BORDER. Fade the photo's edges to fully transparent with a soft mask so
    it dissolves into the background: strongest feather on the INNER (left) edge toward the text
    and along the bottom, lighter at top/right. Use
    `-webkit-mask-image / mask-image` with a radial + left-to-right linear gradient
    (e.g. `linear-gradient(90deg, transparent 0%, black 38%)` combined with a soft radial vignette).
    The result must read as one graded atmosphere, not a pasted rectangle.

 3) TEXTURE. Lay a low-opacity film **grain** + a gentle **vignette** over the whole hero (photo
    included) to fuse it into one cinematic frame. Optional very-faint scanline.

 4) MOTION — slow + premium (this is what sells it):
    • A continuous **Ken-Burns**: scale 1.0 → ~1.06 and drift a few px over ~12–16s, ease-in-out,
      looping imperceptibly.
    • **Pointer parallax**: the photo shifts ~6–10px OPPOSITE the cursor (and tilts ≤3°) for depth;
      spring-smoothed, settles to rest. Desktop / fine-pointer only.
    • **Reveal on load**: fade + scale-down from ~1.08 with a brief blur→focus and a clip-path/mask
      wipe, timed with the preloader lift and the headline's line-reveal. Big `ease-out`.

 5) SCROLL: as I scroll into the next section the photo drifts up a little, scales ~0.96, and fades
    to 0 (parallax), so the hero hands off cleanly.

 6) HEADLINE (left): massive uppercase bold display type, 2–3 lines, with the LAST word in the
    accent colour and a period — e.g. “DESIGNING / INTERFACES / THAT FEEL / **RIGHT.**” Use my own
    headline copy. Small kicker label above it, tagline + CTAs below.

 7) FALLBACKS: keep a plain, correctly-`alt`'d `<img>` in the DOM underneath; on reduced-motion,
    drop the Ken-Burns/parallax and show the graded still. On low-tier, CSS-only grade (skip any
    shader). Optimise the asset (≤ ~120KB, WebP/JPEG, cover-cropped to portrait, face upper-mid).

Net effect: a moody, color-graded portrait bleeding into a grainy cinematic background, breathing
with a slow zoom and reacting subtly to the cursor — headline commanding the left. (Reference:
a hero in the style of the “DESIGNING INTERFACES THAT FEEL RIGHT.” layout.)
<<< END >>>
```

The first 2 seconds must feel expensive: big `ease-out`, generous scale/opacity reveal, a slow
idle motion. Provide a **skip-friendly, honest preloader** first: a real progress count (not fake),
cinematic type, a mask-wipe exit synced to the hero reveal — under ~2.5s, never blocking.

---

## 6. THE AMBIENT 3D WORLD (background, mid/high only)

A fixed, full-viewport `@react-three/fiber` `<Canvas>` BEHIND all content (pointer-events: none;
the DOM keeps every click). It is driven entirely by the store. Include:

- A **scroll-driven cinematic camera**: 8–10 composed keyframe shots (position + lookAt + fov),
  eased between with a smootherstep "hold–move–hold" cadence so it reads as deliberate cuts;
  optionally strung on a Catmull-Rom spline for a curved dolly, with a tiny per-shot dutch-angle.
  Add gentle pointer parallax + a handheld micro-drift at rest. **Anchor orientation to SCROLL,
  never accumulate from time** — so returning to the top always composes the identical shot.
- A **signature GPU particle field** (one draw call, `THREE.Points` + a hand-written
  `ShaderMaterial`) that continuously **re-forms into distinct shapes as you scroll**, one per
  section, each particle keeping identity across formations (position=FROM buffer, `aTo`=TO buffer,
  `uBlend` mixes; swap buffers only when crossing a section boundary). Make the shapes _mean_
  something and read at a glance — e.g. a Saturn-style ring system, a fingerprint whorl, an atom,
  a spiral galaxy, a wide constellation, a pulsing beacon, and a final signature glyph. Give
  particles a swarm feel (per-particle staggered departure + seeded arc paths) and a near/far
  depth colour grade. Cursor gently repels particles and heats the wake (gate on fine-pointer,
  release smoothly — do NOT gate it on the perf tier).
- Atmosphere: subtle bloom, optional depth-of-field (high only), fog, a few Sparkles/Stars,
  ACES tone mapping, restrained grade. Bloom must be premium, not a flashlight.

Everything above degrades cleanly: mid = fewer particles/no DOF; low = skip the world entirely.

---

## 7. SECTIONS (all one page, smooth-scrolled)

1. **Hero** (§5)
2. **Stats** — animated counters (GSAP tween on reveal), tabular numerals.
3. **About** — big bio essay with masked line reveals + a portrait/side panel + trait cards.
4. **Services / What I do** — a pinned horizontal-scroll gallery of capability cards.
5. **Skills** — a "constellation wall" of tech tiles (glass, magnetic cursor pull on desktop
   only, quick capped stagger). Featured skills larger. Icons crisp.
6. **Experience / Journey** — a glowing vertical timeline that draws itself on scroll.
7. **A signature scrubbed beat** — one pinned GSAP ScrollTrigger moment (e.g. a statement that
   lights word-by-word, or a product explode) — the anchor of the experience.
8. **Projects** — the second signature. Offer a live **mode switcher** (segmented pill,
   localStorage-persisted) between 2–3 presentations of the SAME data, e.g.:
   • a realistic **WebGL globe** that flies the camera between a destination per project,
   • a **keynote timeline** with staged slide reveals,
   • **glass flip-cards** (tilt to cursor, lift→flip→settle, keyboard-operable).
   Each project card/slide shows a real screenshot (support MULTIPLE images per project via a
   crossfade + Ken-Burns carousel with dots), title, category, tagline, description, tech badges,
   and CTA links. Provide a designed monogram fallback when a screenshot is missing.
9. **Testimonials / Reviews**, **Socials**, **Contact** (floating-label form with inline
   validation + honest states: idle/sending/sent/error; falls back to a mailto if no backend),
   **Footer** with a drawn signature and the site's glyph.

---

## 8. INTERACTION & MOTION SYSTEM

- Custom cursor (desktop only) + magnetic buttons + magnetic/scramble text — all disabled on
  touch/coarse pointers.
- Every interactive element: default/hover/**focus-visible**/active/disabled/loading states.
  Acknowledge every action within ~100ms. Micro-interactions ≤ 250ms.
- Reveal grammar (consistent everywhere): masked line reveals (overflow-hidden + translateY),
  clip-path image unveils, scale+blur+fade together for depth. No plain fades everywhere.
- Page/section transitions with a curtain/letterbox feel; respect the easing tokens.
- Optional opt-in ambient sound (muted by default, visible toggle, respects autoplay policy).
- A grain + vignette overlay (low opacity) to unify the grade.

---

## 9. ACCESSIBILITY (WCAG 2.2 AA — non-negotiable, build it in)

- **Contrast is measured, not eyeballed.** Body text ≥ **4.5:1**, large text ≥ 3:1 against the
  ACTUAL background. On a `#0b0d11` background, white at 45% opacity is the floor (4.5:1); anything
  dimmer (25–40%) FAILS — do not ship sub-45% body text. Verify every text token.
- Full keyboard operability, logical focus order, a visible focus ring (never `outline:none`
  without a replacement), skip-link, focus trap + restore for modals.
- Semantic HTML; label every control; `alt` on meaningful images; icon-only buttons get
  `aria-label`. Sequential headings (no h1→h3 skips).
- Respect `prefers-reduced-motion` everywhere (a calm, static variant). Touch targets ≥ 44×44px.
- Never convey meaning by color alone.

---

## 10. PERFORMANCE & MOBILE (most visitors are on phones — design mobile-first)

- Lock 60fps; animate transform/opacity only; no layout thrash. Lazy-load below the fold.
- Budget the weight: compress images (WebP/AVIF), reserve space (zero CLS), inline critical CSS.
  Ship NO unused assets (audit `/public`).
- Mobile: single-column reflow (don't shrink). If copy sits over the 3D world, add a phone-only
  dark veil so text stays crisp. Simplify/kill heavy effects on mid/low. Full globe/objects must
  fit in frame (pull the camera back on narrow viewports). Keep floating buttons from overlapping.
- Optional: a small service worker for instant repeat visits (network-first HTML, hashed assets).

---

## 11. ANTI-PATTERNS (do NOT do)

Effects everywhere with no focal point · fake/blocking preloaders · sub-AA low-opacity text ·
time-accumulated rotations that drift (anchor to scroll) · literal clichés where an abstract mark
reads better · one heavy element that pops in/out as perf changes · desktop-only thinking ·
shipping unused 3D models/images · animating height/top instead of transform.

---

## 12. DELIVERABLES & QUALITY BAR

- A clean, componentized codebase (sections, ui primitives, hooks, a `lib/motion` tokens file,
  the zustand store, the three world isolated + lazy). Meaningful comments on the non-obvious 3D
  and store code.
- `npm run build` green; the 3D stack confirmed lazy; no console errors; no horizontal overflow
  on mobile (`documentElement.scrollWidth === clientWidth`).
- Then self-audit against §9 and §11 and this checklist, fixing each "no":
  Is the primary action obvious in 1s? · One focal point per screen? · Consistent spacing/easing? ·
  Real content + empty/error states? · Keyboard + focus + contrast pass? · 60fps on mid mobile? ·
  Does the message land with all effects off?

Build it. Make the first screen unforgettable, and make everything after it feel intentional.

```

```
