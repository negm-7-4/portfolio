import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Global click ripple — every primary click anywhere on the page emits an
 * expanding ring from the click point. Skipped when the user is typing
 * (text inputs / contenteditable) so it doesn't interfere.
 */
export default function ClickRipple() {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    // Skip on touch devices to avoid jank during tap interactions
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const onDown = (e) => {
      // Only primary mouse button
      if (e.button !== 0) return;
      // Ignore form fields
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      const id = Date.now() + Math.random();
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      // Cleanup after the animation ends
      setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 900);
    };

    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990] overflow-visible" aria-hidden>
      <AnimatePresence>
        {/* Outer ring — silver-blue tinted border */}
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.85, x: r.x, y: r.y }}
            animate={{ scale: 14, opacity: 0, x: r.x, y: r.y }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: 0, top: 0,
              width: 14, height: 14,
              border: "1.5px solid rgba(190,200,215,0.6)",
              boxShadow: "0 0 16px rgba(170,180,196,0.4)",
            }}
          />
        ))}
        {/* Middle ring */}
        {ripples.map((r) => (
          <motion.span
            key={`${r.id}-mid`}
            initial={{ scale: 0, opacity: 0.7, x: r.x, y: r.y }}
            animate={{ scale: 9, opacity: 0, x: r.x, y: r.y }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: 0, top: 0,
              width: 12, height: 12,
              border: "1px solid rgba(255,255,255,0.45)",
            }}
          />
        ))}
        {/* Inner soft glow */}
        {ripples.map((r) => (
          <motion.span
            key={`${r.id}-glow`}
            initial={{ scale: 0, opacity: 0.7, x: r.x, y: r.y }}
            animate={{ scale: 6, opacity: 0, x: r.x, y: r.y }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: 0, top: 0,
              width: 14, height: 14,
              background: "radial-gradient(circle, rgba(170,180,196,0.5), transparent 70%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
