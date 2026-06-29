---
name: marketing-site-motion
description: Playbook for building modern, award-style product-marketing landing pages — the kind seen on Awwwards / FWA, used to launch and sell products. Ties together the animation, 3D, scroll, 2D and chart skills into proven recipes: smooth-scroll + scroll-triggered hero reveals, scroll-scrubbed video/image sequences, sticky pinned product showcases, 3D/Spline/Rive hero scenes, parallax & magnetic micro-interactions, animated stats/counters, marquees, page transitions, and a performance/accessibility checklist. Use when asked to build a landing page, product launch site, hero section, marketing site, or "make it look like an Awwwards site". References the web-animation, web-3d, canvas-2d, scroll-effects and data-viz-charts skills.
---

# Product-Marketing & Award-Style Site Playbook

Recipes for high-end landing pages. For full library APIs, open the focused
skills: **web-animation**, **web-3d**, **canvas-2d**, **scroll-effects**,
**data-viz-charts**.

## Recommended stack (2025-era)
- **Framework:** React + Vite, or Next.js (App Router) for marketing SEO.
- **Smooth scroll:** Lenis (synced with GSAP ScrollTrigger).
- **Scroll animation:** GSAP ScrollTrigger (+ ScrollSmoother/Observer, all free in 3.13).
- **Component motion:** Framer Motion / Motion (entrance, layout, gestures).
- **3D hero:** React Three Fiber + Drei, or Spline for designer scenes.
- **Vector motion:** Rive (interactive) or Lottie (designer JSON).
- **Type effects:** GSAP SplitText / SplitType.
- **Numbers:** NumberFlow for animated stats.
- **Backgrounds:** tsParticles, WebGL shaders (OGL), or a subtle Three.js field.
- **Styling:** Tailwind CSS v4.

## Recipe 1 — Cinematic hero with text reveal
```js
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);
const split = new SplitText(".hero h1", { type: "chars,lines" });
gsap.timeline({ defaults: { ease: "power4.out" } })
  .from(split.chars, { yPercent: 120, opacity: 0, stagger: 0.02, duration: 0.9 })
  .from(".hero .cta", { y: 30, opacity: 0 }, "-=0.4");
```

## Recipe 2 — Scroll-scrubbed product video / image sequence
Apple-style "scroll plays the video". Image sequences scrub smoother than video.
```js
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const frameCount = 120, ctx = canvas.getContext("2d");
const imgs = Array.from({ length: frameCount }, (_, i) => {
  const im = new Image(); im.src = `/seq/${String(i + 1).padStart(4, "0")}.webp`; return im;
});
const state = { f: 0 };
gsap.to(state, {
  f: frameCount - 1, snap: "f", ease: "none",
  scrollTrigger: { trigger: ".seq", start: "top top", end: "+=3000", scrub: true, pin: true },
  onUpdate: () => ctx.drawImage(imgs[state.f], 0, 0),
});
```
For real `<video>`, set `video.muted = true; playsInline` and drive `currentTime` from `self.progress` (see scroll-effects skill). Encode short GOP for seek-friendliness.

## Recipe 3 — Sticky pinned product showcase (horizontal scroll)
```js
const panels = gsap.utils.toArray(".panel");
gsap.to(panels, {
  xPercent: -100 * (panels.length - 1), ease: "none",
  scrollTrigger: { trigger: ".track", pin: true, scrub: 1, end: () => "+=" + window.innerWidth * panels.length },
});
```

## Recipe 4 — 3D / Spline hero (lazy & guarded)
```jsx
const Spline = lazy(() => import("@splinetool/react-spline"));
{!isLowEnd && !touch && (
  <Suspense fallback={<img src="/hero-poster.webp" alt="" />}>
    <Spline scene="https://prod.spline.design/XXXX/scene.splinecode" />
  </Suspense>
)}
```
Always ship a static poster fallback; defer mount until idle/visible; skip on low-end/touch.

## Recipe 5 — Magnetic button & cursor micro-interactions
```jsx
// Framer Motion magnetic pull: track pointer, spring x/y toward it within a radius.
const x = useSpring(0, { stiffness: 170, damping: 18 });
const y = useSpring(0, { stiffness: 170, damping: 18 });
function onMove(e) { const r = ref.current.getBoundingClientRect();
  x.set((e.clientX - (r.left + r.width / 2)) * 0.3); y.set((e.clientY - (r.top + r.height / 2)) * 0.3); }
<motion.button ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }} />
```

## Recipe 6 — Animated stats / counters on view
```jsx
import NumberFlow from "@number-flow/react";
import { useInView } from "react-intersection-observer";
const { ref, inView } = useInView({ triggerOnce: true });
<div ref={ref}><NumberFlow value={inView ? 1240 : 0} /></div>
```

## Recipe 7 — Velocity marquee + parallax sections
Scroll-velocity-driven marquee and `useTransform`-based parallax layers create depth between sections. Keep layers to transforms only.

## Recipe 8 — Page transitions
- SPA/Next: Framer Motion `AnimatePresence` or the **View Transitions API** (`document.startViewTransition`).
- MPA: Barba.js / Swup — re-init Lenis & ScrollTrigger in the enter hook.

## Performance & quality checklist
- **Device tiers:** detect low/mid/high; drop 3D, particles, post-fx, custom cursor on weak/touch devices.
- **LCP:** keep hero text/poster in the initial bundle; lazy-load Spline/Lottie/Rive/Three chunks.
- **Reduced motion:** gate every autonomous animation behind `prefers-reduced-motion`.
- **Scroll sync:** one smooth-scroll engine only; `ScrollTrigger.refresh()` after fonts/images/route changes.
- **Assets:** WebP/AVIF images, KTX2 textures, Draco/Meshopt `.glb`, preload hero media.
- **Cleanup:** dispose GSAP contexts, Three renderers, Pixi apps, observers on unmount.
- **A11y:** real headings/landmarks, focus-visible states, skip-link, captions/poster for video.
- **Measure:** Lighthouse + WebPageTest; budget the main thread — offload heavy work, debounce scroll/resize.
