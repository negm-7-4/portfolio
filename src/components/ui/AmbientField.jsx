import { useEffect, useRef } from "react";
import { Gyro, WireCube, Diamond } from "./Shapes3D";

/**
 * AmbientField — a fixed, full-viewport layer of floating 3D wireframe
 * sculptures that sits behind all content. Each sculpture lives at a virtual
 * depth and parallaxes against the pointer and the scroll position, so the
 * whole page reads as one continuous 3D space the "camera" drifts through.
 *
 * Pure transforms on a single rAF loop (no per-frame React state), pointer
 * events disabled, and it backs off entirely under reduced-motion.
 */
const SHAPES = [
  { Comp: Gyro,     props: { size: 220, dur: 60, color: "rgba(150,170,210,0.16)" }, x: "8%",  y: "16%", depth: 0.9 },
  { Comp: WireCube, props: { size: 120, dur: 46, color: "rgba(150,170,210,0.14)" }, x: "82%", y: "22%", depth: 0.6 },
  { Comp: Diamond,  props: { size: 90,  dur: 38, color: "rgba(150,170,210,0.16)" }, x: "70%", y: "70%", depth: 1.0 },
  { Comp: WireCube, props: { size: 80,  dur: 52, color: "rgba(150,170,210,0.10)" }, x: "16%", y: "74%", depth: 0.4 },
  { Comp: Gyro,     props: { size: 150, dur: 70, color: "rgba(150,170,210,0.10)" }, x: "92%", y: "54%", depth: 0.5 },
];

export default function AmbientField() {
  const layerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const items = itemRefs.current.filter(Boolean);
    const mouse = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    let visible = !document.hidden;

    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onVis = () => { visible = !document.hidden; if (visible && !raf) loop(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) { cancelAnimationFrame(raf); raf = 0; return; }
      cur.x += (mouse.x - cur.x) * 0.05;
      cur.y += (mouse.y - cur.y) * 0.05;
      const sy = window.scrollY || 0;
      for (let i = 0; i < items.length; i++) {
        const d = SHAPES[i].depth;
        const tx = cur.x * d * 26;
        const ty = cur.y * d * 18 - sy * d * 0.03;
        items[i].style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          ref={(el) => (itemRefs.current[i] = el)}
          className="absolute will-change-transform"
          style={{ left: s.x, top: s.y }}
        >
          <s.Comp {...s.props} />
        </div>
      ))}
    </div>
  );
}
