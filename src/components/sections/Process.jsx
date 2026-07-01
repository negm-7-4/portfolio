import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import { process as steps } from "../../data/content";

/* ─── Process row — big horizontal step, alternating sides ─── */
function StepRow({ step, i, total }) {
  const last = i === total - 1;
  const flip = i % 2 === 1;
  const num  = step.num;

  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid grid-cols-1 items-center gap-8 py-16 md:grid-cols-2 md:gap-16 md:py-24"
    >
      {/* ── Step number side ── */}
      <div className={`relative ${flip ? "md:order-2" : ""}`}>
        {/* tiny phase indicator label */}
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute top-2 left-2 font-display text-[10px] font-semibold tracking-[0.3em] text-white/30"
        >
          Phase / {String(i + 1).padStart(2, "0")}
        </motion.span>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, x: -60, scale: 0.7 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="block select-none font-display leading-[0.8] tracking-tighter tabular-nums"
          style={{
            fontSize: "clamp(8rem, 18vw, 16rem)",
            color: "rgba(255,255,255,0.06)",
            textShadow: `0 0 80px ${step.accent}50`,
          }}
        >
          {num}.
        </motion.span>

        {/* small floating accent dot orbiting the number */}
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 22 + i * 3, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute left-12 top-12 h-20 w-20 md:left-20 md:top-20 md:h-32 md:w-32"
        >
          <span
            className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: step.accent, boxShadow: `0 0 10px ${step.accent}` }}
          />
        </motion.span>
      </div>

      {/* ── Step content side ── */}
      <div className={`relative ${flip ? "md:order-1" : ""}`}>
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="block font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: `${step.accent}cc` }}
        >
          ( {num} / {String(total).padStart(2, "0")} )  ·  Phase
        </motion.span>

        <motion.h3
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.22, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 font-display font-bold leading-[0.95] tracking-tight text-white"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
        >
          {step.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-5 max-w-md text-[14px] leading-[1.85] text-white/55 md:text-[15px]"
        >
          {step.desc}
        </motion.p>

        {/* draw-in underline */}
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 block h-px w-32 origin-left"
          style={{ background: `linear-gradient(90deg, ${step.accent}, transparent)` }}
        />
      </div>

      {/* vertical divider line between steps (desktop only) */}
      {!last && (
        <motion.span
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute left-1/2 -bottom-8 h-16 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-white/30 to-transparent"
        />
      )}
    </motion.div>
  );
}

/* ─── Section ─── */
export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section
      id="process"
      ref={ref}
      className="relative w-full py-32 md:py-44"
    >
      {/* ambient backgrounds */}
      <motion.div
        style={{ y: bgY1 }}
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-[15%] h-[480px] w-[480px] rounded-full opacity-[0.05]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#aab4c4_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: bgY2 }}
        aria-hidden
        className="pointer-events-none absolute left-[5%] bottom-[15%] h-[420px] w-[420px] rounded-full opacity-[0.04]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#6f7c8c_0%,transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="05" eyebrow="Workflow" title="My" accent="Process" />

        <div className="divide-y divide-white/[0.06]">
          {steps.map((step, i) => (
            <StepRow key={step.num} step={step} i={i} total={steps.length} />
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
          <span>{steps.length} steps · every project</span>
          <span className="h-px w-16 bg-white/15" />
        </motion.div>
      </div>
    </section>
  );
}
