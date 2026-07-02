---
name: webxr-immersive
description: Reference for immersive web — AR/VR/WebXR — A-Frame, the native WebXR Device API, Three.js WebXR + @react-three/xr, Google model-viewer AR (quick-look / scene-viewer), Babylon.js WebXR, plus authoring/hosting platforms Wonderland Engine, Needle Engine and 8th Wall (markerless WebAR). Use when building VR/AR experiences in the browser, "view in your room" / AR product try-on, 360° tours, WebXR hand/controller tracking, or immersive 3D that runs on headsets and phones. Covers install commands, minimal scenes, AR product viewers, and gotchas.
---

# Immersive Web: AR / VR / WebXR

Run 3D experiences on headsets (Quest, Vision Pro) and phones (AR) from the browser.

## Library map
| Need | Use |
| --- | --- |
| Declarative VR/AR scenes, fastest start | **A-Frame** |
| Low-level XR session control | **WebXR Device API** (native) |
| 3D in React with XR | **Three.js WebXR** + **@react-three/xr** |
| Drop-in "view in AR" product viewer | **@google/model-viewer** |
| Full engine with XR | **Babylon.js** |
| High-perf XR authoring | **Wonderland Engine** |
| Export Unity/Blender scenes to web XR | **Needle Engine** |
| Markerless WebAR (face/world/image) | **8th Wall** |

## A-Frame (easiest VR/AR)
HTML-based entity-component framework on top of Three.js.
```bash
npm i aframe          # or <script src="https://aframe.io/releases/1.x/aframe.min.js">
```
```html
<a-scene>
  <a-box position="0 1.5 -3" color="#38bdf8" animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"></a-box>
  <a-sky color="#111"></a-sky>
  <a-camera></a-camera>
</a-scene>
```
Enter VR/AR with the built-in headset button. Add `ar` via the WebXR AR module.

## Native WebXR Device API
```js
if (await navigator.xr?.isSessionSupported("immersive-ar")) {
  const session = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ["hit-test"] });
  // attach to a WebGL/WebGPU context; drive an XR render loop via session.requestAnimationFrame
}
```
Most projects use Three.js/Babylon's XR helpers rather than raw API.

## Three.js WebXR + @react-three/xr
```bash
npm i three @react-three/fiber @react-three/xr
```
```jsx
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
const store = createXRStore();
<>
  <button onClick={() => store.enterAR()}>Enter AR</button>
  <Canvas><XR store={store}>{/* meshes, controllers, hands */}</XR></Canvas>
</>
```
Vanilla Three.js: `renderer.xr.enabled = true; document.body.appendChild(VRButton.createButton(renderer));`

## model-viewer (easiest AR product viewer)
Zero scene code; built-in AR on iOS (Quick Look) and Android (Scene Viewer).
```bash
npm i @google/model-viewer
```
```html
<model-viewer src="shoe.glb" ios-src="shoe.usdz" ar ar-modes="webxr scene-viewer quick-look"
  camera-controls auto-rotate shadow-intensity="1"></model-viewer>
```
Provide `.usdz` for iOS Quick Look. Perfect for "view this product in your room".

## Babylon.js / Wonderland / Needle / 8th Wall
- **Babylon.js**: `scene.createDefaultXRExperienceAsync()` for instant VR/AR.
- **Wonderland Engine**: high-performance editor + runtime for XR.
- **Needle Engine**: author in Unity/Blender, export to web XR.
- **8th Wall** (commercial): markerless WebAR — world/face/image tracking, no app install.

## Gotchas
- WebXR requires **HTTPS** (or localhost) and user activation to start a session.
- AR support varies: Android Chrome (Scene Viewer), iOS Safari (Quick Look via `.usdz`), Quest browser (WebXR). Feature-detect and degrade to a 3D/`model-viewer` fallback.
- Performance budget on standalone headsets is tight — low poly, baked lighting, ≤72–90fps target, foveation where available.
- Provide a non-XR fallback (orbit-controls 3D or image) for unsupported devices.
- Always end the XR session and dispose GPU resources on unmount.
