---
name: canvas-2d
description: Comprehensive, modern reference for 2D rendering, canvas, physics & creative-coding libraries — PixiJS v8 (WebGL/WebGPU), Konva / react-konva, Fabric.js, p5.js, Two.js, Paper.js, Rough.js, Matter.js (2D physics), Phaser (2D game engine), tsParticles / react-tsparticles (particle backgrounds), Vivus (SVG line-drawing), and CreateJS. Use when building high-performance 2D graphics, interactive canvas scenes, motion graphics, generative/creative art, image/design editors, drag-and-drop canvas shapes, particle backgrounds for marketing sites, 2D physics, SVG drawing animations, or WebGL/WebGPU-accelerated 2D. Covers install commands, when to pick each, core APIs, and gotchas.
---

# 2D, Canvas, Physics & Creative Coding (modern toolkit)

Engines for high-performance 2D graphics, motion graphics and interactive art.

## Library map
| Need | Use |
| --- | --- |
| Fastest 2D renderer (sprites, particles, shaders) | **PixiJS v8** (WebGL/WebGPU) |
| Canvas scene graph, shapes, drag, editor UIs | **Konva** (+ react-konva) |
| Interactive object model, design/image editor | **Fabric.js** |
| Creative coding / generative art (Processing) | **p5.js** |
| Clean SVG+Canvas+WebGL drawing API | **Two.js** |
| Vector geometry, Bézier paths, illustration | **Paper.js** |
| Hand-drawn / sketchy aesthetic | **Rough.js** |
| 2D rigid-body physics | **Matter.js** |
| Full 2D game engine | **Phaser** |
| Particle backgrounds for marketing heroes | **tsParticles** |
| Animate SVG line drawing | **Vivus** |

## PixiJS v8 (WebGL + WebGPU)
```bash
npm i pixi.js
```
```js
import { Application, Sprite, Assets } from "pixi.js";
const app = new Application();
await app.init({ background: "#000", resizeTo: window, antialias: true, preference: "webgpu" }); // webgpu w/ webgl fallback
document.body.appendChild(app.canvas);
const sprite = new Sprite(await Assets.load("/bunny.png"));
sprite.anchor.set(0.5); sprite.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(sprite);
app.ticker.add((t) => { sprite.rotation += 0.01 * t.deltaTime; });
```
v8 `init()` is async and can prefer WebGPU. `app.destroy(true)` on unmount. Use `ParticleContainer` for tens of thousands of sprites.

## Konva (+ react-konva)
```bash
npm i konva react-konva
```
```jsx
import { Stage, Layer, Rect, Circle, Transformer } from "react-konva";
<Stage width={800} height={500}><Layer>
  <Rect x={20} y={20} width={100} height={60} fill="tomato" draggable />
  <Circle x={200} y={120} radius={40} fill="cyan" draggable />
</Layer></Stage>
```
Few `Layer`s (each is a canvas). Animate via `node.to({...})` or `Konva.Animation`. `Transformer` adds resize/rotate handles.

## Fabric.js
```bash
npm i fabric
```
```js
import * as fabric from "fabric";
const canvas = new fabric.Canvas("c");
canvas.add(new fabric.Rect({ left: 50, top: 50, width: 120, height: 80, fill: "#38bdf8" }));
canvas.add(new fabric.Textbox("Edit me", { left: 100, top: 200 }));
const json = canvas.toJSON();                          // serialize
canvas.loadFromJSON(json).then(() => canvas.renderAll()); // restore
```
Objects selectable/transformable by default. `canvas.dispose()` on cleanup.

## p5.js
```bash
npm i p5
```
```js
import p5 from "p5";
new p5((p) => {
  p.setup = () => p.createCanvas(600, 400);
  p.draw = () => { p.background(10); p.fill(255); p.ellipse(p.mouseX, p.mouseY, 40); };
});
```
Use instance mode in React; call `p.remove()` on unmount. `p5.sound`/WEBGL mode available.

## Two.js
```bash
npm i two.js
```
```js
import Two from "two.js";
const two = new Two({ fullscreen: true, autostart: true }).appendTo(el);
const circle = two.makeCircle(100, 100, 50); circle.fill = "#38bdf8";
two.bind("update", () => { circle.rotation += 0.01; });
```
Renderer-agnostic (SVG / Canvas / WebGL) from one API.

## Paper.js
```bash
npm i paper
```
Powerful vector geometry, boolean ops and smooth Bézier paths — ideal for illustrative/vector tools.

## Rough.js (hand-drawn)
```bash
npm i roughjs
```
```js
import rough from "roughjs";
const rc = rough.canvas(canvasEl);
rc.rectangle(10, 10, 200, 100, { roughness: 2, fill: "#38bdf8", fillStyle: "hachure" });
```

## Matter.js (2D physics)
```bash
npm i matter-js
```
```js
import { Engine, Render, Runner, Bodies, Composite } from "matter-js";
const engine = Engine.create();
const render = Render.create({ element: el, engine });
Composite.add(engine.world, [Bodies.rectangle(400, 0, 80, 80), Bodies.rectangle(400, 600, 800, 60, { isStatic: true })]);
Render.run(render); Runner.run(Runner.create(), engine);
```
Great for playful "falling objects" hero sections. Pair with a canvas/Pixi renderer for custom visuals.

## Phaser (2D game engine)
```bash
npm i phaser
```
Full game framework (scenes, sprites, physics, input, tilemaps). Use for interactive games/experiences, not simple decoration.

## tsParticles (particle backgrounds)
Modern, maintained successor to particles.js — popular on marketing/landing heroes.
```bash
npm i @tsparticles/react @tsparticles/engine @tsparticles/slim
```
```jsx
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
// initParticlesEngine(async (e) => await loadSlim(e)); then <Particles options={{ ... }} />
```

## Vivus (SVG line drawing)
```bash
npm i vivus
```
```js
import Vivus from "vivus";
new Vivus("logo", { type: "delayed", duration: 150 }); // animates stroke drawing of an inline SVG
```

## Performance & gotchas
- Pool and reuse objects/sprites; don't recreate every frame.
- Cap canvas resolution with devicePixelRatio (~2) for retina without melting the GPU.
- Pause `ticker`/render loop when offscreen or the tab is hidden.
- Destroy the app/canvas/instance and remove listeners on unmount (these hold GPU/canvas contexts).
- For thousands of objects use a WebGL/WebGPU renderer (PixiJS) over plain canvas (Konva/Fabric) for frame rate.
- Respect `prefers-reduced-motion`: pause autonomous motion / particles.
