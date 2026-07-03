import { motion } from "motion/react";
import { EASE_BACK } from "../../lib/motion";

/**
 * Technology badges that arrive individually — a tasteful back-out pop
 * with a blur settle, each one a beat after the last. Hover lifts the
 * badge and warms its border toward the project accent.
 *
 * Animates on mount (pair with keyed AnimatePresence to replay).
 */
export default function TechBadges({ tech, accent = "#8a93a6", delay = 0 }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tech.map((t, i) => (
        <motion.li
          key={t}
          initial={{ opacity: 0, scale: 0.7, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
          transition={{ duration: 0.5, ease: EASE_BACK, delay: delay + i * 0.055 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="group/badge relative rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-white/70 backdrop-blur-md transition-colors duration-300 hover:text-white"
          style={{ "--badge-accent": accent }}
        >
          {/* accent underglow on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover/badge:opacity-100"
            style={{
              boxShadow: `inset 0 0 0 1px ${accent}66, 0 4px 16px -4px ${accent}55`,
            }}
          />
          {t}
        </motion.li>
      ))}
    </ul>
  );
}
