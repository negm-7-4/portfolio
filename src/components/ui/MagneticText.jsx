import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useCursor } from "../../hooks/useCursor";

/**
 * Splits text into per-character motion spans. Each letter is pulled toward
 * the cursor when it's near. Heavy CPU optimisation here:
 *
 *   ① The cursor x/y motion values are sampled once per ANIMATION FRAME
 *     in a single shared rAF loop — not per-letter callbacks on every move.
 *     Without this, 12 letters × 2 callbacks × 60 fps = 1440 calls/sec.
 *
 *   ② `getBoundingClientRect()` is cached and only refreshed on resize /
 *     scroll — not on every cursor move. This avoids forced synchronous
 *     layout reflows in the hot path.
 *
 *   ③ When the cursor is far from the text (or hasn't moved since last
 *     frame), we skip work entirely.
 */
function Char({ ch, radius, strength, registerChar, idx }) {
  const ref = useRef(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const tr = useMotionValue(0);
  const sx = useSpring(tx, { stiffness: 220, damping: 18, mass: 0.5 });
  const sy = useSpring(ty, { stiffness: 220, damping: 18, mass: 0.5 });
  const sr = useSpring(tr, { stiffness: 220, damping: 18, mass: 0.5 });

  useEffect(() => {
    registerChar(idx, { ref, tx, ty, tr, radius, strength });
    return () => registerChar(idx, null);
  }, [registerChar, idx, radius, strength, tx, ty, tr]);

  if (ch === " ") return <span style={{ display: "inline-block", width: "0.32em" }} />;

  return (
    <motion.span
      ref={ref}
      style={{ display: "inline-block", x: sx, y: sy, rotate: sr, willChange: "transform" }}
    >
      {ch}
    </motion.span>
  );
}

export default function MagneticText({ text, className = "", radius = 140, strength = 22 }) {
  const c = useCursor();
  const charsRef = useRef([]);
  const rectsRef = useRef([]);

  const registerChar = (i, entry) => {
    if (!entry) { charsRef.current[i] = null; return; }
    charsRef.current[i] = entry;
  };

  // Cache each letter's center on mount, scroll, and resize.
  // This avoids touching the layout from the hot rAF loop.
  useLayoutEffect(() => {
    const measure = () => {
      rectsRef.current = charsRef.current.map((entry) => {
        if (!entry?.ref.current) return null;
        const r = entry.ref.current.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });
    };
    // First measurement after the layout is final
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  // Single shared rAF loop — drives all letters from one place.
  useEffect(() => {
    if (!c) return;
    let raf = 0;
    let prevMx = -1, prevMy = -1;

    const tick = () => {
      const mx = c.mx.get();
      const my = c.my.get();

      // Skip frame entirely if the cursor hasn't moved
      if (mx === prevMx && my === prevMy) {
        raf = requestAnimationFrame(tick);
        return;
      }
      prevMx = mx; prevMy = my;

      const entries = charsRef.current;
      const rects = rectsRef.current;
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const rect = rects[i];
        if (!entry || !rect) continue;

        const dx = mx - rect.cx;
        const dy = my - rect.cy;
        const d2 = dx * dx + dy * dy;
        const R = entry.radius;
        const R2 = R * R;

        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R) ** 2;
          entry.tx.set((dx / d) * entry.strength * f);
          entry.ty.set((dy / d) * entry.strength * f);
          entry.tr.set(-(dx / R) * 12 * f);
        } else if (entry.tx.get() !== 0) {
          entry.tx.set(0);
          entry.ty.set(0);
          entry.tr.set(0);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [c]);

  return (
    <span className={className} aria-label={text} style={{ display: "inline-block" }}>
      {text.split("").map((ch, i) => (
        <Char key={i} ch={ch} idx={i} radius={radius} strength={strength} registerChar={registerChar} />
      ))}
    </span>
  );
}
