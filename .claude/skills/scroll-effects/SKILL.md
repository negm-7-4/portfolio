---
name: scroll-effects
description: Reference and code patterns for scroll-driven motion, smooth scrolling, and page transitions — Lenis, Locomotive Scroll, GSAP ScrollTrigger, Barba.js, and Swiper. Use when building scroll-triggered animations, pinned/sticky scenes, parallax, scroll-scrubbed video (video that plays as you scroll), smooth/inertia scrolling, sliders/carousels, or seamless single-page-app route transitions. Common in product-marketing and award-style sites. Covers install commands, core APIs, scroll-video, and gotchas.
---

# Scroll Effects & Page Transitions

Scroll-driven motion behind product-marketing and award-style sites.

## Picking a library
- **Lenis** — modern, lightweight smooth-scroll (inertia). The current default; integrates cleanly with ScrollTrigger.
- **Locomotive Scroll** — smooth scroll + scroll detection + parallax via data attributes. v5 is built on Lenis.
- **GSAP ScrollTrigger** — the engine for scroll-triggered timelines, pinning, scrubbing, and scroll-scrubbed video. Pair with Lenis.
- **Barba.js** — animated transitions between pages in an MPA without full reloads.
- **Swiper** — touch sliders/carousels with effects (parallax, coverflow, autoplay), used heavily in marketing hero/feature sections.

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
React: run it in a `useEffect` and `lenis.destroy()` on cleanup. To sync with GSAP, drive Lenis from `gsap.ticker` and call `ScrollTrigger.update` on Lenis `scroll`.

## GSAP ScrollTrigger
```bash
npm i gsap
```
```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// scrubbed reveal tied to scroll position
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
Call `ScrollTrigger.refresh()` after layout/content changes (fonts, images, route swaps).

## Scroll-scrubbed video (video plays on scroll)
The classic Apple-style effect: scrub a `<video>`'s `currentTime` from scroll progress.
```js
const video = document.querySelector("video");
video.pause();
ScrollTrigger.create({
  trigger: ".video-wrap", start: "top top", end: "+=3000", pin: true, scrub: true,
  onUpdate: (self) => {
    if (video.duration) video.currentTime = self.progress * video.duration;
  },
});
```
Gotchas: provide a fast-seeking encode (frequent keyframes, e.g. `-g 1` short GOP) or use an image-sequence fallback for buttery scrubbing; `video.muted = true; playsInline` for autoplay/seek on mobile; preload metadata so `duration` is known.

## Locomotive Scroll
```bash
npm i locomotive-scroll
```
```js
import LocomotiveScroll from "locomotive-scroll";
const scroll = new LocomotiveScroll(); // v5: smooth by default, data-scroll attributes for parallax
```
v4 used `data-scroll-container` + custom scroll proxy for ScrollTrigger; v5 is Lenis-based — prefer Lenis + ScrollTrigger directly for new projects.

## Barba.js (page transitions)
```bash
npm i @barba/core
```
```js
import barba from "@barba/core";
barba.init({
  transitions: [{
    leave: (data) => gsap.to(data.current.container, { opacity: 0 }),
    enter: (data) => gsap.from(data.next.container, { opacity: 0 }),
  }],
});
```
Re-init scroll/animation libs in `enter`/`after` hooks (the DOM is swapped). For React/Next SPAs prefer route-transition tools (Framer Motion `AnimatePresence`, View Transitions API) instead of Barba.

## Swiper
```bash
npm i swiper
```
```jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
<Swiper modules={[Autoplay, EffectCoverflow]} effect="coverflow" autoplay={{ delay: 3000 }} loop>
  <SwiperSlide>1</SwiperSlide>
  <SwiperSlide>2</SwiperSlide>
</Swiper>
```

## General rules
- Only one smooth-scroll engine at a time (Lenis OR Locomotive) — never stack them.
- Always `refresh()` ScrollTrigger after async content loads; kill triggers on unmount.
- Respect `prefers-reduced-motion`: disable pinning/scrubbing and fall back to instant/native scroll.
- Pin/scrub scenes are expensive — keep pinned content GPU-friendly (transform/opacity only).
