import { motion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Thin shimmering progress bar pinned to the top of the viewport.
 * Spring-smoothed for buttery motion, with a glowing leading edge that
 * tracks the scroll head.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    restDelta: 0.0008,
  });

  // glowing dot rides the head of the progress bar
  const dotX = useTransform(scrollYProgress, [0, 1], ["0vw", "100vw"]);

  return (
    <>
      {/* base track — faint line so the bar reads against the bg */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-[2px] w-full bg-white/[0.04]"
      />

      {/* shimmering progress fill */}
      <motion.div
        style={{ scaleX }}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-[2px] w-full origin-left bar-shimmer"
        // shimmer gradient drifts continuously across the bar
        // (bar-shimmer keyframes already in index.css)
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(110deg, #6f7c8c 0%, #aab4c4 35%, #ffffff 50%, #aab4c4 65%, #6f7c8c 100%)",
            backgroundSize: "250% 100%",
          }}
        />
      </motion.div>

      {/* glowing leading-edge dot */}
      <motion.div
        style={{ x: dotX }}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2"
      >
        <motion.span
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="block h-[6px] w-[6px] rounded-full bg-white"
          style={{
            boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(170,180,196,0.6)",
            transform: "translateY(-2px)",
          }}
        />
      </motion.div>
    </>
  );
}
