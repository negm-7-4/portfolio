import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { services } from "../../data/content";

/**
 * Pinned horizontal-scroll capabilities gallery — scrolling DOWN sweeps the
 * service panels sideways. Distinct content from the Projects scrollytelling
 * (no duplication): a cinematic "what I can do for you" interlude.
 *
 * Travel distance is MEASURED (ResizeObserver) so it lines up on any screen.
 * `SCROLL_FACTOR < 1` means a little vertical scroll covers more sideways
 * distance → feels fast. Transform-only → rides Lenis, holds 60fps.
 * A plain <div> (not <section>) avoids the global full-width section padding.
 */

const ACCENTS = ["#aab4c4", "#8a93a6", "#9c958c", "#b8c4d6"];

// Decorative spinning glyph per panel.
const SHAPES = [
  "M30 4 L34 26 L56 30 L34 34 L30 56 L26 34 L4 30 L26 26 Z",          // 4-point star
  "M30 6 C44 6 56 16 54 30 C52 42 42 52 30 54 C18 52 6 44 8 30 C10 18 18 8 30 6 Z", // blob
  "M20 4 L40 4 L56 20 L56 40 L40 56 L20 56 L4 40 L4 20 Z",            // octagon
  "M30 4 C46 14 56 24 56 30 C56 36 46 46 30 56 C14 46 4 36 4 30 C4 24 14 14 30 4 Z", // squircle
];

// How "fast" the sideways sweep is relative to vertical scroll (<1 = faster).
const SCROLL_FACTOR = 0.88;

export default function CapabilitiesGallery() {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(track);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(xRaw, { stiffness: 130, damping: 30, mass: 0.35 });

  const height = distance ? `calc(100vh + ${distance * SCROLL_FACTOR}px)` : "100vh";

  return (
    <div id="gallery" ref={wrapRef} className="relative" style={{ height }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* heading — stays put while the track sweeps */}
        <div className="mx-auto mb-8 flex w-[90%] max-w-7xl items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/65">( ✦ )</span>
              <span className="h-px w-12 bg-gradient-to-r from-white/40 to-transparent" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">Capabilities</span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl">
              How I <span className="text-gradient italic font-light">can help</span>
            </h2>
          </div>

          <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
              Scroll
              <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>→</motion.span>
            </span>
            <span className="relative block h-px w-40 overflow-hidden bg-white/10">
              <motion.span
                style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                className="absolute inset-0 bg-gradient-to-r from-[#8a93a6] via-[#aab4c4] to-white"
              />
            </span>
          </div>
        </div>

        {/* horizontal track */}
        <motion.div
          ref={trackRef}
          style={{ x, willChange: "transform" }}
          className="flex gap-6 px-[6vw] md:gap-8"
        >
          {services.map((s, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <article
                key={s.num}
                className="gradient-border group relative flex h-[64vh] w-[84vw] shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:w-[60vw] md:p-11 lg:w-[44vw]"
              >
                {/* accent glow */}
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-[0.16] blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                  style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
                  aria-hidden
                />

                {/* big ghost number */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-6 top-2 select-none font-display font-bold leading-none tracking-tighter"
                  style={{ fontSize: "clamp(6rem, 13vw, 12rem)", color: "rgba(255,255,255,0.05)", textShadow: `0 0 70px ${accent}40` }}
                >
                  {s.num}
                </span>

                {/* spinning decorative glyph */}
                <span className="spin-slower pointer-events-none absolute right-7 top-7 block h-14 w-14 opacity-50 md:h-16 md:w-16" aria-hidden>
                  <svg viewBox="0 0 60 60" className="h-full w-full">
                    <path d={SHAPES[i % SHAPES.length]} fill={`${accent}55`} />
                  </svg>
                </span>

                {/* live scan beam */}
                <div
                  className="scan-beam pointer-events-none absolute inset-x-0 top-0 h-16 opacity-[0.05]"
                  style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent)" }}
                  aria-hidden
                />

                {/* content (bottom-anchored) */}
                <div className="relative">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${accent}dd` }}>
                    Service / {s.num}
                  </span>
                  <h3 className="mt-3 font-display font-bold leading-[0.98] tracking-tight text-white" style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)" }}>
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[14px] leading-[1.75] text-white/55 md:text-[15px]">
                    {s.desc}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2.5">
                    {s.points.map((pt, pi) => (
                      <li key={pt} className="flex items-center gap-3 text-sm font-medium text-white/80">
                        <span
                          className="font-display text-[10px] font-bold tracking-widest"
                          style={{ color: accent }}
                        >
                          {String(pi + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="block h-px w-6 transition-all duration-500 group-hover:w-10"
                          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                        />
                        {pt}
                      </li>
                    ))}
                  </ul>

                  {/* bottom accent line */}
                  <span
                    className="mt-7 block h-px w-16 origin-left transition-all duration-500 group-hover:w-28"
                    style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                  />
                </div>
              </article>
            );
          })}

          {/* closer card */}
          <div className="flex h-[64vh] w-[64vw] shrink-0 flex-col items-center justify-center gap-4 sm:w-[42vw] lg:w-[30vw]">
            <span className="spin-slower font-display text-3xl text-[#aab4c4]">✦</span>
            <p className="max-w-[16rem] text-center text-[12px] uppercase leading-relaxed tracking-[0.28em] text-white/60">
              Got something in mind?
            </p>
            <button
              onClick={() => window.__goto?.("contact")}
              data-cursor="hover"
              className="rounded-full border border-white/15 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              Let&apos;s talk →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
