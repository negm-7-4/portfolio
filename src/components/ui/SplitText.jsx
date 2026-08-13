import { motion } from "motion/react";
import { foldChild, staggerContainer, VIEWPORT } from "../../lib/motion";

/**
 * Reveals text on scroll, word-by-word (or char-by-char), each unit hinging
 * up from behind a mask with a touch of 3D rotateX and a blur→focus pass.
 * Spring-driven so words "land" with a hair of weight instead of stopping dead.
 *
 * Transform + opacity + a one-shot blur per unit → GPU-composited, 60fps.
 *
 * Props (back-compatible): text, className, delay, stagger, blur, as.
 * New: `perChar` splits into letters for headline-grade reveals.
 */
export default function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
  blur = true,
  perChar = false,
  as: Tag = "span",
}) {
  const words = text.split(" ");
  const container = staggerContainer(stagger, delay);
  const child = foldChild({ blur });

  // `as` is honoured so a split headline can be a real <h2>/<p> rather than
  // always a <span>. Falls back to span for anything motion cannot proxy.
  const MotionTag = motion[Tag] ?? motion.span;

  const Unit = ({ children }) => (
    <span
      className="inline-block overflow-hidden pb-[0.14em] mr-[0.28em] align-bottom"
      style={{ perspective: 600 }}
    >
      <motion.span variants={child} className="inline-block" style={{ transformOrigin: "50% 100%" }}>
        {children}
      </motion.span>
    </span>
  );

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: VIEWPORT.margin }}
      className={`inline-flex flex-wrap ${className}`}
    >
      {/* The split words/letters are decorative duplicates as far as assistive
          tech is concerned — an `aria-label` on a generic element is widely
          ignored, so the real sentence is exposed once, visually hidden, and
          the animated fragments are hidden from the tree. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="contents">
      {perChar
        ? words.map((word, wi) => (
            // keep each word intact (no mid-word wrapping) but reveal its letters
            <span key={wi} className="inline-flex mr-[0.28em] whitespace-nowrap" style={{ perspective: 600 }}>
              {word.split("").map((ch, ci) => (
                <span key={ci} className="inline-block overflow-hidden pb-[0.14em]">
                  <motion.span variants={child} className="inline-block" style={{ transformOrigin: "50% 100%" }}>
                    {ch}
                  </motion.span>
                </span>
              ))}
            </span>
          ))
        : words.map((word, i) => <Unit key={i}>{word}</Unit>)}
      </span>
    </MotionTag>
  );
}
