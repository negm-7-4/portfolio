---
name: canvas-2d
description: Reference and code patterns for 2D rendering, canvas & creative-coding libraries — PixiJS, Konva (react-konva), Fabric.js, and p5.js. Use when building high-performance 2D graphics, interactive canvas scenes, motion graphics, generative/creative art, image editors, drag-and-drop canvas shapes, particle systems, or WebGL-accelerated 2D. Covers install commands, core APIs, and gotchas.
---

# 2D & Canvas

Engines for high-performance 2D graphics, motion graphics and interactive art.

## Picking a library
- **PixiJS** — fastest 2D WebGL renderer. Use for particles, lots of sprites, games, motion graphics, shader effects.
- **Konva** — 2D canvas scene graph with shapes, events, dragging, transformers. Great for diagram/editor UIs. `react-konva` for React.
- **Fabric.js** — interactive object model on canvas: select/move/scale/rotate objects, serialize to JSON. Ideal for image/design editors.
- **p5.js** — creative-coding / generative art with the Processing API. Best for sketches, teaching, and artistic visuals.

## PixiJS
```bash
npm i pixi.js
```
```js
import { Application, Sprite, Assets } from "pixi.js";
const app = new Application();
await app.init({ background: "#000", resizeTo: window, antialias: true });
document.body.appendChild(app.canvas);
const tex = await Assets.load("/bunny.png");
const sprite = new Sprite(tex);
sprite.anchor.set(0.5); sprite.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(sprite);
app.ticker.add((ticker) => { sprite.rotation += 0.01 * ticker.deltaTime; });
```
v8 init is async (`await app.init()`). Destroy with `app.destroy(true)` on unmount.

## Konva (+ react-konva)
```bash
npm i konva react-konva
```
```jsx
import { Stage, Layer, Rect, Circle } from "react-konva";
<Stage width={800} height={500}>
  <Layer>
    <Rect x={20} y={20} width={100} height={60} fill="tomato" draggable />
    <Circle x={200} y={120} radius={40} fill="cyan" draggable />
  </Layer>
</Stage>
```
Use multiple `Layer`s sparingly (each is its own canvas). For animation use `Konva.Animation` or `node.to({...})`.

## Fabric.js
```bash
npm i fabric
```
```js
import * as fabric from "fabric";
const canvas = new fabric.Canvas("c");
canvas.add(new fabric.Rect({ left: 50, top: 50, width: 120, height: 80, fill: "#38bdf8" }));
canvas.add(new fabric.Textbox("Edit me", { left: 100, top: 200 }));
const json = canvas.toJSON();          // serialize
canvas.loadFromJSON(json, () => canvas.renderAll()); // restore
```
Objects are selectable/transformable by default. `canvas.dispose()` on cleanup.

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
In React use instance mode (above) — not global mode — and remove the instance on unmount (`p.remove()`).

## Performance & gotchas
- Cap and reuse: pool sprites/objects rather than recreating each frame.
- Set canvas resolution with devicePixelRatio but cap it (~2) for retina without melting GPUs.
- Pause `ticker`/animation when offscreen or tab hidden.
- Destroy the app/canvas/instance on unmount — these libraries hold WebGL/canvas contexts and event listeners.
- For thousands of objects use PixiJS (WebGL) over plain canvas (Konva/Fabric) for frame rate.
