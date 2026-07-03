import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import MagneticButton from "../ui/MagneticButton";
import { celebrate } from "../../lib/confetti";
import { EASE_OUT } from "../../lib/motion";

/**
 * The showcase call-to-action row — GitHub (+ optional live) links with
 * the full premium treatment: magnetic attraction toward the cursor, a
 * liquid ripple that blooms from the exact entry point, and a soft accent
 * glow that breathes while hovered.
 */
function RippleLink({ href, accent, primary = false, children, label }) {
  const innerRef = useRef(null);
  const [ripple, setRipple] = useState(null);

  const onEnter = (e) => {
    const r = innerRef.current?.getBoundingClientRect();
    if (!r) return;
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, id: Date.now() });
  };

  return (
    <MagneticButton
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cursor="hover"
      data-cursor-text="Open"
      strength={0.32}
      onClick={(e) => celebrate(e.clientX, e.clientY, accent)}
      className="group/cta relative inline-block rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
    >
      <span
        ref={innerRef}
        onPointerEnter={onEnter}
        className={`relative flex items-center gap-2.5 overflow-hidden rounded-full px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
          primary
            ? "bg-white text-black"
            : "border border-white/15 bg-white/[0.04] text-white/85 backdrop-blur-md hover:border-white/35 hover:text-white"
        }`}
      >
        {/* liquid ripple from the pointer's entry point */}
        <AnimatePresence>
          {ripple && (
            <motion.span
              key={ripple.id}
              aria-hidden
              initial={{ scale: 0, opacity: 0.35 }}
              animate={{ scale: 3.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              onAnimationComplete={() => setRipple(null)}
              className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                background: primary
                  ? `radial-gradient(circle, ${accent}55 0%, transparent 70%)`
                  : "radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>

        <span className="relative z-[1]">{children}</span>
        <span
          className="relative z-[1] inline-block transition-transform duration-300 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-0.5"
          aria-hidden
        >
          ↗
        </span>
      </span>

      {/* breathing accent glow while hovered */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1.5 rounded-full opacity-0 blur-lg transition-opacity duration-500 group-hover/cta:opacity-60"
        style={{ background: `radial-gradient(ellipse, ${accent}66 0%, transparent 70%)` }}
      />
    </MagneticButton>
  );
}

export default function ShowcaseCta({ project, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      className="flex flex-wrap items-center gap-3"
    >
      <RippleLink
        href={project.github}
        accent={project.color}
        primary
        label={`View ${project.title} on GitHub`}
      >
        View on GitHub
      </RippleLink>
      {project.live && (
        <RippleLink
          href={project.live}
          accent={project.color}
          label={`Open live demo of ${project.title}`}
        >
          Live Demo
        </RippleLink>
      )}
    </motion.div>
  );
}
