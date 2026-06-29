---
name: 3d-authoring-pipeline
description: Reference for the 3D asset authoring & optimization pipeline for the web — exporting from Blender to glTF/GLB, optimizing with gltf-transform (Draco, Meshopt, KTX2/Basis textures, weld/dedup/prune), converting GLB to React Three Fiber components with gltfjsx, baking lighting/PBR textures (Substance 3D / Blender bake), and authoring with Spline and Rive for export. Use when preparing 3D models for a website, shrinking GLB file size, fixing huge/slow 3D assets, setting up draco/meshopt/ktx2 compression, generating R3F components from models, or planning a designer→developer 3D workflow. Covers CLI commands, recommended settings, and gotchas.
---

# 3D Authoring & Optimization Pipeline (Blender → Web)

How designer-made 3D becomes fast, web-ready assets. The render libraries live
in the **web-3d** skill; this skill is about producing & optimizing the assets.

## Workflow at a glance
1. **Model/texture** in Blender (or import from Spline/Substance/CAD).
2. **Export** to `.glb` (binary glTF) with the right settings.
3. **Optimize** with `gltf-transform` (geometry + texture compression).
4. **Convert** to a JSX component with `gltfjsx` (for R3F).
5. **Verify** size, draw calls, and load in-browser.

## Export from Blender → glTF/GLB
Use Blender's built-in glTF 2.0 exporter (File → Export → glTF 2.0):
- Format: **glTF Binary (.glb)** — single file.
- Include: selected objects, apply modifiers.
- Transform: +Y up.
- Geometry: apply modifiers, export normals/UVs/tangents (tangents only if using normal maps).
- Compression: enable **Draco** for meshes (or compress later with gltf-transform).
- Animation: bake actions if you need them on the web.
Keep meshes low-poly; retopologize heavy sculpts; merge objects to cut draw calls.

## Optimize with gltf-transform (the key step)
```bash
npm i -g @gltf-transform/cli
# one-shot, web-friendly defaults: dedup, prune, weld, Draco geometry, resize+KTX2 textures
gltf-transform optimize in.glb out.glb --texture-compress ktx2 --texture-size 2048
# or step by step:
gltf-transform dedup in.glb t1.glb
gltf-transform prune t1.glb t2.glb
gltf-transform weld t2.glb t3.glb
gltf-transform draco t3.glb t4.glb                 # mesh compression
gltf-transform meshopt t3.glb t4.glb               # alternative to Draco (often better for web)
gltf-transform uastc t4.glb out.glb --resize 2048,2048   # KTX2/Basis GPU textures
```
Rules of thumb: **Meshopt** decodes fast and pairs well with the web; **KTX2/Basis** textures cut VRAM massively and decode on the GPU; resize textures to what's actually visible (often 1k–2k is plenty).

## Convert GLB → R3F component (gltfjsx)
```bash
npx gltfjsx model.glb --transform        # also runs optimization; emits Model.jsx + model-transformed.glb
```
Gives a declarative `<Model />` with named nodes so you can animate/swap materials in React. Loaders: register Draco/Meshopt/KTX2 decoders (drei `useGLTF` wires Draco automatically; add Meshopt/KTX2 if used).

## Baking lighting & PBR textures
- **Blender bake**: bake lighting/AO into textures so the web scene needs fewer realtime lights → big perf win for static scenes.
- **Substance 3D Painter/Designer**: author PBR maps (baseColor, normal, roughness/metallic, AO); export a glTF-compatible PBR set; pack ORM (Occlusion-Roughness-Metallic) into one texture to save fetches.

## Designer tools that export to web
- **Spline**: design interactively, export `.splinecode` (runtime) or `.glb`/React component. Fast but the runtime is heavy — prefer `.glb` export when you only need the model.
- **Rive**: interactive vector animations (`.riv`) — not 3D meshes, but ideal for UI motion/mascots; tiny and state-machine driven.

## Verify before shipping
- Inspect with `gltf-transform inspect out.glb` (counts, texture sizes, materials).
- Target: hero models ideally < ~1–3 MB; keep draw calls low (merge/instance).
- Preview in https://gltf-viewer.donmccurdy.com or three.js editor.

## Gotchas
- Always include the matching **decoder** for whatever compression you used (Draco/Meshopt/KTX2) or the model won't load.
- KTX2 needs the Basis transcoder available at runtime.
- Don't ship 4k textures for a thumbnail-sized model; resize to displayed size.
- Bake static lighting; realtime lights + shadows are the usual perf killer.
- Re-export breaks node names — re-run `gltfjsx` after model changes.
