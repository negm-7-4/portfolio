import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { celebrate } from "../../lib/confetti";
import { projects } from "../../data/content";

/* ─── A single timeline node — alternates side on desktop ─── */
function TimelineItem({ p, i }) {
  const ref = useRef(null);
  const side = i % 2 === 0; // even → left, odd → right (desktop)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const x = useTransform(scrollYProgress, [0, 1], [side ? -50 : 50, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(8px)", "blur(0px)"]);

  const initials = p.title.split(" ").map((w) => w[0]).join("").slice(0, 3);

  return (
    <div
      ref={ref}
      className={`relative flex w-full items-center md:gap-8 ${
        side ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* card */}
      <motion.article
        style={{ opacity, y, x, filter: blur }}
        className="ml-16 w-full md:ml-0 md:w-[calc(50%-2.5rem)]"
      >
        <div
          data-cursor="hover"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/25"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -28px rgba(0,0,0,0.6)" }}
        >
          {/* hover glow */}
          <span
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(420px circle at 50% 0%, ${p.color}22, transparent 60%)` }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${p.color}cc` }}>
                {p.category}
              </span>
              <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                {p.title}
              </h3>
            </div>
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold"
              style={{ background: `${p.color}1f`, color: p.color, border: `1px solid ${p.color}33` }}
            >
              {initials}
            </span>
          </div>

          <p className="relative mt-3 text-[13.5px] leading-[1.7] text-white/55">{p.desc}</p>

          <ul className="relative mt-4 flex flex-wrap gap-2">
            {p.tech.map((t) => (
              <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium tracking-wide text-white/60">
                {t}
              </li>
            ))}
          </ul>

          <div className="relative mt-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
              {p.status}
            </span>
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              data-cursor-text="Open"
              onClick={(e) => celebrate(e.clientX, e.clientY, p.color)}
              className="group/cta inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 transition-colors hover:text-white"
            >
              View <span className="transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5">↗</span>
            </a>
          </div>
        </div>
      </motion.article>

      {/* center node dot */}
      <div className="absolute left-6 top-6 md:static md:flex md:w-0 md:items-center md:justify-center">
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: false, margin: "-20%" }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="relative z-10 block h-4 w-4 -translate-x-1/2 rounded-full md:translate-x-0"
          style={{ background: p.color, boxShadow: `0 0 0 4px rgba(11,13,17,1), 0 0 22px ${p.color}` }}
        >
          <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: p.color }} />
        </motion.span>
      </div>

      {/* spacer for the opposite half (desktop) */}
      <div className="hidden md:block md:w-[calc(50%-2.5rem)]" />
    </div>
  );
}

/* ─── Timeline view: vertical spine that draws as you scroll ─── */
export default function Timeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.6", "end 0.85"] });
  const spine = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <div ref={ref} className="relative mx-auto max-w-5xl">
      {/* spine track */}
      <div className="absolute bottom-0 left-6 top-0 w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" aria-hidden />
      {/* spine fill (draws with scroll) */}
      <motion.div
        style={{ scaleY: spine }}
        className="absolute bottom-0 left-6 top-0 w-px origin-top md:left-1/2 md:-translate-x-1/2"
        aria-hidden
      >
        <div className="h-full w-full bg-gradient-to-b from-[#aab4c4] via-[#8a93a6] to-transparent" style={{ boxShadow: "0 0 14px rgba(170,180,196,0.6)" }} />
      </motion.div>

      <div className="flex flex-col gap-16 py-6 md:gap-24">
        {projects.map((p, i) => (
          <TimelineItem key={p.title} p={p} i={i} />
        ))}
      </div>
    </div>
  );
}
