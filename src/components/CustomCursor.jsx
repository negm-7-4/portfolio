import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Dot + magnetic ring + 6 trailing echoes that lag with increasing delay.
 * The ring inflates / changes border on interactive targets, and the
 * inner dot rotates in a smooth idle spin.
 */
export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Trailing echoes — different spring stiffness for each ring
  const t1x = useSpring(x, { stiffness: 380, damping: 30, mass: 0.4 });
  const t1y = useSpring(y, { stiffness: 380, damping: 30, mass: 0.4 });
  const t2x = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const t2y = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });
  const t3x = useSpring(x, { stiffness: 180, damping: 26, mass: 0.8 });
  const t3y = useSpring(y, { stiffness: 180, damping: 26, mass: 0.8 });
  const t4x = useSpring(x, { stiffness: 110, damping: 24, mass: 1.0 });
  const t4y = useSpring(y, { stiffness: 110, damping: 24, mass: 1.0 });

  const [hidden, setHidden] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [text, setText] = useState(null); // e.g. "View" on certain targets

  const size = useSpring(34, { stiffness: 300, damping: 22 });
  const opacity = useSpring(0.6, { stiffness: 300, damping: 22 });
  const dotScale = useSpring(1, { stiffness: 300, damping: 22 });
  const ringScale = useSpring(1, { stiffness: 280, damping: 18 });
  const rotate = useMotionValue(0);

  // Continuous idle rotation on the inner dot
  useEffect(() => {
    let raf, last = performance.now();
    const spin = (t) => {
      const dt = t - last; last = t;
      rotate.set(rotate.get() + dt * 0.04);
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, [rotate]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setHidden(true);
      return;
    }

    // Cursor x/y update on every move (cheap — just motion value sets).
    // Hover-target detection runs at most once per animation frame and
    // only when the cursor is over a NEW element. closest() + getAttribute()
    // are not cheap, so we don't want them on every pointermove.
    let lastTarget = null;
    let rafScheduled = false;
    let pendingEvent = null;
    const detectHover = () => {
      rafScheduled = false;
      const e = pendingEvent;
      pendingEvent = null;
      if (!e) return;
      const t = e.target;
      if (t === lastTarget) return;
      lastTarget = t;
      const hit = t?.closest?.("[data-cursor], a, button, input, textarea, [role='button']");
      const isHover = !!hit;
      const cursorText = hit?.getAttribute?.("data-cursor-text") || null;
      setHovering(isHover);
      setText(cursorText);
      size.set(isHover ? 60 : 34);
      opacity.set(isHover ? 1 : 0.6);
      dotScale.set(isHover ? 0.35 : 1);
    };
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      pendingEvent = e;
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(detectHover);
      }
    };
    const down = () => { setPressing(true); ringScale.set(0.82); };
    const up = () => { setPressing(false); ringScale.set(1); };
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, [x, y, size, opacity, dotScale, ringScale]);

  // Hide native cursor when ours is active
  useEffect(() => {
    document.documentElement.style.cursor = hidden ? "" : "none";
    return () => { document.documentElement.style.cursor = ""; };
  }, [hidden]);

  if (hidden) return null;

  const trailBase = "pointer-events-none fixed left-0 top-0 z-[9999] rounded-full";

  return (
    <>
      {/* trailing echoes (4 layers, increasing softness) */}
      <motion.div className={trailBase} style={{ x: t4x, y: t4y, width: 80, height: 80, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, rgba(180,200,230,0.10), transparent 70%)", filter: "blur(6px)" }} />
      <motion.div className={trailBase} style={{ x: t3x, y: t3y, width: 56, height: 56, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, rgba(200,215,235,0.14), transparent 70%)", filter: "blur(3px)" }} />
      <motion.div className={trailBase} style={{ x: t2x, y: t2y, width: 28, height: 28, translateX: "-50%", translateY: "-50%", border: "1px solid rgba(255,255,255,0.18)" }} />
      <motion.div className={trailBase} style={{ x: t1x, y: t1y, width: 16, height: 16, translateX: "-50%", translateY: "-50%", border: "1px solid rgba(255,255,255,0.32)" }} />

      {/* main magnetic ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center rounded-full"
        style={{
          x: t1x, y: t1y,
          width: size, height: size,
          scale: ringScale,
          opacity,
          translateX: "-50%", translateY: "-50%",
          border: hovering ? "1px solid rgba(255,255,255,0.95)" : "1px solid rgba(255,255,255,0.4)",
          background: hovering
            ? "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(170,180,196,0.05) 70%)"
            : "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 80%)",
          boxShadow: hovering
            ? "0 0 32px rgba(170,180,196,0.45), inset 0 0 14px rgba(255,255,255,0.18)"
            : "0 0 20px rgba(255,255,255,0.15)",
          willChange: "transform, width, height, opacity",
        }}
      >
        {text && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] font-semibold uppercase tracking-widest text-white"
          >
            {text}
          </motion.span>
        )}
      </motion.div>

      {/* instant inner dot — flips to small rotating cross when pressing */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center"
        style={{ x, y, scale: dotScale, rotate, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
      >
        {pressing ? (
          <div className="h-3 w-3 relative">
            <span className="absolute inset-0 m-auto h-3 w-px bg-white" style={{ boxShadow: "0 0 4px rgba(255,255,255,0.6)" }} />
            <span className="absolute inset-0 m-auto h-px w-3 bg-white" style={{ boxShadow: "0 0 4px rgba(255,255,255,0.6)" }} />
          </div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-white mix-blend-difference" />
        )}
      </motion.div>
    </>
  );
}
