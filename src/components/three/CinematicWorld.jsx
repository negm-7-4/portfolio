import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  Float,
  Sparkles,
  Stars,
  AdaptiveDpr,
  useProgress,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  DepthOfField,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { damp3, damp, dampC } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";
import { sections } from "../../data/sections";
import { FresnelMaterial } from "./materials/FresnelMaterial"; // registers <fresnelMaterial>
import MorphField from "./MorphField";
import HeroModel from "./HeroModel";
import Architecture from "./Architecture";

/* eslint-disable react/no-unknown-property */

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const smootherstep = (t) => {
  t = Math.min(1, Math.max(0, t));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const lerp = (a, b, t) => a + (b - a) * t;

/* One composed camera shot per chapter (pos + lookAt + fov). Scroll eases
   between consecutive keys, so the journey reads as deliberate cinematic
   cuts rather than one continuous spin. Tuned so the hero + contact beats sit
   close/centred and the text-heavy middle pulls WIDE (centre left calm). */
const CAM_KEYS = [
  { pos: [2.8, 0.6, 9.8], look: [-2.1, 0.2, 0], fov: 42 }, // 00 hero
  { pos: [-3.2, 1.4, 10.6], look: [0.4, 0.0, 0], fov: 45 }, // 01 about
  { pos: [4.8, 2.6, 11.4], look: [0.0, 0.4, 0], fov: 47 }, // 02 services
  { pos: [-5.4, 0.4, 12.2], look: [0.2, -0.2, 0], fov: 49 }, // 03 skills
  { pos: [0.0, 5.0, 12.8], look: [0.0, -0.8, 0], fov: 49 }, // 04 journey
  { pos: [5.8, -1.8, 12.0], look: [-0.5, 0.2, 0], fov: 47 }, // 05 process
  { pos: [-2.0, 1.0, 16.5], look: [0.7, 0.0, 0], fov: 46 }, // 06 projects (wide)
  { pos: [3.6, 2.2, 12.4], look: [0.0, 0.2, 0], fov: 45 }, // 07 reviews
  { pos: [-3.8, 0.8, 10.4], look: [0.3, 0.0, 0], fov: 44 }, // 08 socials
  { pos: [0.6, 0.3, 8.0], look: [0.0, 0.0, 0], fov: 41 }, // 09 contact
];

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
    const { scroll, pointer, velocity, gallery } = experience.getState();

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

    // Inside the projects gallery the active project steps the camera
    // laterally (-1 → 1), like walking along a gallery wall. The damp below
    // turns each step into a smooth tracking move; zero everywhere else.
    tmpPos.current.set(
      lerp(a.pos[0], b.pos[0], e) + px + gallery * 1.3,
      lerp(a.pos[1], b.pos[1], e) + py,
      lerp(a.pos[2], b.pos[2], e) + speed * 0.6
    );
    tmpLook.current.set(
      lerp(a.look[0], b.look[0], e) + px * 0.4 + gallery * 0.45,
      lerp(a.look[1], b.look[1], e) + py * 0.3,
      0
    );

    // Handheld micro-drift — strongest when the scroll is at rest, so a held
    // shot still breathes like a camera on a shoulder rig instead of a tripod.
    const idle = 1 - speed;
    const t = state.clock.elapsedTime;
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

    // fov breathes between shots + widens with speed; a faint roll banks the
    // camera into fast travel (applied after lookAt, so it never accumulates).
    damp(camera, "fov", lerp(a.fov, b.fov, e) + speed * 3.0, 0.3, dt);
    camera.updateProjectionMatrix();
    camera.rotation.z += velocity * 0.06;

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
   ─────────────────────────────────────────────────────────────────────── */
function Core({ quality, heroFade }) {
  const group = useRef(null);
  const shell = useRef(null);
  const spinRef = useRef(0.08);
  const detail = quality === "high" ? 5 : 4;

  useFrame((state, dt) => {
    const { velocity, scroll, hovered } = experience.getState();
    // Hover energises the orb — faster spin + brighter, rippling shell.
    const spinTarget = hovered ? 0.24 : 0.08;
    spinRef.current += (spinTarget - spinRef.current) * Math.min(1, dt * 4);
    if (group.current) {
      group.current.rotation.y += dt * spinRef.current;
      group.current.rotation.x += dt * 0.02;
      // On high-tier the GLB hero model owns the top of the page, so the
      // procedural core shrinks away at the hero beat and swells back for the
      // body + contact outro. On mid-tier (no model) it stays full size.
      const target = heroFade ? 0.24 + 0.76 * smoothstep(0.08, 0.28, scroll) : 1;
      const cur = group.current.scale.x;
      group.current.scale.setScalar(cur + (target - cur) * Math.min(1, dt * 3));
    }
    if (shell.current) {
      shell.current.uTime = state.clock.elapsedTime;
      // Scroll speed ripples the surface; hover adds a steady pulse.
      const pulse = Math.min(Math.abs(velocity) * 12, 1);
      damp(shell.current, "uScrollPulse", Math.max(pulse, hovered ? 0.6 : 0), 0.25, dt);
      // Calm the glow through the text-heavy middle so copy stays readable;
      // hover lifts it back up as a reward for interacting.
      const base = 1 - Math.sin(scroll * Math.PI) * 0.5;
      damp(shell.current, "uOpacity", base + (hovered ? 0.4 : 0), 0.3, dt);
      damp(shell.current, "uDisplace", hovered ? 0.2 : 0.14, 0.35, dt);
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7}>
      <group ref={group}>
        {/* Polished metal body — reflects the environment lightformers. */}
        <mesh>
          <icosahedronGeometry args={[1.55, detail]} />
          <meshStandardMaterial
            color="#0e141d"
            metalness={1}
            roughness={0.22}
            envMapIntensity={1.35}
          />
        </mesh>
        {/* Energy shell — GLSL fresnel + displacement, glows into the bloom. */}
        <mesh scale={1.04}>
          <icosahedronGeometry args={[1.55, detail]} />
          <fresnelMaterial
            ref={shell}
            transparent
            depthWrite={false}
            uFresnelPower={2.3}
            uDisplace={0.14}
            uFreq={1.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ── A vast, slow torus knot far behind — gives the scene a horizon. ── */
function BackdropKnot() {
  const ref = useRef(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.z += dt * 0.03;
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
  return (
    <EffectComposer multisampling={quality === "high" ? 4 : 0} enableNormalPass={false}>
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
    </EffectComposer>
  );
}

/* ── The whole 3D scene graph. ── */
function Scene({ quality }) {
  const heroModel = quality === "high";
  return (
    <>
      <color attach="background" args={["#06080c"]} />
      <fogExp2 attach="fog" args={["#06080c", 0.042]} />

      <CameraRig />
      <Lighting />
      <SectionAccent />

      <Core quality={quality} heroFade={heroModel} />
      {heroModel && <HeroModel />}
      <MorphField quality={quality} />
      <BackdropKnot />
      <Architecture quality={quality} />

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

  // Publish quality into the store + freeze the render loop on a hidden tab.
  useEffect(() => {
    experience.getState().setQuality(quality);
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [quality]);

  const dprMax = quality === "high" ? 1.8 : 1.3;

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
          antialias: quality === "high",
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
        }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <Scene quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
