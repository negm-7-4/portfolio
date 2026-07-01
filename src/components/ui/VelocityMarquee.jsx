import { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
} from "motion/react";

const wrap = (min, max, v) => {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
};

/**
 * Awwwards-style velocity text: scrolls continuously, and speeds up / reverses
 * direction based on the page scroll velocity. Skews slightly while moving.
 */
export default function VelocityMarquee({
  text = "FRONT-END DEVELOPER",
  baseVelocity = 3,
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(smooth, [-1000, 0, 1000], [-6, 0, 6], { clamp: true });

  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((t, delta) => {
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    if (factor.get() < 0) dir.current = -1;
    else if (factor.get() > 0) dir.current = 1;
    moveBy += moveBy * factor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const items = Array.from({ length: 6 });

  return (
    <div className="sd-fade relative overflow-hidden border-y border-white/[0.06] py-7">
      {/* edge fades — wider for a more cinematic vignette */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-[#0b0d11] via-[#0b0d11]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[#0b0d11] via-[#0b0d11]/80 to-transparent" />

      {/* subtle scan-line overlay for film feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(transparent 50%, rgba(255,255,255,1) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      <motion.div style={{ x, skewX: skew, willChange: "transform" }} className="flex whitespace-nowrap">
        {items.map((_, i) => (
          <span
            key={i}
            className="mr-10 inline-flex items-center gap-6 font-display text-5xl font-bold uppercase tracking-tight md:text-7xl"
          >
            <span className={i % 2 === 0 ? "text-white/[0.08]" : "text-gradient opacity-20"}>
              {text}
            </span>
            <span
              className="text-[#8a93a6]/30"
              style={{ display: "inline-block", transform: "rotate(0deg)" }}
            >
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
