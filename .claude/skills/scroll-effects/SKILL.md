---
name: scroll-effects
description: Comprehensive, modern reference for scroll-driven motion, smooth scrolling & page transitions — Lenis, Locomotive Scroll, GSAP ScrollTrigger / ScrollSmoother / Observer, Scrollama (scrollytelling), Rellax, react-scroll-parallax, simple-parallax, Atropos, react-intersection-observer, Swiper, Barba.js, Swup, Taxi.js, and the native View Transitions API + CSS scroll-driven animations (animation-timeline: scroll()/view()). Use when building scroll-triggered animations, pinned/sticky scenes, parallax, scroll-scrubbed video (video that plays as you scroll), scrollytelling, smooth/inertia scrolling, sliders/carousels, or seamless route/page transitions. Common in product-marketing and award-style sites. Covers install commands, scroll-video, native APIs, and gotchas.
---

# Scroll Effects & Page Transitions (modern toolkit)

Scroll-driven motion behind product-marketing and award-style sites.

## Library map
| Need | Use |
| --- | --- |
| Smooth/inertia scrolling | **Lenis** (modern default) / Locomotive |
| Scroll-triggered timelines, pinning, scrubbing | **GSAP ScrollTrigger** |
| Native-feel smoothing + parallax driven by GSAP | **ScrollSmoother** (free in GSAP 3.13) |
| Unified wheel/touch/pointer gesture handling | **GSAP Observer** |
| Step-based scrollytelling (data stories) | **Scrollama** |
| Simple parallax | **Rellax** / simple-parallax / react-scroll-parallax |
| 3D tilt/parallax on hover | **Atropos** |
| Fire on enter/leave viewport (React) | **react-intersection-observer** |
| Sliders / carousels with effects | **Swiper** |
| Animated page transitions (MPA) | **Barba.js** / Swup / Taxi.js |
| Animated DOM/route transitions (native) | **View Transitions API** |
| Pure-CSS scroll reveal / scrubbing | **CSS scroll-driven animations** |

## Lenis (smooth scroll)
```bash
npm i lenis
```
```js
import Lenis from "lenis";
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
```
React: run in `useEffect`, `lenis.destroy()` on cleanup. There's also `lenis/react` (`<ReactLenis root>`).

## GSAP ScrollTrigger (the workhorse)
```bash
npm i gsap
```
```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.to(".panel", {
  xPercent: -100,
  scrollTrigger: { trigger: ".wrap", start: "top top", end: "+=2000", scrub: true, pin: true },
});
```
Sync with Lenis:
```js
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Call `ScrollTrigger.refresh()` after layout/content/route changes.

## ScrollSmoother & Observer (free in GSAP 3.13)
```js
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Observer } from "gsap/Observer";
gsap.registerPlugin(ScrollSmoother, Observer);
ScrollSmoother.create({ smooth: 1.2, effects: true }); // needs #smooth-wrapper > #smooth-content
Observer.create({ type: "wheel,touch", onUp: () => {}, onDown: () => {} }); // section-snap UIs
```
Use ScrollSmoother **or** Lenis — never both.

## Scroll-scrubbed video (video plays on scroll)
Classic Apple-style effect: drive a `<video>`'s `currentTime` from scroll progress.
```js
const video = document.querySelector("video");
video.pause(); video.muted = true; // playsInline in markup
ScrollTrigger.create({
  trigger: ".video-wrap", start: "top top", end: "+=3000", pin: true, scrub: true,
  onUpdate: (self) => { if (video.duration) video.currentTime = self.progress * video.duration; },
});
```
For buttery scrubbing: encode with frequent keyframes (short GOP, e.g. `-g 1`) or use an **image-sequence** (draw frames to canvas) fallback; preload metadata so `duration` is known.

## Scrollama (scrollytelling)
```bash
npm i scrollama
```
```js
import scrollama from "scrollama";
const scroller = scrollama();
scroller.setup({ step: ".step", offset: 0.5 }).onStepEnter(({ element, index }) => { /* swap graphic */ });
```
Best for data-story narratives where a sticky graphic updates as text steps scroll past.

## Parallax: Rellax / simple-parallax / react-scroll-parallax / Atropos
```bash
npm i rellax                 # new Rellax(".rellax")  + data-rellax-speed
npm i simple-parallax-js     # image parallax on scroll
npm i react-scroll-parallax  # <Parallax speed={-10}> in React
npm i atropos                 # 3D tilt/parallax card on hover (touch-aware)
```

## react-intersection-observer
```bash
npm i react-intersection-observer
```
```jsx
import { useInView } from "react-intersection-observer";
const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "-10%" });
<div ref={ref} className={inView ? "is-visible" : ""} />
```

## Swiper
```bash
npm i swiper
```
```jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Parallax } from "swiper/modules";
import "swiper/css";
<Swiper modules={[Autoplay, EffectCoverflow, Parallax]} effect="coverflow" autoplay={{ delay: 3000 }} loop>
  <SwiperSlide>1</SwiperSlide><SwiperSlide>2</SwiperSlide>
</Swiper>
```

## Page transitions: Barba / Swup / Taxi (MPA)
```bash
npm i @barba/core   # leave/enter hooks, re-init libs in enter/after
npm i swup          # plugin-based animated page transitions
npm i @unseenco/taxi # modern Barba-like router with transitions
```
For React/Next SPAs prefer Framer Motion `AnimatePresence` or the View Transitions API instead.

## Native modern APIs (prefer when possible)
```js
// View Transitions API — animated route/DOM changes, supported in Next.js & SPAs
document.startViewTransition(() => updateDOM());
```
```css
/* CSS scroll-driven animations — zero JS, runs on the compositor */
.reveal { animation: fade linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
@keyframes fade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; } }
/* progress bar tied to page scroll */
.bar { animation: grow linear; animation-timeline: scroll(root); }
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

## General rules
- Only one smooth-scroll engine at a time (Lenis OR Locomotive OR ScrollSmoother).
- `ScrollTrigger.refresh()` after async content loads; `kill()` triggers on unmount.
- Respect `prefers-reduced-motion`: disable pinning/scrubbing, fall back to native/instant scroll.
- Keep pinned/scrubbed content GPU-friendly (transform/opacity only).
- Prefer native (View Transitions / CSS scroll-driven) before adding JS where browser support allows; progressively enhance.
