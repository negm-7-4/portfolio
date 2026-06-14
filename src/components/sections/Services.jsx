import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import { services } from "../../data/content";

/* ─── Decorative shape per service (right edge of each row) ─── */
const SHAPES = [
  // 4-point star
  (
    <svg viewBox="0 0 60 60" className="h-12 w-12 md:h-16 md:w-16">
      <path
        d="M30 4 L34 26 L56 30 L34 34 L30 56 L26 34 L4 30 L26 26 Z"
        fill="rgba(255,255,255,0.45)"
      />
    </svg>
  ),
  // amorphous blob
  (
    <svg viewBox="0 0 60 60" className="h-12 w-12 md:h-16 md:w-16">
      <path
        d="M30 6 C44 6 56 16 54 30 C52 42 42 52 30 54 C18 52 6 44 8 30 C10 18 18 8 30 6 Z"
        fill="rgba(255,255,255,0.42)"
      />
    </svg>
  ),
  // octagon
  (
    <svg viewBox="0 0 60 60" className="h-12 w-12 md:h-16 md:w-16">
      <path
        d="M20 4 L40 4 L56 20 L56 40 L40 56 L20 56 L4 40 L4 20 Z"
        fill="rgba(255,255,255,0.4)"
      />
    </svg>
  ),
  // diamond / squircle
  (
    <svg viewBox="0 0 60 60" className="h-12 w-12 md:h-16 md:w-16">
      <path
        d="M30 4 C46 14 56 24 56 30 C56 36 46 46 30 56 C14 46 4 36 4 30 C4 24 14 14 30 4 Z"
        fill="rgba(255,255,255,0.4)"
      />
    </svg>
  ),
];

/* ─── Single accordion row ─── */
function ServiceRow({ s, i, isOpen, onHover }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => onHover(i)}
      onFocus={() => onHover(i)}
      onClick={() => onHover(isOpen ? -1 : i)}
      data-cursor="hover"
      className="group relative border-t border-white/10 last:border-b"
    >
      {/* hover sheen sweeping across the row */}
      <motion.span
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-white/70 to-transparent"
        initial={false}
        animate={{ scaleX: isOpen ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* soft gradient background when active */}
      <motion.span
        className="pointer-events-none absolute inset-x-0 inset-y-0 origin-top"
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "linear-gradient(180deg, rgba(170,180,196,0.04) 0%, transparent 100%)",
        }}
      />

      {/* row header */}
      <div className="relative grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-6 px-2 py-7 md:py-10">
        {/* ( NN ) — animates color when active */}
        <motion.span
          initial={false}
          animate={{ color: isOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)" }}
          className="font-display text-2xl font-medium tracking-[0.12em] md:text-3xl"
        >
          <span className="text-white/35">( </span>
          {s.num}
          <span className="text-white/35"> )</span>
        </motion.span>

        {/* title — shifts right slightly when active */}
        <motion.h3
          initial={false}
          animate={{ x: isOpen ? 12 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl font-bold leading-none tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          {s.title}
        </motion.h3>

        {/* decorative shape — rotates & scales on active */}
        <motion.span
          initial={false}
          animate={{
            rotate: isOpen ? 90 : 0,
            scale: isOpen ? 1.15 : 1,
            opacity: isOpen ? 1 : 0.55,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="block"
        >
          {SHAPES[i % SHAPES.length]}
        </motion.span>
      </div>

      {/* expandable description + sub-points */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pb-10 pl-2 pr-2 md:grid-cols-[28%_1fr] md:pl-14">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-sm leading-[1.8] text-white/55 md:text-[15px]"
              >
                {s.desc}
              </motion.p>

              <ul className="flex flex-col">
                {s.points.map((p, pi) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + pi * 0.08, duration: 0.45 }}
                    className="group/sub relative flex items-center gap-4 border-b border-white/10 py-3 md:py-4"
                  >
                    {/* animated underline that draws on row-hover */}
                    <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white/40 transition-transform duration-500 group-hover/sub:scale-x-100" />
                    <span className="font-display text-xs font-bold tracking-widest text-[#aab4c4]">
                      {String(pi + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-base font-semibold text-white md:text-lg">
                      {p}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Section ─── */
export default function Services() {
  const [open, setOpen] = useState(0); // first row expanded by default

  return (
    <section id="services" className="relative w-full overflow-hidden py-32 md:py-44">
      {/* ambient orb */}
      <motion.div
        className="pointer-events-none absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #aab4c4 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.18, 1], x: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="02" eyebrow="Services" title="What I" accent="Do" />

        <div onMouseLeave={() => setOpen(0)}>
          {services.map((s, i) => (
            <ServiceRow
              key={s.num}
              s={s}
              i={i}
              isOpen={open === i}
              onHover={setOpen}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
