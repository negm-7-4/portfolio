---
name: web-animation
description: Reference and code patterns for web animation & transition libraries — Framer Motion / Motion, GSAP, Anime.js, Lottie, React Spring, AOS, and Auto-Animate. Use when building animated UI, page/route transitions, micro-interactions, entrance/scroll reveals, springy physics motion, or playing After Effects (Lottie) animations on the web. Covers install commands, core APIs, idiomatic snippets, and common gotchas.
---

# Web Animation & Motion

Toolkit behind motion-heavy, award-style landing pages and product-marketing
sites. Pick the library that fits the job, then use the patterns below.

## Picking a library
- **Framer Motion / Motion** — declarative React animation, layout animations, gestures, `AnimatePresence` exit transitions. Default for React.
- **GSAP** — imperative timelines, the most powerful for sequencing & scroll (see `scroll-effects` skill for ScrollTrigger). Framework-agnostic.
- **Anime.js** — lightweight, timeline-based, great for SVG/DOM/object tweening without React.
- **Lottie** — render After Effects/Figma animations exported as JSON. Best for illustrative, designer-made motion.
- **React Spring** — physics/spring-based animation when you want natural motion driven by spring configs rather than durations.
- **AOS (Animate On Scroll)** — drop-in scroll-reveal via data attributes. Fastest path for simple "fade up on scroll".
- **Auto-Animate (FormKit)** — one line to animate add/remove/reorder of list children. Zero config.

## Framer Motion / Motion
Package: `motion` (v11+ ships React API under `motion/react`; older `framer-motion` still works).
```bash
npm i motion
```
```jsx
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-10%" }}
  transition={{ type: "spring", stiffness: 120, damping: 18 }}
/>

// Exit animations require AnimatePresence + a stable key
<AnimatePresence mode="wait">
  {open && <motion.div key="panel" exit={{ opacity: 0 }} />}
</AnimatePresence>

// Layout animations: add `layout`; shared element transitions: layoutId
<motion.div layout layoutId="card" />
```
Gotchas: respect reduced motion with `<MotionConfig reducedMotion="user">`; `whileInView` with `once:false` re-triggers; animate transforms/opacity (cheap) over layout-affecting props.

## GSAP
```bash
npm i gsap
```
```js
import gsap from "gsap";
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
tl.from(".title", { y: 60, opacity: 0, duration: 0.8 })
  .from(".sub", { y: 30, opacity: 0 }, "-=0.4"); // overlap previous by 0.4s
```
In React, wrap in `gsap.context()` for automatic cleanup:
```jsx
useEffect(() => {
  const ctx = gsap.context(() => { gsap.from(".box", { x: -100 }); }, rootRef);
  return () => ctx.revert();
}, []);
```
Register plugins once: `gsap.registerPlugin(ScrollTrigger)`.

## Anime.js
```bash
npm i animejs
```
```js
import anime from "animejs";
anime({ targets: ".dot", translateX: 250, scale: [1, 1.5], delay: anime.stagger(80), loop: true, direction: "alternate" });
```

## Lottie
```bash
npm i lottie-react   # React wrapper around lottie-web
```
```jsx
import Lottie from "lottie-react";
import data from "./hero.json";
<Lottie animationData={data} loop autoplay style={{ width: 240 }} />
```
Use `lottie-web` directly for non-React. For tiny bundles consider `@lottiefiles/dotlottie-react` (.lottie format). Lazy-load JSON — Lottie files can be large.

## React Spring
```bash
npm i @react-spring/web
```
```jsx
import { useSpring, animated } from "@react-spring/web";
const styles = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, config: { tension: 210, friction: 20 } });
<animated.div style={styles} />
```

## AOS
```bash
npm i aos
```
```js
import AOS from "aos"; import "aos/dist/aos.css";
AOS.init({ duration: 600, once: true });
// markup: <div data-aos="fade-up" data-aos-delay="100">
```

## Auto-Animate
```bash
npm i @formkit/auto-animate
```
```jsx
import { useAutoAnimate } from "@formkit/auto-animate/react";
const [parent] = useAutoAnimate();
<ul ref={parent}>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>
```

## General rules
- Animate `transform`/`opacity`; avoid animating `width/height/top/left` (layout thrash).
- Always honor `prefers-reduced-motion`.
- Clean up timelines/instances on unmount to avoid leaks.
- Code-split heavy animation chunks (Lottie JSON, GSAP plugins) so they don't block first paint.
