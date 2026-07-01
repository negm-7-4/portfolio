import { motion } from "motion/react";
import SplitText from "./SplitText";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import { EASE_OUT, VIEWPORT } from "../../lib/motion";

/**
 * Section header: "( NN )" parenthesized number + label, split by thin
 * draw-in lines, sitting above a giant two-tone title with a headline-grade
 * per-character fold-up reveal and a mask underline that sweeps in beneath.
 *
 * Pass `num` like "01", "02" — gets wrapped in `( … )` automatically.
 */
export default function SectionHeading({ eyebrow, title, accent, num }) {
  return (
    <Parallax distance={70} className="mb-14 flex flex-col items-center text-center">
      <Reveal depth={false}>
        <div className="mb-7 flex items-center gap-4">
          {/* small leading dash */}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="h-px w-10 origin-right bg-gradient-to-l from-white/40 to-white/0"
          />

          {/* "( NN )" — animated parentheses */}
          {num && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.05 }}
              className="flex items-baseline font-display text-[15px] font-medium tracking-[0.18em] tabular-nums text-white/55"
            >
              <motion.span
                animate={{ y: [0, -2, 0], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-white/35"
              >
                (
              </motion.span>
              <span className="mx-1 text-white/90">{num}</span>
              <motion.span
                animate={{ y: [0, -2, 0], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="text-white/35"
              >
                )
              </motion.span>
            </motion.span>
          )}

          {/* center diamond glyph that pulses */}
          <motion.span
            initial={{ opacity: 0, rotate: -45 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }}
            className="font-display text-[8px] text-[#aab4c4]"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              ◆
            </motion.span>
          </motion.span>

          {/* label */}
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/65"
          >
            {eyebrow}
          </motion.span>

          {/* trailing draw-in line */}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.18 }}
            className="h-px w-14 origin-left bg-gradient-to-r from-white/40 to-white/0"
          />
        </div>
      </Reveal>

      <h2
        className="font-display text-4xl sm:text-5xl font-bold leading-[0.95] tracking-tight md:text-[5.5rem] break-words"
        style={{ textShadow: "0 0 32px rgba(170,180,196,0.08)" }}
      >
        <SplitText text={title} perChar />{" "}
        {accent && (
          <span className="text-gradient italic font-light">
            <SplitText text={accent} perChar delay={0.12} />
          </span>
        )}
      </h2>

      {/* mask underline — sweeps in beneath the title */}
      <motion.span
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.35 }}
        className="mt-6 block h-px w-28 origin-center bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />
    </Parallax>
  );
}
