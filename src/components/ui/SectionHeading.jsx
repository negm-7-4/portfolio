import { motion } from "motion/react";
import SplitText from "./SplitText";
import Reveal from "./Reveal";
import Parallax from "./Parallax";

/**
 * Section header in Ahmed Ragab signature style: "( NN )" parenthesized
 * number to the left, label to the right, separated by a thin draw-in line.
 * Sits above a giant 2-line title with split-letter reveal.
 *
 * Pass `num` like "01", "02" — gets wrapped in `( … )` automatically.
 */
export default function SectionHeading({ eyebrow, title, accent, num }) {
  return (
    <Parallax distance={70} className="mb-14 flex flex-col items-center text-center">
      <Reveal>
        <div className="mb-7 flex items-center gap-4">
          {/* small leading dash */}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-10 origin-right bg-gradient-to-l from-white/40 to-white/0"
          />

          {/* "( NN )" — animated parentheses */}
          {num && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
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
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
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
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/65"
          >
            {eyebrow}
          </motion.span>

          {/* trailing draw-in line */}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="h-px w-14 origin-left bg-gradient-to-r from-white/40 to-white/0"
          />
        </div>
      </Reveal>

      <h2
        className="font-display text-4xl sm:text-5xl font-bold leading-[0.95] tracking-tight md:text-[5.5rem] break-words"
        style={{ textShadow: "0 0 32px rgba(170,180,196,0.08)" }}
      >
        <SplitText text={title} />{" "}
        {accent && (
          <span className="text-gradient italic font-light">
            <SplitText text={accent} delay={0.12} />
          </span>
        )}
      </h2>
    </Parallax>
  );
}
