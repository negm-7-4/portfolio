---
name: animated-ui-components
description: Reference for modern copy-paste animated React/Tailwind UI component libraries used on 2026 landing & marketing pages — shadcn/ui (base), Aceternity UI, Magic UI, 21st.dev (+ Magic MCP), React Bits, Motion Primitives, Cult UI, Skiper UI, HyperUI, and animated background libs Vanta.js & Cobe. Use when building landing/marketing pages or hero sections that need ready-made flashy components (animated beams, glowing borders, marquees, bento grids, 3D/spotlight cards, particle/wave backgrounds, text shimmer, infinite scroll, magnetic buttons). Covers what each library is best at, install/usage, and how to combine them.
---

# Animated UI Component Libraries (2026)

Copy-paste / CLI-installed React + Tailwind + Motion components that make
landing and product-marketing pages "pop". These are not npm runtime deps —
most copy source into your project (shadcn-style), so you own & can tweak them.

## Library map
| Library | Best for | Model |
| --- | --- | --- |
| **shadcn/ui** | Accessible base components (Radix) | CLI copies source |
| **Aceternity UI** | Landing-page flair: 3D cards, glowing beams, spotlight, backgrounds | Copy / CLI |
| **Magic UI** | Marketing micro-interactions: animated beams, retro grid, marquee, shimmer | CLI (`shadcn add`) |
| **21st.dev** | Huge community catalog + **Magic MCP** (generate UI from a prompt) | CLI / MCP |
| **React Bits** | Animated text & background effects, creative bits | Copy / CLI |
| **Motion Primitives** | Low-level Motion building blocks | Copy |
| **Cult UI / Skiper UI** | Opinionated flashy sections | Copy |
| **HyperUI** | Free Tailwind marketing blocks (lighter on JS) | Copy |
| **Vanta.js** | Animated 3D WebGL backgrounds (waves/net/fog/birds) | npm |
| **Cobe** | Tiny interactive WebGL globe (5kb) | npm |

## Base: shadcn/ui
Foundation most of the above build on. Not a dependency — the CLI copies
component source into your repo.
```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog
```

## Aceternity UI
200+ Tailwind + Framer Motion components (3D pin cards, background beams,
spotlight, infinite moving cards, macbook scroll). Mostly copy-paste; many
installable via the shadcn CLI with their registry URL.
```bash
npx shadcn@latest add "https://ui.aceternity.com/registry/<component>.json"
```
Requires `framer-motion`/`motion` + `tailwindcss` + `clsx`/`tailwind-merge`.

## Magic UI
150+ animated components (Animated Beam, Marquee, Retro Grid, Border Beam,
Shimmer Button, Number Ticker, Bento Grid). Designed to drop into shadcn.
```bash
npx shadcn@latest add "https://magicui.design/r/<component>.json"
```

## 21st.dev + Magic MCP
Community marketplace of shadcn/Radix-based components. **Magic MCP** lets an
AI agent (Cursor/Windsurf/Claude) generate components from a prompt against
the catalog. Great for rapid scaffolding.

## React Bits / Motion Primitives / Cult / Skiper / HyperUI
```bash
# React Bits — animated text/background bits (Split Text, Aurora, Orb, Threads)
npx jsrepo add  https://reactbits.dev/...     # or copy from the site
# Motion Primitives — composable Motion patterns (copy from motion-primitives.com)
# Cult UI / Skiper UI — copy flashy sections from their sites
# HyperUI — copy free Tailwind marketing blocks (hyperui.dev)
```

## Vanta.js (animated 3D backgrounds)
~120kb (mostly three.js); renders WAVES, NET, FOG, BIRDS, GLOBE, CELLS, etc.
Hugely common on marketing hero sections. Works with vanilla/React/Vue.
```bash
npm i vanta three
```
```jsx
import { useEffect, useRef, useState } from "react";
import NET from "vanta/dist/vanta.net.min";
function Hero() {
  const ref = useRef(null); const [fx, setFx] = useState(null);
  useEffect(() => {
    if (!fx) setFx(NET({ el: ref.current, mouseControls: true, color: 0x38bdf8, backgroundColor: 0x0 }));
    return () => fx && fx.destroy();
  }, [fx]);
  return <div ref={ref} className="h-screen" />;
}
```
Always `.destroy()` on unmount; gate on `prefers-reduced-motion` and skip on low-end devices.

## Cobe (interactive globe)
```bash
npm i cobe
```
Tiny WebGL globe (think Stripe/Linear hero). Draw to a canvas, spin with a ref.

## How to combine (recipe)
1. **shadcn/ui** for accessible primitives (buttons, dialogs, forms).
2. **Aceternity / Magic UI** for the eye-catching hero & feature sections.
3. **Vanta.js / Cobe** for the animated background layer.
4. Drive scroll reveals with the `scroll-effects` skill; page motion with `web-animation`.

## Gotchas
- These copy source into your repo — review and prune; don't ship 200 unused components.
- They depend on `motion`/`framer-motion` + Tailwind; keep one version to avoid duplication.
- Respect `prefers-reduced-motion`; many effects loop forever and hurt battery/CPU.
- WebGL backgrounds (Vanta/Cobe) must be destroyed on unmount and skipped on weak/touch devices.
- Heavy flair hurts LCP/CLS — lazy-load below-the-fold sections.
