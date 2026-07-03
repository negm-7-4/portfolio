import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import BrowserFrame from "../ui/BrowserFrame";
import ScrubReveal from "../ui/ScrubReveal";
import WebGLImage from "../ui/WebGLImage";
import { celebrate } from "../../lib/confetti";
import { projects } from "../../data/content";
import useWorldDye from "./useWorldDye";

/**
 * The original Projects presentation, preserved verbatim: a two-column
 * scrollytelling gallery — sticky info on the left, a stack of browser-
 * framed previews on the right. Kept as its own showcase mode so the
 * config variable can always fall back to the battle-tested layout.
 */

/* ─── Sticky left column — number + info that changes with active project ─── */
function StickyInfo({ p, idx, total }) {
  const url = (p.github || "").replace(/https?:\/\//, "");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={p.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* mega ghost number */}
        <span
          aria-hidden
          className="block select-none font-display leading-[0.78] tracking-tighter"
          style={{
            fontSize: "clamp(7rem, 17vw, 16rem)",
            color: "rgba(255,255,255,0.08)",
            textShadow: `0 0 80px ${p.color}40`,
          }}
        >
          {idx}.
        </span>

        <div className="relative -mt-6 md:-mt-12">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="block font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: `${p.color}cc` }}
          >
            ( {idx} / {String(total).padStart(2, "0")} )  ·  {p.category}
          </motion.span>

          <motion.h3
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tight text-white md:text-5xl"
          >
            {p.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mt-4 max-w-md text-[14px] leading-[1.7] text-white/55"
          >
            {p.desc}
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex flex-wrap gap-2"
          >
            {p.tech.map((t, ti) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.32 + ti * 0.04 }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-wide text-white/65 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
              >
                {t}
              </motion.li>
            ))}
          </motion.ul>

          <motion.a
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            data-cursor-text="Open"
            onClick={(e) => celebrate(e.clientX, e.clientY, p.color)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.45 }}
            whileHover={{ x: 4 }}
            className="group/cta mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white"
          >
            <span>View on GitHub</span>
            <span className="relative block h-[1px] w-12 overflow-hidden bg-white/30">
              <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover/cta:scale-x-100" />
            </span>
            <span>↗</span>
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/30"
          >
            {url}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── The gallery ─── */
export default function ClassicShowcase() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const slotRefs = useRef([]);

  // While the gallery is on screen, the active project takes over the world:
  // its brand colour dyes the section light + morph field, and the camera
  // dollies laterally across the scene as you move from project to project.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "-15% 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useWorldDye(active, inView);

  // Track which project slot is most visible on the right
  useEffect(() => {
    const els = slotRefs.current.filter(Boolean);
    if (!els.length) return;

    const ratios = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(Number(e.target.dataset.idx), e.intersectionRatio);
        }
        let bestIdx = 0;
        let bestRatio = -1;
        for (const [i, r] of ratios) {
          if (r > bestRatio) { bestRatio = r; bestIdx = i; }
        }
        setActive(bestIdx);
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "-30% 0px -30% 0px",
      }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  const padded = (i) => String(i + 1).padStart(2, "0");

  return (
    <div ref={ref} className="relative mx-auto w-[90%] max-w-7xl">
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[600px] opacity-[0.06]"
        aria-hidden
      >
        <div className="mx-auto h-full w-[80%] rounded-full bg-[radial-gradient(circle,#8a93a6_0%,transparent_70%)]" />
      </motion.div>

      {/* progress pill — shows how far you are through the projects */}
      <div className="mb-12 flex items-center justify-center gap-3">
        {projects.map((p, i) => (
          <button
            key={p.title}
            onClick={() => slotRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            data-cursor="hover"
            className="group flex items-center gap-2"
            aria-label={`Go to project ${i + 1}`}
          >
            <motion.span
              animate={{
                width: active === i ? 28 : 8,
                backgroundColor: active === i ? p.color : "rgba(255,255,255,0.2)",
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block h-[2px] rounded-full"
            />
          </button>
        ))}
      </div>

      {/* ── Two-column scrollytelling ── */}
      <div className="grid grid-cols-1 gap-x-10 md:grid-cols-12">
        {/* LEFT: sticky info — sticky on the column itself, self-start so it doesn't stretch */}
        <aside className="md:col-span-5 md:sticky md:top-28 md:self-start">
          <StickyInfo
            p={projects[active]}
            idx={padded(active)}
            total={projects.length}
          />
        </aside>

        {/* RIGHT: stack of browser-framed previews — this scrolls */}
        <div className="mt-12 flex flex-col gap-24 md:col-span-7 md:col-start-6 md:mt-0 md:gap-40">
          {projects.map((p, i) => {
            const url = (p.github || "").replace(/https?:\/\//, "");
            return (
              <div
                key={p.title}
                ref={(el) => (slotRefs.current[i] = el)}
                data-idx={i}
                className="relative"
              >
                <ScrubReveal tilt={i % 2 === 0 ? 6 : -6}>
                  <BrowserFrame url={url} accent={p.color}>
                    {p.image ? (
                      <WebGLImage src={p.image} alt={p.title} />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${p.color}22 0%, transparent 100%)` }}
                      >
                        <div className="text-center">
                          <p
                            className="font-display text-7xl font-bold tracking-tight"
                            style={{ color: `${p.color}55` }}
                          >
                            {p.title.split(" ").map((w) => w[0]).join("")}
                          </p>
                          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/30">
                            preview · soon
                          </p>
                        </div>
                      </div>
                    )}
                  </BrowserFrame>
                </ScrubReveal>

                {/* mobile-only inline label */}
                <p className="mt-4 text-center text-[11px] uppercase tracking-[0.3em] text-white/40 md:hidden">
                  {padded(i)} · {p.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
