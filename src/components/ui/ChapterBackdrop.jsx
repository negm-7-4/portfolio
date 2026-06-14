import { motion, useMotionTemplate, useSpring } from "motion/react";
import { useEffect } from "react";
import { useActiveSection } from "../../hooks/useActiveSection";

/**
 * Soft accent gradient pinned behind everything. Color follows the active
 * section's color, smoothed with a spring so transitions feel cinematic.
 * Stacks BELOW the WebGL noise, so the shader breathes through it.
 *
 * Three blobs: a wide top arc, a wide bottom arc, and a faint side glow
 * that drifts based on the same channel values for a layered breath.
 */

// hex → channel triplet
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function ChapterBackdrop() {
  const { active } = useActiveSection();

  // Stiffness lowered for an even slower, more cinematic colour drift.
  // Damping slightly higher to prevent any overshoot at section boundaries.
  const r = useSpring(138, { stiffness: 45, damping: 24, mass: 1.2 });
  const g = useSpring(147, { stiffness: 45, damping: 24, mass: 1.2 });
  const b = useSpring(166, { stiffness: 45, damping: 24, mass: 1.2 });

  useEffect(() => {
    const [rr, gg, bb] = hexToRgb(active.color);
    r.set(rr); g.set(gg); b.set(bb);
  }, [active, r, g, b]);

  const bg = useMotionTemplate`
    radial-gradient(80% 50% at 50% 0%, rgba(${r}, ${g}, ${b}, 0.12), transparent 70%),
    radial-gradient(70% 50% at 50% 100%, rgba(${r}, ${g}, ${b}, 0.10), transparent 70%),
    radial-gradient(40% 40% at 15% 50%, rgba(${r}, ${g}, ${b}, 0.05), transparent 70%),
    radial-gradient(40% 40% at 85% 50%, rgba(${r}, ${g}, ${b}, 0.05), transparent 70%)
  `;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[0]"
      style={{ backgroundImage: bg, mixBlendMode: "screen" }}
    />
  );
}
