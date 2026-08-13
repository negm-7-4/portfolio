import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  Sparkles,
  Stars,
  AdaptiveDpr,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  DepthOfField,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { damp3, damp, dampC } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";
import { sections } from "../../data/sections";
// Side-effect import: the module calls extend() to register <fresnelMaterial>.
import "./materials/FresnelMaterial";
import MorphField from "./MorphField";
import HeroModel from "./HeroModel";
import Architecture from "./Architecture";
import Nebula from "./Nebula";
import Comets from "./Comets";

/* eslint-disable react/no-unknown-property */

const smootherstep = (t) => {
  t = Math.min(1, Math.max(0, t));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const lerp = (a, b, t) => a + (b - a) * t;

/* A real mouse is present — decided once, independent of the perf tier. */
const HAS_FINE_POINTER =
  typeof window !== "undefined" &&
  !window.matchMedia?.("(pointer: coarse)").matches;

/* One composed camera shot per chapter (pos + lookAt + fov + dutch roll).
   Scroll eases between consecutive keys, so the journey reads as deliberate
   cinematic cuts rather than one continuous spin. Tuned so the hero +
   contact beats sit close/centred and the text-heavy middle pulls WIDE
   (centre left calm). `roll` banks each shot a hair differently — the
   almost-subliminal dutch angle that makes a rig feel hand-operated. */
const DEG = Math.PI / 180;
const CAM_KEYS = [
  { pos: [2.8, 0.6, 9.8], look: [-2.1, 0.2, 0], fov: 42, roll: 0 }, // 00 hero
  { pos: [-3.2, 1.4, 10.6], look: [0.4, 0.0, 0], fov: 45, roll: -1.2 * DEG }, // 01 about
  { pos: [4.8, 2.6, 11.4], look: [0.0, 0.4, 0], fov: 47, roll: 1.5 * DEG }, // 02 services
  { pos: [-5.4, 0.4, 12.2], look: [0.2, -0.2, 0], fov: 49, roll: -1.8 * DEG }, // 03 skills
  { pos: [0.0, 5.0, 12.8], look: [0.0, -0.8, 0], fov: 49, roll: 1.0 * DEG }, // 04 journey
  { pos: [5.8, -1.8, 12.0], look: [-0.5, 0.2, 0], fov: 47, roll: -1.5 * DEG }, // 05 process
  { pos: [-2.0, 1.0, 16.5], look: [0.7, 0.0, 0], fov: 46, roll: 2.0 * DEG }, // 06 projects (wide)
  { pos: [3.6, 2.2, 12.4], look: [0.0, 0.2, 0], fov: 45, roll: -1.2 * DEG }, // 07 reviews
  { pos: [-3.8, 0.8, 10.4], look: [0.3, 0.0, 0], fov: 44, roll: 1.4 * DEG }, // 08 socials
  { pos: [0.6, 0.3, 8.0], look: [0.0, 0.0, 0], fov: 41, roll: 0 }, // 09 contact
];

/* The keys strung onto centripetal Catmull-Rom splines: getPoint(m/(K-1))
   still lands EXACTLY on shot m, so the hold-move-hold cadence survives —
   but the road between shots is now a continuous curved dolly track instead
   of straight chords. Centripetal parameterisation = no overshoot loops. */
const CAM_PATH = new THREE.CatmullRomCurve3(
  CAM_KEYS.map((k) => new THREE.Vector3(k.pos[0], k.pos[1], k.pos[2])),
  false,
  "centripetal"
);
const LOOK_PATH = new THREE.CatmullRomCurve3(
  CAM_KEYS.map((k) => new THREE.Vector3(k.look[0], k.look[1], k.look[2])),
  false,
  "centripetal"
);

/* ──────────────────────────────────────────────────────────────────────
   CAMERA RIG
   The director. Reads scroll + pointer transiently from the store and lerps
   the camera through a slow orbit that pulls back and descends as the page
   travels — so the hero sits *inside* the sculpture and later sections drift
   it to the periphery, leaving the centre calm for text.
   ─────────────────────────────────────────────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(CAM_KEYS[0].look[0], CAM_KEYS[0].look[1], 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());
  const firstFrame = useRef(true);

  useFrame((state, dt) => {
    const { scroll, pointer, velocity, gallery, warp } = experience.getState();

    // Arrival shockwave decay — CameraRig is the single owner of the warp
    // lifecycle; every other consumer (post FX, morph field, nebula) just
    // reads the current value.
    if (warp > 0.001) experience.getState().setWarp(warp * Math.exp(-2.4 * dt));
    else if (warp !== 0) experience.getState().setWarp(0);

    // Global scroll → which two shots we're between, and how far.
    const K = CAM_KEYS.length;
    const g = Math.min(K - 1 - 1e-4, Math.max(0, scroll * (K - 1)));
    const i = Math.floor(g);
    const f = g - i;
    const e = smootherstep(f); // hold → move → hold cadence (reads as a cut)
    const a = CAM_KEYS[i];
    const b = CAM_KEYS[i + 1];

    // Fast scrolling pushes the camera back + widens the lens → dolly feel.
    const speed = Math.min(Math.abs(velocity) * 7, 1);
    const px = pointer.x * 0.8;
    const py = pointer.y * 0.5;

    // Ride the spline: the eased per-segment parameter maps straight onto
    // the curve, so shots still hold — but travel bends through space.
    const tGlobal = (i + e) / (K - 1);
    CAM_PATH.getPoint(tGlobal, tmpPos.current);
    LOOK_PATH.getPoint(tGlobal, tmpLook.current);

    // Inside the projects gallery the active project steps the camera
    // laterally (-1 → 1), like walking along a gallery wall. The damp below
    // turns each step into a smooth tracking move; zero everywhere else.
    tmpPos.current.x += px + gallery * 1.3;
    tmpPos.current.y += py;
    tmpPos.current.z += speed * 0.6;
    tmpLook.current.x += px * 0.4 + gallery * 0.45;
    tmpLook.current.y += py * 0.3;
    tmpLook.current.z = 0;

    // PORTRAIT-ASPECT CORRECTION. The shots above are composed for a wide
    // desktop frame; on a tall phone the same camera throws the subject off
    // the side and clips it. Below ~1:1, ease the lateral offset toward the
    // centre and pull back proportionally, so every shot stays framed.
    const aspect = camera.aspect || 1;
    if (aspect < 1) {
      const narrow = Math.min(1, (1 - aspect) / 0.5); // 0 at 1:1 → 1 at 0.5:1
      tmpPos.current.x *= 1 - 0.55 * narrow;
      tmpLook.current.x *= 1 - 0.55 * narrow;
      tmpPos.current.z += 3.4 * narrow;
    }

    // Handheld micro-drift — strongest when the scroll is at rest, so a held
    // shot still breathes like a camera on a shoulder rig instead of a tripod.
    const idle = 1 - speed;
    const t = state.clock.elapsedTime;

    // Warp arrival: a short handheld impact shake that dies with the wave.
    if (warp > 0.001) {
      tmpPos.current.x += Math.sin(t * 57.0) * 0.09 * warp;
      tmpPos.current.y += Math.cos(t * 63.0) * 0.07 * warp;
    }
    tmpPos.current.x += Math.sin(t * 0.26) * 0.07 * idle;
    tmpPos.current.y += Math.sin(t * 0.19 + 1.7) * 0.05 * idle;
    tmpLook.current.x += Math.sin(t * 0.16 + 0.6) * 0.035 * idle;
    tmpLook.current.y += Math.cos(t * 0.22 + 2.1) * 0.025 * idle;

    // Always glide, never snap — robust to scroll jumps (anchor nav). The
    // Canvas mounts the camera far up/back, so this settles it into the hero
    // shot as the preloader lifts. Cinematic entrance.
    damp3(camera.position, tmpPos.current, 0.5, dt);
    damp3(lookAt.current, tmpLook.current, 0.5, dt);
    camera.lookAt(lookAt.current);

    // fov breathes between shots + widens with speed; a warp arrival lands
    // with a wide-lens punch that settles back. Roll = the shot's dutch
    // angle + velocity banking (applied after lookAt → never accumulates).
    damp(camera, "fov", lerp(a.fov, b.fov, e) + speed * 3.0 + warp * 9, 0.3, dt);
    camera.updateProjectionMatrix();
    camera.rotation.z += lerp(a.roll, b.roll, e) + velocity * 0.06;

    if (firstFrame.current) {
      firstFrame.current = false;
      experience.getState().setReady(true);
    }
  });

  return null;
}

/* ──────────────────────────────────────────────────────────────────────
   THE CORE — chrome icosahedron wrapped in a glowing energy shell.
   The shell uses the hand-written Fresnel/displacement GLSL; the inner body
   is polished metal that mirrors the lightformers.
/* ── A vast, slow torus knot far behind — gives the scene a horizon. ── */
function BackdropKnot() {
  const ref = useRef(null);
  useFrame((_, dt) => {
    if (ref.current) {
      // A warp arrival kicks the horizon into a brief faster turn.
      const { warp } = experience.getState();
      ref.current.rotation.z += dt * (0.03 + warp * 0.22);
      ref.current.rotation.x += dt * 0.012;
    }
  });
  return (
    <mesh ref={ref} position={[0, -1, -9]} scale={1.4}>
      <torusKnotGeometry args={[3.2, 0.16, 180, 12]} />
      <meshStandardMaterial
        color="#0b1018"
        metalness={1}
        roughness={0.45}
        envMapIntensity={0.7}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

/* ── Lights + image-based reflections (no network HDRI — all procedural). ── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 6, 4]} intensity={1.3} color="#cdd6e6" />
      <pointLight position={[-7, 2, 3]} intensity={20} color="#5a7cff" distance={26} />
      <pointLight position={[7, -3, 2]} intensity={16} color="#f4f8ff" distance={24} />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 5, -5]} scale={[12, 5, 1]} color="#aab4c4" />
        <Lightformer intensity={1.4} position={[-6, 1, 2]} scale={[3, 8, 1]} color="#5a7cff" />
        <Lightformer intensity={1.8} position={[6, -2, 2]} scale={[4, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[0, -6, 3]} scale={[10, 3, 1]} color="#2b3550" />
      </Environment>
    </>
  );
}

/* ── Section accent — a coloured light that drifts toward each chapter's
   accent hue as you scroll, so the whole world moves with the journey. ── */
function SectionAccent() {
  const light = useRef(null);
  const colors = useMemo(() => sections.map((s) => new THREE.Color(s.accent)), []);
  const target = useMemo(() => new THREE.Color(colors[0]), [colors]);

  useFrame((_, dt) => {
    const { sectionIndex, scroll, accentOverride } = experience.getState();
    // Inside the projects gallery the active project's brand colour takes
    // over the world's accent light — each project dyes the whole scene.
    if (accentOverride) target.set(accentOverride);
    else target.copy(colors[Math.min(sectionIndex, colors.length - 1)] || colors[0]);
    if (light.current) {
      dampC(light.current.color, target, 0.7, dt);
      // Brightest for the hero / contact beats, dimmer through the middle;
      // the gallery dye gets an extra push so the tint clearly reads.
      const boost = accentOverride ? 4 : 0;
      damp(light.current, "intensity", 11 - Math.sin(scroll * Math.PI) * 5.5 + boost, 0.4, dt);
    }
  });

  return <pointLight ref={light} position={[0, 3, 6]} intensity={11} color={colors[0]} distance={24} />;
}

/* ── Post stack. Bloom + vignette everywhere; chromatic aberration on high. ── */
function Post({ quality }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);

  // The CA offset vector is shared with the effect by reference, so nudging
  // it here fringes the whole frame live: a strong spike on warp arrival,
  // a subtle one with scroll speed. Reads transiently — no re-renders.
  useFrame(() => {
    if (quality !== "high") return;
    const { warp, velocity } = experience.getState();
    const k =
      0.0006 + warp * 0.0042 + Math.min(Math.abs(velocity) * 2, 1) * 0.001;
    caOffset.set(k, k);
  });

  // multisampling is 0 on purpose: MSAA + a depth-sampling effect
  // (DepthOfField) makes the driver blit the MSAA depth/stencil buffer every
  // frame, which some GPUs reject (GL_INVALID_OPERATION: glBlitFramebuffer).
  // We drop MSAA and antialias in post with SMAA instead — same clean edges,
  // no depth blit, and DoF gets an honest single-sampled depth texture.
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* Cinematic depth — focus sits ~where the hero orb lives, so it stays
          crisp while the receding background + far particles soften. Subtle
          on purpose (small focal length / bokeh). High-tier only. */}
      {quality === "high" ? (
        <DepthOfField
          focusDistance={0.06}
          focalLength={0.02}
          bokehScale={2.2}
          height={480}
        />
      ) : null}
      <Bloom
        intensity={quality === "high" ? 0.62 : 0.42}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.55}
        mipmapBlur
        radius={0.7}
      />
      {quality === "high" ? (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={caOffset}
          radialModulation={false}
          modulationOffset={0}
        />
      ) : null}
      <Vignette eskil={false} offset={0.28} darkness={0.82} />
      <SMAA />
    </EffectComposer>
  );
}

/* ── The whole 3D scene graph. ── */
function Scene({ quality }) {
  return (
    <>
      <color attach="background" args={["#06080c"]} />
      <fogExp2 attach="fog" args={["#06080c", 0.042]} />

      <CameraRig />
      <Lighting />
      <SectionAccent />

      {/* The faceted gem + its orbiting shards is the single constant of the
          world — present on every tier and at every scroll depth. The old
          procedural Core sphere is gone: it used to swell in as the gem
          faded, so scrolling appeared to turn the geometric solid into a
          plain circle. Now only the particle formations change. */}
      <HeroModel />
      {/* Pointer repulsion is a MOUSE capability, not a quality tier. Tying
          it to `quality === "high"` meant the PerformanceMonitor stepping
          down mid-scroll killed the interaction permanently — it must
          survive that. Gated on a fine pointer instead (so touch skips it). */}
      <MorphField quality={quality} interactive={HAS_FINE_POINTER} />
      <BackdropKnot />
      <Architecture quality={quality} />
      <Nebula quality={quality} />
      <Comets quality={quality} />

      <Sparkles
        count={quality === "high" ? 45 : 22}
        scale={[16, 11, 10]}
        size={2.4}
        speed={0.25}
        opacity={0.4}
        color="#cdd6e6"
      />
      <Stars
        radius={90}
        depth={55}
        count={quality === "high" ? 2600 : 1200}
        factor={3.2}
        saturation={0}
        fade
        speed={0.5}
      />

      <Post quality={quality} />
      <AdaptiveDpr pixelated />
    </>
  );
}

/* Pumps drei's real asset-loading progress (GLB, textures — anything on the
   default loading manager) into the store so the preloader counter reflects
   what is actually happening instead of a synthetic ramp. */
function ProgressBridge() {
  const progress = useProgress((s) => s.progress);
  useEffect(() => {
    experience.getState().setLoadProgress(progress);
  }, [progress]);
  return null;
}

/* ──────────────────────────────────────────────────────────────────────
   CinematicWorld — the fixed, full-viewport Canvas that lives *behind* all
   page content. Pointer-events are off; the world is driven entirely through
   the store, so the DOM keeps every click and the canvas never steals focus.
   ─────────────────────────────────────────────────────────────────────── */
export default function CinematicWorld({ quality = "high" }) {
  const [frameloop, setFrameloop] = useState("always");
  // Live quality — starts at the device-profile tier, but a sustained frame
  // rate drop demotes high → mid at runtime (DOF/CA off, fewer particles,
  // lower DPR), so the 60fps promise holds on hardware the profile misjudged.
  const [live, setLive] = useState(quality);

  useEffect(() => setLive(quality), [quality]);

  // Publish quality into the store + freeze the render loop on a hidden tab.
  useEffect(() => {
    experience.getState().setQuality(live);
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [live]);

  const dprMax = live === "high" ? 1.8 : 1.3;

  return (
    <div
      className="fixed inset-0 -z-10"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <ProgressBridge />
      <Canvas
        frameloop={frameloop}
        dpr={[1, dprMax]}
        camera={{ position: [2, 4.5, 15], fov: 40, near: 0.1, far: 120 }}
        gl={{
          // AA is done in post (SMAA); the default framebuffer is never shown
          // when the EffectComposer is active, so MSAA here would just waste a
          // backbuffer. Keep depth for the DoF pass; no stencil.
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
        }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onDecline={() => setLive((c) => (c === "high" ? "mid" : c))}
          >
            <Scene quality={live} />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </div>
  );
}
