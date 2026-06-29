---
name: web-3d
description: Reference and code patterns for 3D / WebGL on the web — Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei), Spline (@splinetool/react-spline), and Babylon.js. Use when building immersive 3D websites, WebGL scenes, 3D product viewers/configurators, hero scenes with models, or interactive 3D backgrounds. Covers install commands, scene setup, loading GLTF models, performance, and gotchas.
---

# 3D & WebGL on the Web

Engines behind immersive 3D websites and product configurators.

## Picking a library
- **Three.js** — the core WebGL engine. Full control, imperative API. Use directly for non-React or custom renderers.
- **React Three Fiber (R3F)** — React renderer for Three.js. Declarative scene graph as JSX. Default for React 3D.
- **Drei** — helper components/hooks for R3F (controls, loaders, environments, text, shadows). Always pair with R3F.
- **Spline** — design 3D scenes in a visual editor, embed the runtime. Fastest path for designer-made 3D; heavy runtime.
- **Babylon.js** — full game-engine-grade alternative to Three.js (physics, WebXR, node material editor) with batteries included.

## Three.js (vanilla)
```bash
npm i three
```
```js
import * as THREE from "three";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // cap DPR for perf
renderer.setSize(innerWidth, innerHeight);
const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff }));
scene.add(mesh, new THREE.AmbientLight(0xffffff, 0.6));
renderer.setAnimationLoop(() => { mesh.rotation.y += 0.01; renderer.render(scene, camera); });
```
Cleanup: dispose geometries/materials/textures and `renderer.dispose()` on unmount. Handle resize.

## React Three Fiber + Drei
```bash
npm i three @react-three/fiber @react-three/drei
```
```jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Float } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/model.glb");
  return <primitive object={scene} />;
}
useGLTF.preload("/model.glb");

<Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
  <ambientLight intensity={0.6} />
  <Float><Model /></Float>
  <Environment preset="city" />
  <OrbitControls enableZoom={false} />
</Canvas>
```
- `useFrame((state, delta) => {...})` for per-frame logic; never `setState` every frame — mutate refs instead.
- Reuse geometries/materials; instance repeated meshes with `<Instances>`.
- Suspense: R3F loaders suspend, so wrap async content and provide a fallback.

## Spline
```bash
npm i @splinetool/react-spline @splinetool/runtime
```
```jsx
import Spline from "@splinetool/react-spline";
<Spline scene="https://prod.spline.design/XXXX/scene.splinecode" />
```
Lazy-load it — the runtime is large (multi-MB). Defer mount until idle/visible and skip on low-end/touch devices.

## Babylon.js
```bash
npm i @babylonjs/core
```
```js
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder } from "@babylonjs/core";
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 2.5, 4, Vector3.Zero(), scene).attachControl(canvas, true);
new HemisphericLight("light", new Vector3(0, 1, 0), scene);
MeshBuilder.CreateBox("box", {}, scene);
engine.runRenderLoop(() => scene.render());
```

## Performance & gotchas
- Cap `devicePixelRatio` to ~2; expose a low/medium/high tier and degrade (fewer lights, lower poly, no shadows) on weak devices.
- Prefer compressed assets: `.glb` with Draco/Meshopt, KTX2 textures.
- Pause the render loop when the canvas/tab is offscreen (`IntersectionObserver` / `visibilitychange`).
- Always dispose GPU resources on unmount; WebGL contexts leak otherwise.
- Respect `prefers-reduced-motion` — offer a static poster/image fallback.
