import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import TechIcon from "../ui/TechIcon";
import useMagneticPull from "../../hooks/useMagneticPull";
import { skillCategories } from "../../data/content";

/* ─── Flatten all categories into one wall, mark featured items ─── */
const FEATURED = new Set(["React", "Next.js", "Tailwind CSS", "Three.js", "Framer Motion"]);

const WALL = skillCategories.flatMap((cat) =>
  cat.items.map((it) => ({ ...it, cat: cat.label, featured: FEATURED.has(it.name) }))
);

/* ─── Single floating tech tile — varies in size, cursor-reactive ─── */
function TechTile({ item, i }) {
  // Cursor magnetic pull — all tiles share ONE rAF loop and cached rects
  const { ref, sx, sy, srx, sry } = useMagneticPull({
    radius: 260,
    strength: 18,
    tiltStrength: 12,
    springStiffness: 170,
    springDamping: 20,
  });

  // Unique float values for each tile
  const dur   = 4 + ((i * 0.7) % 4);
  const delay = (i * 0.4) % 5;
  const amp   = 8 + ((i * 3) % 12);

  const isBig = item.featured;
  const size = isBig ? "h-44 w-44 md:h-56 md:w-56" : "h-32 w-32 md:h-40 md:w-40";
  const iconSize = isBig ? 78 : 52;
  const textSize = isBig ? "text-xl md:text-2xl" : "text-sm md:text-base";

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      initial={{ opacity: 0, scale: 0.35, rotate: -90, y: 60 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      viewport={{ once: false, margin: "-10%" }}
      transition={{
        delay: i * 0.045,
        duration: 0.95,
        type: "spring",
        stiffness: 95,
        damping: 14,
      }}
      whileHover={{ scale: 1.12, zIndex: 10 }}
      data-cursor="hover"
      data-cursor-text={item.name}
      className="group relative inline-flex flex-shrink-0"
    >
      <motion.div
        animate={{ y: [0, -amp, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
        className="relative"
      >
        {/* outer brand-color glow halo */}
        <span
          className="pointer-events-none absolute -inset-10 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${item.color}99 0%, transparent 60%)` }}
        />

        {/* rotating dashed ring */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ border: `1px dashed ${item.color}65` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />

        {/* tile body */}
        <motion.div
          className={`relative z-10 flex flex-col items-center justify-center rounded-3xl ${size}`}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.1), 0 24px 50px rgba(0,0,0,0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* tiny corner brackets — subtle premium detail */}
          <span className="pointer-events-none absolute left-2 top-2 h-2 w-2 border-l border-t border-white/20" />
          <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 border-r border-t border-white/20" />
          <span className="pointer-events-none absolute left-2 bottom-2 h-2 w-2 border-l border-b border-white/20" />
          <span className="pointer-events-none absolute right-2 bottom-2 h-2 w-2 border-r border-b border-white/20" />

          {/* icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.55 }}
          >
            <TechIcon name={item.icon} color={item.color} size={iconSize} />
          </motion.div>

          {/* name */}
          <span
            className={`mt-3 font-display font-semibold tracking-tight text-white/85 transition-colors duration-300 group-hover:text-white ${textSize}`}
          >
            {item.name}
          </span>

          {/* tiny category badge (only on featured) */}
          {isBig && (
            <span className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-white/35">
              {item.cat}
            </span>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Section ─── */
export default function Skills() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY1   = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const bgY2   = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const bgY3   = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const titleY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const wallTilt = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -4]);

  return (
    <section
      id="skills"
      ref={ref}
      className="relative w-full py-32 md:py-48"
      style={{ minHeight: "100vh" }}
    >
      {/* faint dot-grid pattern in the background */}
      <div
        aria-hidden
        className="bg-dots pointer-events-none absolute inset-0 opacity-50"
        style={{ maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }}
      />

      {/* ── Layered ambient nebula ───────────────────────────── */}
      <motion.div
        style={{ y: bgY1 }}
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[15%] h-[560px] w-[560px] rounded-full opacity-[0.08]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#8a93a6_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: bgY2 }}
        aria-hidden
        className="pointer-events-none absolute right-[6%] bottom-[10%] h-[460px] w-[460px] rounded-full opacity-[0.07]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#b8c4d6_0%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ y: bgY3 }}
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[35%] h-[320px] w-[320px] -translate-x-1/2 rounded-full opacity-[0.05]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,#aab4c4_0%,transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto w-[92%] max-w-7xl">
        {/* ── Cinematic header ── */}
        <motion.div style={{ y: titleY }} className="mb-24 text-center md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/45">
              ( 03 )
            </span>
            <span className="h-px w-14 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
              Toolkit
            </span>
            <span className="h-px w-14 bg-gradient-to-r from-white/40 via-white/40 to-transparent" />
          </motion.div>

          <h2 className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display font-bold leading-[0.85] tracking-tight">
            <motion.span
              initial={{ opacity: 0, scale: 0.3 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-[#aab4c4]"
              style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ✦
              </motion.span>
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 100, rotate: 6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-white"
              style={{ fontSize: "clamp(3.5rem, 11vw, 11rem)" }}
            >
              MY
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 100, rotate: -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block italic font-light bar-shimmer"
              style={{
                fontSize: "clamp(3.5rem, 11vw, 11rem)",
                backgroundImage: "linear-gradient(110deg, #b8c4d6 0%, #ffffff 35%, #8a93a6 50%, #ffffff 65%, #6f7c8c 100%)",
                backgroundSize: "250% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              STACK
            </motion.span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mx-auto mt-8 max-w-xl text-base text-white/45 md:text-lg"
          >
            Every tool I reach for, floating in one constellation.
          </motion.p>
        </motion.div>

        {/* ── The constellation wall — single flowing arrangement, no dividers ── */}
        <motion.div
          style={{ rotateX: wallTilt, transformPerspective: 1600 }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-14 md:gap-x-16 md:gap-y-20"
        >
          {WALL.map((item, i) => (
            <TechTile key={item.name} item={item} i={i} />
          ))}
        </motion.div>

        {/* tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-24 flex items-center justify-center gap-5 md:mt-32"
        >
          <span className="h-px w-16 bg-white/15" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
            and always learning more
          </span>
          <span className="h-px w-16 bg-white/15" />
        </motion.div>
      </div>
    </section>
  );
}
