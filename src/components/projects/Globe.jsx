import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { celebrate } from "../../lib/confetti";
import { projects } from "../../data/content";

const N = projects.length;

/* Convert a hex string to a normalized THREE.Color */
const toColor = (hex) => new THREE.Color(hex);

/**
 * A digital, rotating globe rendered with raw Three.js. Half of it sits below
 * the fold; as you scroll the section the globe spins and a different project
 * marker rotates to the front. The active project's info crossfades in.
 *
 * Perf: capped DPR, render loop paused when off-screen, full GPU cleanup on
 * unmount, and a static fallback when reduced-motion is requested.
 */
export default function Globe() {
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Scroll progress across the whole track drives both rotation + active idx
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const targetRotRef = useRef(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(N - 1, Math.max(0, Math.floor(v * N - 1e-4)));
    if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx); }
    // longitude of marker i = i/N * 2π → rotate globe so it faces the camera (+Z)
    targetRotRef.current = -(idx / N) * Math.PI * 2;
  });

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Globe group ──────────────────────────────────────────────
    const globe = new THREE.Group();
    // pushed down so only the top ~half shows above the fold
    globe.position.y = -1.7;
    globe.rotation.z = 0.35; // tilt like a real axis
    scene.add(globe);

    const R = 2.4;

    // 1) point-cloud surface
    const ptCount = 2600;
    const ptPos = new Float32Array(ptCount * 3);
    for (let i = 0; i < ptCount; i++) {
      // even distribution via the golden-spiral method
      const y = 1 - (i / (ptCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      ptPos[i * 3] = Math.cos(phi) * r * R;
      ptPos[i * 3 + 1] = y * R;
      ptPos[i * 3 + 2] = Math.sin(phi) * r * R;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    const ptMat = new THREE.PointsMaterial({ color: 0x9fb0c4, size: 0.022, transparent: true, opacity: 0.85 });
    const points = new THREE.Points(ptGeo, ptMat);
    globe.add(points);

    // 2) faint wireframe shell for structure
    const wireGeo = new THREE.SphereGeometry(R * 0.995, 24, 18);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(wireGeo),
      new THREE.LineBasicMaterial({ color: 0x4a5566, transparent: true, opacity: 0.18 })
    );
    globe.add(wire);

    // 3) glowing atmosphere
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.06, 32, 32),
      new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: toColor("#7fa6d8") } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
        fragmentShader: `varying vec3 vN; uniform vec3 uColor; void main(){ float i = pow(0.72 - dot(vN, vec3(0.,0.,1.)), 3.0); gl_FragColor = vec4(uColor, clamp(i,0.0,1.0)*0.9);} `,
      })
    );
    globe.add(atmo);

    // 4) one glowing marker per project, around a tilted ring
    const markers = projects.map((p, i) => {
      const lon = (i / N) * Math.PI * 2;
      const lat = (i % 2 ? 0.32 : -0.18); // small latitude wobble
      const x = R * Math.cos(lat) * Math.sin(lon);
      const y = R * Math.sin(lat);
      const z = R * Math.cos(lat) * Math.cos(lon);
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshBasicMaterial({ color: toColor(p.color) })
      );
      m.position.set(x, y, z);
      // a thin "pin" line from the surface
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.16, 24),
        new THREE.MeshBasicMaterial({ color: toColor(p.color), transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      halo.position.copy(m.position);
      halo.lookAt(0, 0, 0);
      globe.add(m, halo);
      return { m, halo, baseScale: 1 };
    });

    // ── starfield behind ─────────────────────────────────────────
    const starCount = 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      starPos[i * 3 + 2] = -5 - Math.random() * 12;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.5 }));
    scene.add(stars);

    // ── sizing ───────────────────────────────────────────────────
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── render loop (paused when off-screen) ─────────────────────
    let raf = 0, visible = true, t = 0;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) loop();
    }, { threshold: 0 });
    io.observe(canvas);

    function loop() {
      raf = requestAnimationFrame(loop);
      t += 0.005;
      // ease current rotation toward the scroll target + a gentle constant drift
      const target = targetRotRef.current + (reduce ? 0 : t * 0.12);
      globe.rotation.y += (target - globe.rotation.y) * 0.06;
      stars.rotation.y += 0.0004;

      // pulse the active marker
      const a = activeRef.current;
      markers.forEach((mk, i) => {
        const s = i === a ? 1.6 + Math.sin(t * 6) * 0.25 : 1;
        mk.m.scale.setScalar(s);
        mk.halo.scale.setScalar(i === a ? 1.4 : 1);
        mk.halo.material.opacity = i === a ? 0.85 : 0.35;
      });

      renderer.render(scene, camera);
      if (!visible) { cancelAnimationFrame(raf); raf = 0; }
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
    };
  }, []);

  const p = projects[active];
  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / N);
    if (window.__lenis) window.__lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={trackRef} className="relative" style={{ height: `${N * 78}vh` }}>
      {/* sticky viewport */}
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* canvas — fills the viewport, globe sits low so ~half shows */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

        {/* active project info, top-left */}
        <div className="relative z-10 mx-auto flex w-[90%] max-w-6xl flex-1 items-start pt-10 md:pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg"
            >
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.34em]" style={{ color: `${p.color}cc` }}>
                ({String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}) · {p.category}
              </span>
              <h3 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tight text-white md:text-6xl">
                {p.title}
              </h3>
              <p className="mt-2 text-sm italic text-white/45">{p.tagline}</p>
              <p className="mt-4 max-w-md text-[13.5px] leading-[1.7] text-white/55">{p.desc}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.tech.map((tch) => (
                  <li key={tch} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-wide text-white/65 backdrop-blur-md">
                    {tch}
                  </li>
                ))}
              </ul>
              <a
                href={p.github} target="_blank" rel="noopener noreferrer"
                data-cursor="hover" data-cursor-text="Open"
                onClick={(e) => celebrate(e.clientX, e.clientY, p.color)}
                className="group/cta mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white"
              >
                <span>View on GitHub</span>
                <span className="relative block h-px w-12 overflow-hidden bg-white/30">
                  <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover/cta:scale-x-100" />
                </span>
                <span>↗</span>
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* dot navigation */}
        <div className="relative z-10 mb-8 flex items-center justify-center gap-3">
          {projects.map((pr, i) => (
            <button
              key={pr.title}
              onClick={() => goTo(i)}
              data-cursor="hover"
              aria-label={`Project ${i + 1}`}
              className="group flex items-center"
            >
              <motion.span
                animate={{ width: active === i ? 30 : 9, backgroundColor: active === i ? pr.color : "rgba(255,255,255,0.22)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block h-[3px] rounded-full"
              />
            </button>
          ))}
        </div>

        {/* hint */}
        <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/30">
          Scroll to orbit ↻
        </span>
      </div>
    </div>
  );
}
