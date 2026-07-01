import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import { experience } from "../../data/content";

/* ─── A single experience entry on the timeline ─── */
function ExperienceRow({ e, i, total }) {
  const num = String(i + 1).padStart(2, "0");
  const last = i === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ duration: 0.75, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid grid-cols-1 gap-6 pb-16 md:grid-cols-[180px_24px_1fr] md:gap-10 md:pb-24"
    >
      {/* period column */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-10%" }}
        transition={{ delay: 0.15 + i * 0.08, duration: 0.55 }}
        className="md:pt-2"
      >
        <span className="font-display text-[10px] font-semibold tracking-[0.3em] text-white/30">
          ({num})
        </span>
        <p className="mt-1 font-display text-lg font-semibold tracking-tight text-white md:text-xl">
          {e.period}
        </p>
      </motion.div>

      {/* timeline node */}
      <div className="relative hidden md:block">
        {/* outer glow halo for the node */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-3 -translate-x-1/2 h-6 w-6 -translate-y-1 rounded-full"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          style={{ background: "radial-gradient(circle, rgba(170,180,196,0.5), transparent 70%)" }}
        />
        {/* node */}
        <span
          className="absolute left-1/2 top-3 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#aab4c4]"
          style={{ boxShadow: "0 0 12px rgba(170,180,196,0.6), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {i === 0 && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#aab4c4] opacity-50" />
          )}
        </span>
        {/* line segment between nodes (skip on last) */}
        {!last && (
          <motion.span
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-8 -translate-x-1/2 w-px origin-top bg-gradient-to-b from-[#aab4c4]/50 via-white/15 to-transparent"
            style={{ height: "calc(100% + 4rem)" }}
          />
        )}
      </div>

      {/* content column */}
      <motion.div
        whileHover={{ x: 8 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="group relative md:pt-1"
      >
        {/* hover underline on company */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            {e.role}
          </h3>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            @ {e.company}
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-[14px] leading-[1.8] text-white/55 md:text-[15px]">
          {e.desc}
        </p>

        {/* draw-in underline below content */}
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.45 + i * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 block h-px w-32 origin-left bg-gradient-to-r from-white/40 to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Section ─── */
export default function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // overall progress line on the timeline column
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 1 });
  const lineHeight = useTransform(progress, [0, 0.85], ["0%", "100%"]);

  const bgY1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section
      id="experience"
      ref={ref}
      className="relative w-full py-32 md:py-44"
    >
      {/* ambient layers */}
      <motion.div
        style={{ y: bgY1 }}
        aria-hidden
        className="pointer-events-none absolute right-[10%] top-[20%] h-[460px] w-[460px] rounded-full opacity-[0.05]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#6f7c8c_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: bgY2 }}
        aria-hidden
        className="pointer-events-none absolute left-[8%] bottom-[18%] h-[360px] w-[360px] rounded-full opacity-[0.04]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#aab4c4_0%,transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="04" eyebrow="Journey" title="Experience &" accent="Education" />

        {/* timeline body */}
        <div className="relative mx-auto max-w-5xl">
          {/* GLOBAL scroll-progress line behind the column timeline */}
          <div className="absolute left-[180px] top-2 hidden h-full w-px translate-x-3 md:block" aria-hidden>
            <span className="absolute inset-0 bg-white/[0.06]" />
            <motion.span
              style={{ height: lineHeight }}
              className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-white/70 via-[#aab4c4] to-white/40"
            />
          </div>

          {experience.map((e, i) => (
            <ExperienceRow key={`${e.period}-${i}`} e={e} i={i} total={experience.length} />
          ))}
        </div>

        {/* end cap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-12 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.35em] text-white/30"
        >
          <span className="h-px w-16 bg-white/15" />
          <span>journey continues</span>
          <span className="h-px w-16 bg-white/15" />
        </motion.div>
      </div>
    </section>
  );
}
