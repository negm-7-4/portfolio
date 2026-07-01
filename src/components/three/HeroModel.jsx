import { Component, Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

import { experience } from "../../store/experience";

/* eslint-disable react/no-unknown-property */

const MODEL_URL = "/models/robot.glb";
const FIT = 2.0; // target size (largest dimension) in world units
const BASE_Y = 0; // resting height (a gentle float rides on top of this)
// robot.glb (three.js RobotExpressive) ships 14 clips. names[0] is "Dance" —
// playing it is what tilted the mech mid-pose. "Idle" is the upright resting
// loop we actually want.
const IDLE_MATCH = /idle/i;
// Retint the warm orange "Main" material to the site's cool steel so the mech
// belongs to the world instead of clashing with it.
const TINT_STEEL = "#9aa6bd";

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ──────────────────────────────────────────────────────────────────────
   HERO MODEL — a real glTF asset as the hero centrepiece.

   It is the STAR at the top of the page (full size, slowly turning, lit by
   the world's environment + section light), then scales away as you scroll
   so the morphing field + metal core carry the rest of the journey. Loads
   only on high-tier hardware; mid/touch keep the procedural core so mobile
   never pays the model's weight.
   ─────────────────────────────────────────────────────────────────────── */
function Model() {
  const group = useRef(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, group);

  // Normalise once: centre at the origin, fit to a known size, and lift the
  // material reflections so it catches the lightformers like polished tech.
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = FIT / maxDim;
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -center.y * s, -center.z * s);
    scene.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.castShadow = false;
        o.receiveShadow = false;
        const m = o.material;
        if (m) {
          // Give the matte export a subtle brushed-metal catch so the
          // lightformers read on it, and pull the warm accent into the palette.
          m.envMapIntensity = 1.3;
          if (typeof m.roughness === "number") m.roughness = Math.min(m.roughness, 0.55);
          if (typeof m.metalness === "number") m.metalness = Math.max(m.metalness, 0.25);
          if (TINT_STEEL && m.name === "Main" && m.color) m.color.set(TINT_STEEL);
          m.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  // Play the upright "Idle" loop (never names[0] === "Dance"), gently slowed.
  useEffect(() => {
    const clip =
      names.find((n) => IDLE_MATCH.test(n)) ||
      names.find((n) => /standing/i.test(n)) ||
      names[0];
    if (clip && actions[clip]) {
      actions[clip].reset().fadeIn(0.6).play();
      actions[clip].timeScale = 0.85;
    }
    return () => {
      if (clip && actions[clip]) actions[clip].fadeOut(0.3);
    };
  }, [actions, names]);

  useFrame((state, dt) => {
    const { scroll, pointer, hovered } = experience.getState();
    const g = group.current;
    if (!g) return;

    // Present only at the hero beat; scales away into the body.
    const w = 1 - smoothstep(0.03, 0.18, scroll);
    const cur = g.scale.x;
    g.scale.setScalar(cur + (w - cur) * Math.min(1, dt * 3));

    // Slow signature turn (faster on hover) with gentle pointer parallax; the
    // tilt axes settle back to level so the mech always reads upright.
    const spin = hovered ? 0.4 : 0.14;
    g.rotation.y += dt * spin;
    g.rotation.x += (pointer.y * 0.1 - g.rotation.x) * Math.min(1, dt * 3);
    g.rotation.z += (pointer.x * 0.06 - g.rotation.z) * Math.min(1, dt * 3);
    g.position.y = BASE_Y + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
  });

  // Sits slightly forward of the particle sphere (which is centred at the
  // origin) so the mech reads as emerging from the field, not buried in it.
  return (
    <group ref={group} scale={0.001} position={[0.3, BASE_Y, 2.3]}>
      <primitive object={scene} />
    </group>
  );
}

/* Never let a failed model load take down the whole canvas. */
class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroModel() {
  return (
    <Boundary>
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Boundary>
  );
}
