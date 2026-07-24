import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { AnimatePresence, motion, useScroll } from "motion/react";
import * as THREE from "three";

import { projects } from "../../../data/content";
import { EASE_OUT } from "../../../lib/motion";
import useMediaQuery from "../../../hooks/useMediaQuery";
import useWorldDye from "../useWorldDye";
import DescriptionLines from "../DescriptionLines";
import TechBadges from "../TechBadges";
import ShowcaseCta from "../ShowcaseCta";
import ProjectVisual from "../ProjectVisual";
import { destinations, formatCoords } from "./destinations";
import { globeState } from "./globeState";

/* eslint-disable react/no-unknown-property */

/**
 * ── GLOBE SHOWCASE — the signature mode ───────────────────────────────
 * A realistic WebGL Earth holds the left of the frame inside a pinned
 * corridor; scrolling flies the camera between one cinematic destination
 * per project. Day/night lighting, ocean sun-glint, city lights and a
 * breathing atmosphere all travel with you; the project panel on the
 * right swaps in sync and the persistent world behind is dyed by the
 * active project (useWorldDye).
 *
 * The globe never rotates under a rAF free-run — its orientation is a
 * quaternion slerp driven by `globeState.x`, which the DOM writes from
 * scroll. Camera pulls back mid-flight and settles in on arrival.
 */

const R = 2; // globe radius (world units)
const CAM_Z = 6.2; // resting camera distance
const TAIL = 0.88; // progress 0 → TAIL flies all legs; the rest holds the last stop

/* lat/lng → point on the three.js sphere that matches equirect textures. */
function latLngToVec3(lat, lng, r) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    -r * Math.cos(la) * Math.cos(lo),
    r * Math.sin(la),
    r * Math.cos(la) * Math.sin(lo)
  );
}

/* Sun az/el (degrees, viewer-relative — +Z faces the camera) → direction. */
function sunVec(az, el) {
  const a = THREE.MathUtils.degToRad(az);
  const e = THREE.MathUtils.degToRad(el);
  return new THREE.Vector3(
    Math.sin(a) * Math.cos(e),
    Math.sin(e),
    Math.cos(a) * Math.cos(e)
  ).normalize();
}

const smoothstep01 = (t) => {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
};

/* ── Earth surface — day/night terminator, city lights, ocean glint. ── */
const EARTH_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uSpec;
  uniform vec3 uSunDir;
  uniform vec3 uAtmo;

  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);

    float sun = dot(N, uSunDir);
    float dayAmt = smoothstep(-0.15, 0.3, sun);

    vec3 day = texture2D(uDay, vUv).rgb;
    // City lights bloom out of the dark side and dissolve under daylight.
    vec3 night = texture2D(uNight, vUv).rgb * 1.6 * (1.0 - dayAmt);

    vec3 col = day * (0.1 + 0.9 * dayAmt) + night;

    // Sun glint on water only (specular map masks the oceans).
    float specMask = texture2D(uSpec, vUv).r;
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 42.0) * specMask * dayAmt;
    col += vec3(1.0, 0.95, 0.85) * spec * 0.55;

    // Atmospheric rim — stronger on the lit limb.
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
    col += uAtmo * rim * (0.22 + 0.78 * dayAmt);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ── Outer atmosphere glow (backside shell, additive). ── */
const ATMO_VERT = /* glsl */ `
  varying vec3 vNormalV;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormalV;
  void main() {
    float intensity = pow(0.62 - dot(normalize(vNormalV), vec3(0.0, 0.0, 1.0)), 4.0);
    gl_FragColor = vec4(uColor, 1.0) * max(intensity, 0.0);
    #include <colorspace_fragment>
  }
`;

function GlobeScene({ compact }) {
  const globe = useRef(null);
  const clouds = useRef(null);
  const light = useRef(null);
  const ringRefs = useRef([]);

  const center = useMemo(
    () => new THREE.Vector3(compact ? 0 : -1.15, compact ? 0.35 : 0, 0),
    [compact]
  );
  // On a tall/narrow phone the horizontal FOV is the tight one, so pull the
  // camera well back to keep the WHOLE globe in frame instead of cropping it.
  const camZ = compact ? 10.8 : CAM_Z;
  // …and aim the camera below the globe so it renders in the upper part of
  // the screen, fully clear of the bottom project sheet.
  const lookTarget = useMemo(
    () => (compact ? center.clone().setY(center.y - 1.9) : center),
    [compact, center]
  );

  const maps = useTexture({
    day: "/textures/earth/earth_day.jpg",
    night: "/textures/earth/earth_night.png",
    spec: "/textures/earth/earth_specular.jpg",
    clouds: "/textures/earth/earth_clouds.png",
  });

  useMemo(() => {
    maps.day.colorSpace = THREE.SRGBColorSpace;
    maps.night.colorSpace = THREE.SRGBColorSpace;
    maps.day.anisotropy = 4;
    maps.night.anisotropy = 4;
  }, [maps]);

  const earthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uDay: { value: maps.day },
          uNight: { value: maps.night },
          uSpec: { value: maps.spec },
          uSunDir: { value: sunVec(destinations[0].sun.az, destinations[0].sun.el) },
          uAtmo: { value: new THREE.Color("#4a6fb5") },
        },
        vertexShader: EARTH_VERT,
        fragmentShader: EARTH_FRAG,
      }),
    [maps]
  );

  const atmoMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#5a7cff") } },
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      earthMaterial.dispose();
      atmoMaterial.dispose();
    };
  }, [earthMaterial, atmoMaterial]);

  /* Per-destination flight data, computed once:
     the quaternion that rotates that city into the camera's gaze, the sun
     direction it arrives to, and the surface marker's local transform. */
  const flight = useMemo(() => {
    const face = new THREE.Vector3(0, 0, camZ).sub(center).normalize();
    return destinations.map((d) => {
      const p = latLngToVec3(d.lat, d.lng, 1).normalize();
      return {
        q: new THREE.Quaternion().setFromUnitVectors(p, face),
        sun: sunVec(d.sun.az, d.sun.el),
        markerPos: latLngToVec3(d.lat, d.lng, R * 1.004),
        markerQ: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          p
        ),
      };
    });
  }, [center, camZ]);

  const tmpQ = useRef(new THREE.Quaternion());
  const tmpSun = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const { x, pointer } = globeState;
    const n = destinations.length;
    const i = Math.min(n - 1, Math.floor(x));
    const j = Math.min(n - 1, i + 1);
    const f = x - i;
    const e = smoothstep01(f);
    const k = 1 - Math.exp(-5 * dt); // frame-rate independent smoothing

    // Fly: slerp between the two legs, then glide the globe toward it.
    if (globe.current) {
      tmpQ.current.slerpQuaternions(flight[i].q, flight[j].q, e);
      globe.current.quaternion.slerp(tmpQ.current, k);
    }

    // The sun travels with the leg — each city gets its own hour of day.
    tmpSun.current.copy(flight[i].sun).lerp(flight[j].sun, e).normalize();
    const sunU = earthMaterial.uniforms.uSunDir.value;
    sunU.lerp(tmpSun.current, k).normalize();
    if (light.current) {
      light.current.position.copy(sunU).multiplyScalar(7).add(center);
    }

    // Camera: pulls back mid-flight, breathes with the pointer, settles in.
    const transit = Math.sin(Math.min(1, Math.max(0, f)) * Math.PI);
    const cam = state.camera;
    cam.position.x += (pointer.x * 0.28 - cam.position.x) * k;
    cam.position.y += (pointer.y * 0.2 - cam.position.y) * k;
    cam.position.z += (camZ + transit * 1.15 - cam.position.z) * k;
    cam.lookAt(lookTarget);

    if (clouds.current) clouds.current.rotation.y += dt * 0.012;

    // Markers: the active city's ring pulses; the others sit quiet.
    const t = state.clock.elapsedTime;
    const active = Math.round(Math.min(n - 1, x));
    for (let m = 0; m < ringRefs.current.length; m++) {
      const ring = ringRefs.current[m];
      if (!ring) continue;
      const isActive = m === active;
      const pulse = 1 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.6));
      const s = isActive ? pulse : 1;
      ring.scale.set(s, s, s);
      ring.material.opacity += ((isActive ? 0.85 : 0.14) - ring.material.opacity) * k;
    }
  });

  return (
    <group position={center}>
      {/* Sun — drives the cloud layer's terminator to match the shader. */}
      <directionalLight ref={light} intensity={2.1} color="#fff4e0" />
      <ambientLight intensity={0.18} />

      <group ref={globe}>
        {/* Earth */}
        <mesh material={earthMaterial}>
          <sphereGeometry args={[R, 96, 96]} />
        </mesh>

        {/* Destination markers — ride the globe's rotation. */}
        {flight.map((f, i) => (
          <group key={i} position={f.markerPos} quaternion={f.markerQ}>
            <mesh>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshBasicMaterial color={projects[i]?.color || "#ffffff"} />
            </mesh>
            <mesh ref={(el) => (ringRefs.current[i] = el)}>
              <ringGeometry args={[0.05, 0.062, 32]} />
              <meshBasicMaterial
                color={projects[i]?.color || "#ffffff"}
                transparent
                opacity={0.14}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Cloud layer — independent slow drift over the surface. Additive so
          the texture's black sky vanishes whether or not it carries alpha. */}
      <mesh ref={clouds} scale={1.012}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshLambertMaterial
          map={maps.clouds}
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere shell */}
      <mesh material={atmoMaterial} scale={1.16}>
        <sphereGeometry args={[R, 48, 48]} />
      </mesh>
    </group>
  );
}

/* Pause the flight loop while the showcase is off screen. */
function FrameGate({ inView }) {
  const { invalidate } = useThree();
  useEffect(() => {
    if (inView) invalidate();
  }, [inView, invalidate]);
  return null;
}

/* Never let a texture / WebGL failure take down the section — the HUD and
   project panel keep working over the persistent world behind. */
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

/* ── HUD: destination readout (top-left). ── */
function DestinationHud({ active }) {
  const d = destinations[active];
  return (
    <div className="pointer-events-none absolute left-[5%] top-24 z-10 md:top-28">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <span className="block font-display text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
            Destination {String(active + 1).padStart(2, "0")} /{" "}
            {String(destinations.length).padStart(2, "0")}
          </span>
          <span className="mt-2 block font-display text-xl font-bold tracking-tight text-white md:text-2xl">
            {d.name}
          </span>
          <span className="mt-1 block font-mono text-[10px] tracking-[0.2em] text-white/55">
            {formatCoords(d.lat, d.lng)}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── The per-project panel (right on desktop, bottom sheet on mobile). ── */
function ProjectPanel({ active }) {
  const p = projects[active];
  if (!p) return null;
  const num = String(active + 1).padStart(2, "0");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 md:inset-x-auto md:bottom-auto md:right-[6%] md:top-1/2 md:w-[40%] md:max-w-xl md:-translate-y-1/2">
      <div className="pointer-events-auto bg-gradient-to-t from-[#06080c]/90 via-[#06080c]/60 to-transparent p-6 pt-16 md:bg-none md:p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.22 } }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            {/* Postcard from the destination — the project's artwork. */}
            <motion.div
              initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
              animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.76, 0, 0.24, 1] }}
              className="group relative mb-5 h-28 overflow-hidden rounded-xl border border-white/10 sm:h-32 md:h-40 lg:h-48"
              data-cursor="hover"
            >
              <ProjectVisual
                project={p}
                imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* readability grade + accent wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(160deg, transparent 55%, ${p.color}1f 100%), linear-gradient(180deg, transparent 60%, rgba(6,8,12,0.45) 100%)`,
                }}
              />
              {/* postcard stamp — coordinates chip */}
              <span className="absolute bottom-2.5 right-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] text-white/60 backdrop-blur-sm">
                {formatCoords(destinations[active].lat, destinations[active].lng)}
              </span>
            </motion.div>

            <span
              className="block font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: `${p.color}cc` }}
            >
              ( {num} / {String(projects.length).padStart(2, "0")} ) · {p.category}
            </span>

            <h3 className="mt-3 font-display text-3xl font-bold leading-[0.95] tracking-tight text-white md:text-5xl">
              {p.title}
            </h3>

            <p
              className="mt-2 text-[12px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: `${p.color}99` }}
            >
              {p.tagline}
            </p>

            <DescriptionLines
              text={p.desc}
              delay={0.18}
              className="mt-5 max-w-md text-[14px] leading-[1.7] text-white/55"
            />

            <div className="mt-6">
              <TechBadges tech={p.tech} accent={p.color} delay={0.38} />
            </div>

            <div className="mt-7">
              <ShowcaseCta project={p} delay={0.5} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GlobeShowcase() {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const activeRef = useRef(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const n = destinations.length;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "10% 0px 10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useWorldDye(active, inView);

  /* Scroll across the pinned corridor → flight position. */
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      globeState.progress = p;
      const x = Math.min(n - 1, (p / TAIL) * (n - 1));
      globeState.x = x;
      const a = Math.round(x);
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActive(a);
      }
    });
    return unsub;
  }, [scrollYProgress, n]);

  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    globeState.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    globeState.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const flyTo = (i) => {
    const el = wrapRef.current;
    if (!el) return;
    const top =
      el.getBoundingClientRect().top +
      window.scrollY +
      (i / (n - 1)) * TAIL * (el.offsetHeight - window.innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.6 });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: `${(n + 1) * 100}vh` }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        onPointerMove={onPointerMove}
      >
        {/* ── The Earth ── */}
        <div className="absolute inset-0" aria-hidden>
          <Boundary>
            <Canvas
              frameloop={inView ? "always" : "never"}
              dpr={[1, 1.6]}
              camera={{ position: [0, 0, isDesktop ? CAM_Z : 10.8], fov: isDesktop ? 42 : 44, near: 0.1, far: 60 }}
              gl={{
                antialias: true,
                alpha: true,
                stencil: false,
                powerPreference: "high-performance",
              }}
            >
              <Suspense fallback={null}>
                <GlobeScene compact={!isDesktop} />
              </Suspense>
              <FrameGate inView={inView} />
            </Canvas>
          </Boundary>
        </div>

        <DestinationHud active={active} />
        <ProjectPanel active={active} />

        {/* ── Flight rail — one stop per project. ── */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          {projects.map((p, i) => (
            <button
              key={p.title}
              onClick={() => flyTo(i)}
              data-cursor="hover"
              aria-label={`Fly to ${destinations[i]?.name} — ${p.title}`}
              className="group flex items-center gap-2 p-1"
            >
              <motion.span
                animate={{
                  width: active === i ? 30 : 8,
                  backgroundColor: active === i ? p.color : "rgba(255,255,255,0.22)",
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="block h-[2px] rounded-full"
              />
            </button>
          ))}
        </div>

        {/* ── Scroll cue — fades once the journey starts. ── */}
        <motion.div
          className="pointer-events-none absolute bottom-8 left-[5%] z-10 hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/55 md:flex"
          animate={{ opacity: active === 0 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            ▾
          </motion.span>
          Scroll to fly
        </motion.div>
      </div>
    </div>
  );
}
