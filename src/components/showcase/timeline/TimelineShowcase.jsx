import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

import { projects } from "../../../data/content";
import { EASE_OUT } from "../../../lib/motion";
import useWorldDye from "../useWorldDye";
import DescriptionLines from "../DescriptionLines";
import TechBadges from "../TechBadges";
import ShowcaseCta from "../ShowcaseCta";
import ProjectVisual from "../ProjectVisual";

/**
 * ── TIMELINE SHOWCASE — the keynote spine ─────────────────────────────
 * A glowing spine grows down the page as you scroll; each project arrives
 * as a staged keynote slide — node ignites, artwork unmasks from its side,
 * then the copy plays in (masked lines → badges → CTA). Slides alternate
 * sides on desktop and stack cleanly on mobile.
 *
 * Pure transform/clip-path/opacity — rides Lenis at 60fps, no WebGL, so
 * it also serves as a premium mid-tier presentation.
 */

/* One slide. `flip` alternates the artwork/copy columns. */
function Slide({ p, i, onEnter }) {
  const flip = i % 2 === 1;
  const [seen, setSeen] = useState(false);
  const num = String(i + 1).padStart(2, "0");

  return (
    <motion.article
      data-idx={i}
      onViewportEnter={() => {
        onEnter(i);
        setSeen(true);
      }}
      viewport={{ margin: "-35% 0px -35% 0px" }}
      className="relative grid grid-cols-1 gap-8 py-16 pl-10 md:grid-cols-2 md:gap-14 md:py-28 md:pl-0"
    >
      {/* ── Spine node — ignites as the slide takes the stage. ── */}
      <motion.span
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ margin: "-35% 0px -35% 0px" }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="absolute left-4 top-20 z-[1] -translate-x-1/2 md:left-1/2 md:top-1/2 md:-translate-y-1/2"
      >
        <span className="relative block h-3 w-3">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-40"
            style={{ background: p.color, animationDuration: "2.2s" }}
          />
          <span
            className="relative block h-3 w-3 rounded-full"
            style={{ background: p.color, boxShadow: `0 0 14px ${p.color}aa` }}
          />
        </span>
      </motion.span>

      {/* ── Artwork — unmasks from its own side of the spine. ── */}
      <motion.div
        initial={{ clipPath: flip ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", opacity: 0.4 }}
        whileInView={{ clipPath: "inset(0 0% 0 0%)", opacity: 1 }}
        viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className={`relative ${flip ? "md:order-2 md:pl-14" : "md:pr-14"}`}
      >
        <div
          className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10"
          data-cursor="hover"
        >
          <ProjectVisual project={p} imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
          {/* accent wash + ghost number */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(160deg, transparent 55%, ${p.color}22 100%)` }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 right-4 select-none font-display font-bold leading-none tracking-tighter"
            style={{ fontSize: "clamp(4rem, 8vw, 7rem)", color: "rgba(255,255,255,0.08)" }}
          >
            {num}
          </span>
        </div>
      </motion.div>

      {/* ── Copy — staged in once the slide is seen. ── */}
      <div className={`flex flex-col justify-center ${flip ? "md:order-1 md:items-end md:pr-14 md:text-right" : "md:pl-14"}`}>
        {seen && (
          <>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="block font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: `${p.color}cc` }}
            >
              ( {num} ) · {p.category}
            </motion.span>

            <motion.h3
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT }}
              className="mt-3 font-display text-3xl font-bold leading-[0.95] tracking-tight text-white md:text-5xl"
            >
              {p.title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="mt-2 text-[12px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: `${p.color}99` }}
            >
              {p.tagline}
            </motion.p>

            <DescriptionLines
              text={p.desc}
              delay={0.26}
              className="mt-5 max-w-md text-[14px] leading-[1.7] text-white/55"
            />

            <div className={`mt-6 ${flip ? "md:flex md:justify-end" : ""}`}>
              <TechBadges tech={p.tech} accent={p.color} delay={0.45} />
            </div>

            <div className="mt-7">
              <ShowcaseCta project={p} delay={0.58} />
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
}

export default function TimelineShowcase() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "-15% 0px -15% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useWorldDye(active, inView);

  /* The spine grows with scroll — springy so it feels drawn, not dragged. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.6"],
  });
  const spine = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const tipTop = useTransform(spine, (v) => `${Math.min(100, v * 100)}%`);

  return (
    <div ref={ref} className="relative mx-auto w-[90%] max-w-7xl">
      {/* ── The spine ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-4 top-0 w-px bg-white/[0.07] md:left-1/2"
      >
        <motion.div
          style={{ scaleY: spine, transformOrigin: "top" }}
          className="h-full w-full bg-gradient-to-b from-[#8a93a6] via-[#aab4c4] to-white/60"
        />
        {/* glowing tip riding the spine's growth */}
        <motion.span
          style={{ top: tipTop, boxShadow: "0 0 12px rgba(255,255,255,0.8)" }}
          className="absolute left-1/2 hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white md:block"
        />
      </div>

      {projects.map((p, i) => (
        <Slide key={p.title} p={p} i={i} onEnter={setActive} />
      ))}
    </div>
  );
}
