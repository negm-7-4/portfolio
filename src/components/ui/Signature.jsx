import { useRef } from "react";
import { motion, useInView } from "motion/react";

/**
 * Animated SVG signature — draws itself when scrolled into view, like
 * a hand writing the name in a single fluid stroke.
 *
 * Two passes:
 *   - main stroke draws via pathLength
 *   - light shimmer streaks across the finished signature
 */
export default function Signature({ className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15%", once: false });

  // Hand-tuned bezier-ish path forming "Mohamed Negm" in a loose script.
  // Path is two strokes: 1) the underline flourish, 2) the name script.
  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <svg
        viewBox="0 0 400 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-12 w-[260px] text-white/70 md:h-16 md:w-[340px]"
        aria-label="Mohamed Negm signature"
      >
        {/* Main script stroke — drawn first */}
        <motion.path
          d="M10 55
             C 14 35, 22 18, 30 35
             C 34 48, 36 30, 42 45
             C 46 58, 50 28, 60 40
             C 70 55, 80 30, 90 42
             C 100 55, 102 35, 110 48
             C 120 60, 130 38, 140 50
             L 148 36
             M 154 50
             C 162 40, 172 30, 180 48
             C 184 60, 192 30, 200 46
             C 208 60, 216 28, 226 44
             C 232 56, 244 30, 252 48
             C 256 60, 262 38, 270 52
             M 282 52
             C 286 30, 295 60, 300 32
             C 304 12, 312 60, 318 32
             C 322 16, 332 60, 340 35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{
            duration: 2.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* underline flourish */}
        <motion.path
          d="M14 76 C 90 70, 200 78, 348 73 L 360 70"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: inView ? 1 : 0,
            opacity:    inView ? 0.6 : 0,
          }}
          transition={{
            duration: 1.4,
            delay: 1.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* tiny terminal dot */}
        <motion.circle
          cx="360"
          cy="70"
          r="2"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: inView ? 1 : 0,
            opacity: inView ? 0.8 : 0,
          }}
          transition={{ delay: 3, duration: 0.4, type: "spring", stiffness: 220 }}
        />
      </svg>
    </div>
  );
}
