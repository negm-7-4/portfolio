---
name: web-3d
description: Comprehensive, modern reference for 3D / WebGL / WebGPU on the web — Three.js (incl. WebGPURenderer & TSL node materials), React Three Fiber, Drei, @react-three/postprocessing, @react-three/rapier & cannon-es physics, leva controls, gltfjsx, Spline, Babylon.js, Google model-viewer, PlayCanvas, OGL, Curtains.js, Zdog, and Needle Engine. Use when building immersive 3D websites, WebGL/WebGPU scenes, 3D product viewers/configurators, hero scenes with GLTF models, shader effects, physics, or interactive 3D backgrounds. Covers install commands, scene setup, modern WebGPU/TSL, post-processing, physics, performance, and gotchas.
---

# 3D / WebGL / WebGPU (modern toolkit)

Engines behind immersive 3D websites, product configurators and shader art.

## Library map
| Need | Use |
| --- | --- |
| Core WebGL/WebGPU engine | **Three.js** (+ WebGPURenderer / TSL) |
| 3D in React, declarative | **React Three Fiber (R3F)** |
| R3F helpers (controls, loaders, env, text) | **Drei** |
| Bloom / DOF / glitch / outline effects | **@react-three/postprocessing** (+ `postprocessing`) |
| Physics in R3F | **@react-three/rapier** (or cannon-es) |
| Live tweak GUI for 3D params | **leva** |
| Convert .glb → JSX component | **gltfjsx** |
| Designer-made 3D scenes (visual editor) | **Spline** |
| Full game-engine alternative | **Babylon.js** / PlayCanvas |
| Drop-in <model-viewer> web component | **@google/model-viewer** |
| Minimal, tiny WebGL | **OGL** |
| WebGL on images/video (distortion, hover) | **Curtains.js** |
| Pseudo-3D with flat shapes | **Zdog** |

## Three.js (vanilla, WebGL)
```bash
npm i three
```
```js
import * as THREE from "three";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));   // cap DPR
renderer.setSize(innerWidth, innerHeight);
const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial());
scene.add(mesh, new THREE.AmbientLight(0xffffff, 0.6));
renderer.setAnimationLoop(() => { mesh.rotation.y += 0.01; renderer.render(scene, camera); });
```
Dispose geometries/materials/textures and `renderer.dispose()` on unmount; handle resize.

## Three.js WebGPU + TSL (cutting edge)
WebGPU renderer with the Three Shading Language (write shaders in JS, node-based).
```js
import * as THREE from "three/webgpu";
import { color, uv, sin, time } from "three/tsl";
const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
const material = new THREE.MeshBasicNodeMaterial();
material.colorNode = color(0x38bdf8).mul(sin(time).add(1)); // animated via TSL
```
WebGPU falls back to WebGL2 where unsupported. TSL targets both backends from one shader graph.

## React Three Fiber + Drei
```bash
npm i three @react-three/fiber @react-three/drei
```
```jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Float, Html, ContactShadows } from "@react-three/drei";

function Model() { const { scene } = useGLTF("/model.glb"); return <primitive object={scene} />; }
useGLTF.preload("/model.glb");

<Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
  <ambientLight intensity={0.6} />
  <Float><Model /></Float>
  <Environment preset="city" />
  <ContactShadows opacity={0.4} blur={2} />
  <OrbitControls enableZoom={false} />
</Canvas>
```
- `useFrame((state, delta) => {})` for per-frame logic — mutate refs, never `setState` each frame.
- Reuse geometry/material; instance repeated meshes with `<Instances>`/`<Merged>`.
- R3F loaders suspend — wrap in `<Suspense fallback={...}>`.
- R3F also supports WebGPU: `<Canvas gl={async (p) => { const r = new WebGPURenderer(p); await r.init(); return r; }}>`.

## Post-processing
```bash
npm i @react-three/postprocessing postprocessing
```
```jsx
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
<EffectComposer><Bloom intensity={0.8} mipmapBlur /><Vignette /></EffectComposer>
```

## Physics (Rapier / cannon)
```bash
npm i @react-three/rapier
```
```jsx
import { Physics, RigidBody } from "@react-three/rapier";
<Physics gravity={[0, -9.8, 0]}>
  <RigidBody colliders="ball"><mesh><sphereGeometry /></mesh></RigidBody>
</Physics>
```
Alternative: `cannon-es` + `@react-three/cannon`.

## leva (GUI controls) & gltfjsx
```bash
npm i leva
npx gltfjsx model.glb --transform   # outputs an optimized JSX component + compressed glb
```
```jsx
import { useControls } from "leva";
const { intensity } = useControls({ intensity: { value: 1, min: 0, max: 5 } });
```

## Spline
```bash
npm i @splinetool/react-spline @splinetool/runtime
```
```jsx
import Spline from "@splinetool/react-spline";
<Spline scene="https://prod.spline.design/XXXX/scene.splinecode" />
```
Runtime is multi-MB — lazy-load, defer until idle/visible, skip on low-end/touch.

## Babylon.js / PlayCanvas
```bash
npm i @babylonjs/core    # full engine: physics, WebXR, node material editor, WebGPU
```
```js
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder } from "@babylonjs/core";
const engine = new Engine(canvas, true); const scene = new Scene(engine);
new ArcRotateCamera("c", -Math.PI/2, Math.PI/2.5, 4, Vector3.Zero(), scene).attachControl(canvas, true);
new HemisphericLight("l", new Vector3(0,1,0), scene); MeshBuilder.CreateBox("b", {}, scene);
engine.runRenderLoop(() => scene.render());
```
PlayCanvas (`playcanvas` / `@playcanvas/react`) is another full engine with a web editor.

## model-viewer (easiest 3D embed)
```bash
npm i @google/model-viewer
```
```html
<model-viewer src="shoe.glb" camera-controls auto-rotate ar shadow-intensity="1"></model-viewer>
```
Zero JS scene setup, built-in AR (`ar` attribute) — great for product pages.

## OGL / Curtains.js / Zdog
```bash
npm i ogl          # minimal low-level WebGL (small bundle, custom shaders)
npm i curtainsjs   # turn <img>/<video> into WebGL planes for distortion/hover/scroll effects
npm i zdog         # round, designer-friendly pseudo-3D with flat shapes
```

## Performance & gotchas
- Cap `devicePixelRatio` (~2); expose low/medium/high tiers and degrade (fewer lights, lower poly, no shadows, no post-fx) on weak devices.
- Compressed assets: `.glb` with Draco/Meshopt, KTX2 textures; run `gltfjsx --transform`.
- Pause the render loop when offscreen/tab hidden (IntersectionObserver / `visibilitychange`).
- Always dispose GPU resources on unmount — WebGL/WebGPU contexts leak otherwise.
- WebGPU: always `await renderer.init()`; provide WebGL2 fallback.
- Respect `prefers-reduced-motion` and offer a static poster/image fallback.
