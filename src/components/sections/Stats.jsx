import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const stats = [
  { value: 15,  suffix: "+", label: "Projects shipped",   note: "From dashboards to 3D web." },
  { value: 2,   suffix: "+", label: "Years coding",       note: "Daily craft & continuous learning." },
  { value: 12,  suffix: "+", label: "Technologies",       note: "React, Three.js, motion & more." },
  { value: 100, suffix: "%", label: "Passion",            note: "Always. Without exception." },
];

export default function Stats() {
  const root = useRef(null);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start end", "end start"],
  });
  // long subtle drift across the section
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  useEffect(() => {
    // Defer GSAP import until the Stats section is actually about to mount —
    // saves ~115 KB on initial paint and pushes it to a lazy chunk.
    let ctx;
    let canceled = false;
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (canceled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const nums = gsap.utils.toArray(".stat-num");
        nums.forEach((el) => {
          const target = Number(el.dataset.value);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 2.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "restart none restart none",
            },
            onUpdate: () => { el.textContent = Math.floor(obj.v); },
          });
        });
      }, root);
    })();
    return () => { canceled = true; ctx?.revert(); };
  }, []);

  return (
    <section
      ref={root}
      className="relative w-full overflow-hidden py-24 md:py-40"
    >
      {/* gradient drift */}
      <motion.div
        style={{ y: bgY }}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
      >
        <div className="mx-auto mt-12 h-[400px] w-2/3 rounded-full bg-[radial-gradient(circle,#8a93a6_0%,transparent_70%)]" />
      </motion.div>

      <div className="mx-auto w-[90%] max-w-7xl">
        {/* tiny lead-in */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center gap-4"
        >
          <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/45">
            ( • )
          </span>
          <span className="h-px w-14 bg-gradient-to-r from-white/40 to-white/0" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
            By the numbers
          </span>
        </motion.div>

        {/* Single row of MASSIVE stats — divider lines between */}
        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:divide-x md:divide-white/[0.07] md:gap-y-0">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col items-start px-4 md:px-8"
            >
              {/* tiny stat marker — index */}
              <span className="mb-3 font-display text-[10px] font-semibold tracking-[0.3em] text-white/25">
                / 0{i + 1}
              </span>

              {/* huge number with subtle glow behind */}
              <div
                className="relative flex items-baseline font-display font-bold leading-[0.8] tracking-tighter tabular-nums text-white"
                style={{
                  fontSize: "clamp(3.5rem, 8vw, 7.5rem)",
                  textShadow: "0 0 24px rgba(170,180,196,0.12)",
                }}
              >
                {/* soft halo behind the number — pulses subtly */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-4 rounded-full blur-2xl"
                  animate={{ opacity: [0.22, 0.34, 0.22] }}
                  transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: "radial-gradient(circle, rgba(170,180,196,0.4), transparent 70%)" }}
                />
                <span className="stat-num relative text-gradient" data-value={s.value}>0</span>
                <span className="relative text-gradient">{s.suffix}</span>

                {/* faint orbit dot in upper-right of each number */}
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12 + i, repeat: Infinity, ease: "linear" }}
                  className="ml-2 hidden h-3 w-3 md:block"
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-[#aab4c4]" />
                </motion.span>
              </div>

              {/* label */}
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65 md:text-xs">
                {s.label}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/35">
                {s.note}
              </p>

              {/* hover underline that grows + accent dot at the end */}
              <div className="mt-4 flex items-center gap-2">
                <span className="block h-[1px] w-12 origin-left bg-white/25 transition-all duration-500 group-hover:w-24 group-hover:bg-white/55" />
                <span className="block h-1 w-1 rounded-full bg-white/15 transition-all duration-500 group-hover:scale-150 group-hover:bg-[#aab4c4]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
