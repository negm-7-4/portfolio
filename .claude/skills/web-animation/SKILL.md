---
name: web-animation
description: Comprehensive, modern reference for web animation & transition libraries — Framer Motion / Motion, Motion One, GSAP (+ free plugins SplitText, Flip, Observer, MorphSVG, DrawSVG, MotionPath), Anime.js v4, Lottie, Rive, React Spring, Popmotion, Theatre.js, AutoAnimate, AOS, ScrollReveal, animate.css / tw-animate-css, SplitType / Splitting.js, Typed.js, NumberFlow, the native Web Animations API (WAAPI) and CSS scroll-driven / View Transitions. Use when building animated UI, page/route transitions, micro-interactions, entrance/scroll reveals, text effects, springy physics motion, animated numbers, or interactive vector (Lottie/Rive) animations. Covers install commands, when to pick each, idiomatic snippets, modern/native APIs, and gotchas.
---

# Web Animation & Motion (modern toolkit)

Everything behind motion-heavy, award-style landing pages and product-marketing
sites. Start with the picker, then jump to the library.

## Library map (pick the right tool)
| Need | Use |
| --- | --- |
| Declarative React animation, gestures, exit, layout | **Framer Motion / Motion** |
| Tiny vanilla animation on the native WAAPI | **Motion One** |
| Powerful imperative timelines & sequencing | **GSAP** (+ plugins) |
| Lightweight timeline tweening (DOM/SVG/JS objects) | **Anime.js v4** |
| Designer-made After Effects animations (JSON) | **Lottie** |
| Interactive, state-driven vector animations | **Rive** (modern Lottie alternative) |
| Natural spring physics | **React Spring** / Popmotion |
| Visual animation sequencing / design-tool workflow | **Theatre.js** |
| Animate list add/remove/reorder, zero config | **AutoAnimate** |
| Drop-in scroll reveal via attributes | **AOS** / ScrollReveal |
| Utility CSS keyframes | **animate.css** / **tw-animate-css** |
| Split text into chars/words/lines to animate | **SplitType** / **Splitting.js** / GSAP SplitText |
| Typewriter effect | **Typed.js** |
| Smoothly animated/rolling numbers | **NumberFlow** |
| Zero-dependency native motion | **WAAPI**, CSS scroll-driven, View Transitions |

## Framer Motion / Motion
Package: `motion` (v11+; React API under `motion/react`). Vanilla API under `motion`.
```bash
npm i motion
```
```jsx
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-10%" }}
  transition={{ type: "spring", stiffness: 120, damping: 18 }}
/>

<AnimatePresence mode="wait">
  {open && <motion.div key="panel" exit={{ opacity: 0 }} />}
</AnimatePresence>

// Shared element / layout transitions
<motion.div layout layoutId="card" />

// Scroll-linked values
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
```
Honor reduced motion globally: `<MotionConfig reducedMotion="user">`. Animate transforms/opacity, not layout props.

## Motion One (vanilla, WAAPI)
Tiny (~5kb), hardware-accelerated via Web Animations API.
```bash
npm i motion
```
```js
import { animate, scroll, stagger, inView } from "motion";
animate(".box", { transform: "translateY(0)", opacity: 1 }, { delay: stagger(0.1) });
inView(".reveal", (el) => animate(el, { opacity: 1, y: 0 }));
scroll(animate(".bar", { scaleX: [0, 1] }));
```

## GSAP (+ free plugins)
As of GSAP 3.13 the formerly-premium plugins are **free**: SplitText, ScrollSmoother, MorphSVG, DrawSVG, MotionPath, Inertia, etc.
```bash
npm i gsap
```
```js
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
gsap.registerPlugin(SplitText, Flip);

const split = new SplitText(".headline", { type: "chars,words" });
gsap.from(split.chars, { yPercent: 120, opacity: 0, stagger: 0.02, ease: "power3.out" });

// FLIP layout animation between two states
const state = Flip.getState(".item");
/* ...mutate DOM / reorder... */
Flip.from(state, { duration: 0.6, ease: "power2.inOut" });
```
React cleanup pattern:
```jsx
useGSAP(() => { gsap.from(".box", { x: -100 }); }, { scope: rootRef }); // @gsap/react
```
Install `@gsap/react` for the `useGSAP` hook. See `scroll-effects` skill for ScrollTrigger/ScrollSmoother.

## Anime.js v4
v4 has a new modular ESM API.
```bash
npm i animejs
```
```js
import { animate, stagger, createTimeline } from "animejs";
animate(".dot", { x: 250, scale: [1, 1.5], delay: stagger(80), loop: true, alternate: true });
const tl = createTimeline();
tl.add(".a", { x: 100 }).add(".b", { y: 100 }, "-=200");
```

## Lottie
```bash
npm i lottie-react                 # React wrapper over lottie-web
# or, smaller .lottie format:
npm i @lottiefiles/dotlottie-react
```
```jsx
import Lottie from "lottie-react";
import data from "./hero.json";
<Lottie animationData={data} loop autoplay style={{ width: 240 }} />
```
Lazy-load JSON; files can be large. Prefer `.lottie` (dotLottie) for smaller payloads.

## Rive (modern interactive vector)
State-machine driven, far smaller & more interactive than Lottie. Great for buttons, mascots, onboarding.
```bash
npm i @rive-app/react-canvas
```
```jsx
import { useRive } from "@rive-app/react-canvas";
const { RiveComponent } = useRive({ src: "/hero.riv", stateMachines: "State Machine 1", autoplay: true });
<RiveComponent style={{ width: 400, height: 400 }} />
```

## React Spring / Popmotion
```bash
npm i @react-spring/web
```
```jsx
import { useSpring, animated } from "@react-spring/web";
const styles = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, config: { tension: 210, friction: 20 } });
<animated.div style={styles} />
```

## Theatre.js (animation sequencing studio)
Design complex sequences in a visual editor, drive any JS/DOM/3D values.
```bash
npm i @theatre/core @theatre/studio
```
Pair with `@theatre/r3f` for editing R3F scenes. Strip `@theatre/studio` from production builds.

## AutoAnimate
```bash
npm i @formkit/auto-animate
```
```jsx
import { useAutoAnimate } from "@formkit/auto-animate/react";
const [parent] = useAutoAnimate();
<ul ref={parent}>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>
```

## Scroll reveal: AOS / ScrollReveal
```bash
npm i aos          # data-aos="fade-up"
npm i scrollreveal # ScrollReveal().reveal(".box", { distance: "40px", origin: "bottom" })
```

## CSS utilities: animate.css / tw-animate-css
```bash
npm i animate.css            # class="animate__animated animate__fadeInUp"
npm i tw-animate-css         # Tailwind v4 successor to tailwindcss-animate
```

## Text effects: SplitType / Splitting.js / Typed.js
```bash
npm i split-type   # const t = new SplitType(".h", { types: "chars" }) -> animate t.chars with GSAP/Motion
npm i splitting     # Splitting() adds char/word spans + CSS vars
npm i typed.js      # new Typed("#el", { strings: ["Hi", "Hello"], typeSpeed: 50 })
```

## NumberFlow (animated numbers)
Modern, accessible rolling-number component.
```bash
npm i @number-flow/react
```
```jsx
import NumberFlow from "@number-flow/react";
<NumberFlow value={count} />
```

## Native / zero-dependency modern APIs
Prefer these when you don't need a library — best performance, no bundle cost.
```js
// Web Animations API
el.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
           { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
```
```css
/* CSS scroll-driven animations (Chromium; progressive enhancement) */
@keyframes reveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; } }
.card { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
```
```js
// View Transitions API — animated DOM/route changes
document.startViewTransition(() => updateDOM());
```

## General rules
- Animate `transform`/`opacity`; avoid `width/height/top/left` (layout thrash).
- Always honor `prefers-reduced-motion` (`@media`, `MotionConfig`, or guard JS).
- Clean up timelines/instances/observers on unmount.
- Code-split heavy assets (Lottie/Rive files, GSAP plugins) so they don't block first paint.
- Reach for native (WAAPI / CSS scroll-driven / View Transitions) before adding a dependency.
