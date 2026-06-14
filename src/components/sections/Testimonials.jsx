import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import { testimonials } from "../../data/content";

/* ─── Stars ─── */
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 14 }}
          className="text-base text-[#aab4c4]"
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

/* ─── Big featured quote — one at a time ─── */
function FeaturedQuote({ t }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={t.name}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* giant decorative quote mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-12 -left-4 select-none font-display leading-none text-white/[0.05]"
          style={{ fontSize: "clamp(8rem, 14vw, 16rem)" }}
        >
          “
        </span>

        <div className="relative">
          <Stars count={t.rating} />

          <p
            className="mt-6 font-display font-light leading-[1.25] text-white/90"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.8rem)" }}
          >
            <span className="italic">{t.quote}</span>
          </p>

          {/* author */}
          <div className="mt-10 flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-widest text-white"
              style={{
                background: "rgba(170,180,196,0.15)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {t.initials}
            </motion.div>
            <div>
              <p className="font-display text-base font-semibold text-white">
                — {t.name}
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                {t.role}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Section ─── */
export default function Testimonials() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  const [active, setActive] = useState(0);
  const total = testimonials.length;

  const go = (dir) => setActive((a) => (a + dir + total) % total);

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative w-full py-32 md:py-44"
    >
      {/* ambient orbs */}
      <motion.div
        style={{ y: bgY1 }}
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full opacity-[0.05]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#8a93a6_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: bgY2 }}
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-1/4 h-[320px] w-[320px] rounded-full opacity-[0.04]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#6f7c8c_0%,transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto w-[90%] max-w-6xl">
        <SectionHeading num="07" eyebrow="Kind Words" title="What Clients" accent="Say" />

        {/* Two-column: featured quote left, list right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
          {/* LEFT — current featured quote */}
          <div className="min-h-[380px] md:min-h-[420px]">
            <FeaturedQuote t={testimonials[active]} />
          </div>

          {/* RIGHT — list of clickable testimonial heads */}
          <div className="flex flex-col gap-2">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/35">
              From the inbox · {String(total).padStart(2, "0")}
            </p>

            {testimonials.map((t, i) => {
              const isActive = i === active;
              return (
                <motion.button
                  key={t.name}
                  onClick={() => setActive(i)}
                  data-cursor="hover"
                  data-cursor-text="Read"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-10%" }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
                  whileHover={{ x: 6 }}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300 ${
                    isActive
                      ? "border-white/30 bg-white/[0.04]"
                      : "border-white/[0.06] bg-transparent hover:border-white/15 hover:bg-white/[0.02]"
                  }`}
                >
                  {/* active indicator bar */}
                  <motion.span
                    initial={false}
                    animate={{
                      scaleY: isActive ? 1 : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-1/2 h-8 w-[2px] -translate-y-1/2 origin-center rounded-r bg-[#aab4c4]"
                  />

                  {/* mini avatar */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-widest text-white"
                    style={{
                      background: isActive
                        ? "rgba(170,180,196,0.25)"
                        : "rgba(170,180,196,0.10)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {t.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-display text-sm font-semibold transition-colors ${
                        isActive ? "text-white" : "text-white/65"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="truncate text-[10px] uppercase tracking-[0.25em] text-white/35">
                      {t.role}
                    </p>
                  </div>

                  <span className="font-display text-[10px] font-bold tracking-widest text-white/30">
                    0{i + 1}
                  </span>
                </motion.button>
              );
            })}

            {/* prev/next controls */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => go(-1)}
                data-cursor="hover"
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/50 hover:text-white"
                aria-label="Previous testimonial"
              >
                <motion.span whileHover={{ x: -2 }}>←</motion.span>
              </button>
              <button
                onClick={() => go(1)}
                data-cursor="hover"
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/50 hover:text-white"
                aria-label="Next testimonial"
              >
                <motion.span whileHover={{ x: 2 }}>→</motion.span>
              </button>
              <span className="ml-2 font-display text-xs tabular-nums text-white/40">
                {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
