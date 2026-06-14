import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import TiltCard from "../ui/TiltCard";
import Portrait from "../ui/Portrait";
import { profile, aboutCards } from "../../data/content";

/* ─── Subtle SVG glyphs for the trait cards ─── */
const ICONS = {
  code:   "M8 6L2 12l6 6M16 6l6 6-6 6",
  design: "M12 19l7-7-3-3-7 7v3h3zM18 9l1.5-1.5a2.1 2.1 0 0 0-3-3L15 6",
  bolt:   "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  puzzle: "M10 3v3a2 2 0 0 0 4 0V3h4v4h-3a2 2 0 0 0 0 4h3v6h-4v-3a2 2 0 0 0-4 0v3H6v-6h3a2 2 0 0 0 0-4H6V3h4z",
};

const TRAIT_COLORS = [
  "138,147,166",
  "111,124,140",
  "156,149,140",
  "170,180,196",
];

/* ─── Stat row used in the right sidebar ─── */
function StatLine({ label, value, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ delay: 0.3 + i * 0.07, duration: 0.55 }}
      className="group relative flex items-baseline justify-between border-b border-white/[0.07] py-4"
    >
      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white/40 transition-transform duration-500 group-hover:scale-x-100" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">
        {label}
      </span>
      <span className="font-display text-sm font-semibold tracking-tight text-white md:text-base" dir="auto">
        {value}
      </span>
    </motion.div>
  );
}

/* ─── Section ─── */
export default function About() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY     = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const titleY  = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const stats = [
    { label: "Role",       value: profile.role        },
    { label: "Major",      value: profile.education   },
    { label: "Year",       value: profile.year        },
    { label: "University", value: profile.university  },
    { label: "Location",   value: profile.location    },
    { label: "Status",     value: profile.status      },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="relative w-full py-32 md:py-44"
    >
      {/* ambient orb */}
      <motion.div
        style={{ y: bgY }}
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-[500px] w-[500px] rounded-full opacity-[0.05]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#aab4c4_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-60, 60]) }}
        aria-hidden
        className="pointer-events-none absolute left-1/4 bottom-1/4 h-[380px] w-[380px] rounded-full opacity-[0.04]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#8a93a6_0%,transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="01" eyebrow="About Me" title="Who" accent="I Am" />

        {/* ── Two-column intro: huge bio left, stats right ── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
          {/* LEFT — Bio essay with cinematic typography */}
          <motion.div
            style={{ y: titleY }}
            className="md:col-span-7"
          >
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-light leading-[1.18] tracking-tight text-white/90"
              style={{ fontSize: "clamp(1.4rem, 2.6vw, 2.4rem)" }}
              dir="auto"
            >
              I&apos;m{" "}
              <span className="font-semibold text-white">{profile.name}</span>
              {" "}— a{" "}
              <span className="text-gradient italic font-medium">front-end developer</span>
              {" "}and{" "}
              <span className="font-semibold text-white">{profile.year} CS &amp; AI</span>
              {" "}student at {profile.university}, building the kind of websites I want to use.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-8 max-w-2xl text-base leading-[1.85] text-white/55 md:text-lg"
              dir="auto"
            >
              I specialise in fast, immersive interfaces with{" "}
              <span className="font-medium text-white/85">React</span>,{" "}
              <span className="font-medium text-white/85">Three.js</span> and{" "}
              <span className="font-medium text-white/85">Framer Motion</span>.
              From accounting ERPs to 3D web experiences — every pixel, every easing curve, every detail matters.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-6 max-w-2xl text-sm leading-relaxed text-white/35 italic md:text-base"
            >
              Always learning. Always building.
            </motion.p>

            {/* signature */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex items-center gap-4"
            >
              <span className="h-px w-16 origin-left bg-white/30" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
                — Mohamed Negm
              </span>
            </motion.div>
          </motion.div>

          {/* RIGHT — Portrait + stat sidebar in a glass panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="flex flex-col gap-8 md:col-span-5"
          >
            {/* Animated profile photo */}
            <Portrait />

            <TiltCard
              max={6}
              spotColor="170,180,196"
              className="relative overflow-hidden rounded-3xl glass p-8"
            >
              {/* tiny header */}
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">
                  ◆ Profile
                </span>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  className="h-3 w-3"
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-[#aab4c4]" />
                </motion.span>
              </div>

              {stats.map((s, i) => (
                <StatLine key={s.label} {...s} i={i} />
              ))}

              {/* status pulse at the bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-10%" }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex items-center gap-2 text-xs text-green-400"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                <span className="font-medium">Open to opportunities</span>
              </motion.div>
            </TiltCard>
          </motion.div>
        </div>

        {/* ── Trait cards — 4-column row with staggered 3D entrance ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-20 mb-6 flex items-center gap-4 md:mt-28"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">
            What I bring
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aboutCards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 60, scale: 0.94, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200 }}
              className={i % 2 === 1 ? "lg:translate-y-6" : ""}
            >
              <TiltCard
                data-cursor="hover"
                spotColor={TRAIT_COLORS[i]}
                className="group/card relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7"
              >
                {/* inner border glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                  style={{ boxShadow: `inset 0 0 0 1px rgba(${TRAIT_COLORS[i]},0.5)` }}
                />

                {/* number index — small upper-right marker */}
                <span className="absolute right-5 top-5 font-display text-[10px] font-semibold tracking-[0.3em] text-white/25">
                  0{i + 1}
                </span>

                {/* icon with halo */}
                <div className="relative mb-6">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-3 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover/card:opacity-70"
                    style={{ background: `radial-gradient(circle, rgba(${TRAIT_COLORS[i]},0.45), transparent 70%)` }}
                  />
                  <motion.div
                    whileHover={{ rotate: -10, scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: `rgba(${TRAIT_COLORS[i]},0.15)`,
                      border: `1px solid rgba(${TRAIT_COLORS[i]},0.25)`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={`rgba(${TRAIT_COLORS[i]},1)`}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d={ICONS[c.icon]} />
                    </svg>
                  </motion.div>
                </div>

                <h3 className="mb-2.5 font-display text-lg font-semibold tracking-tight text-white">
                  {c.title}
                </h3>
                <p className="text-[13px] leading-[1.7] text-white/55">
                  {c.desc}
                </p>

                {/* bottom accent line that grows on hover */}
                <span
                  className="mt-5 block h-px w-12 origin-left bg-gradient-to-r transition-all duration-500 group-hover/card:w-24"
                  style={{
                    background: `linear-gradient(90deg, rgba(${TRAIT_COLORS[i]},0.7), transparent)`,
                  }}
                />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
