import { motion } from "motion/react";

/**
 * Reveals text word-by-word (and chars within if needed) on scroll into view.
 * ReactBits-style staggered reveal with optional blur defocus → focus.
 */
export default function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  blur = true,
  as: Tag = "span",
}) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const child = {
    hidden: {
      y: "120%",
      opacity: 0,
      rotate: 6,
      filter: blur ? "blur(8px)" : undefined,
    },
    show: {
      y: "0%",
      opacity: 1,
      rotate: 0,
      filter: blur ? "blur(0px)" : undefined,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 120,
        filter: { duration: 0.35 },
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "-10%" }}
      className={`inline-flex flex-wrap ${className}`}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] mr-[0.28em]">
          <motion.span variants={child} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
