import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useCursor } from "../../hooks/useCursor";

/**
 * Soft radial light that follows the cursor across the page,
 * giving a "torch" feel without darkening anything beneath.
 * Sits below particles and the cursor itself.
 */
export default function CursorSpotlight() {
  const c = useCursor();

  /* Every hook below runs unconditionally. The early `if (!c) return null`
     that used to sit here left `useSpring` and `useMotionTemplate` behind a
     branch — the moment a provider appeared or disappeared, React's hook
     order changed and the component threw. Off-screen parking values stand in
     when there is no cursor provider (touch devices), and the render bails
     out afterwards. */
  const idleX = useMotionValue(-9999);
  const idleY = useMotionValue(-9999);
  const x = useSpring(c?.mx ?? idleX, { stiffness: 120, damping: 22, mass: 0.6 });
  const y = useSpring(c?.my ?? idleY, { stiffness: 120, damping: 22, mass: 0.6 });

  const bg = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, rgba(180,200,230,0.08), transparent 70%)`;

  if (!c) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ backgroundImage: bg }}
    />
  );
}
