import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
} from "motion/react";
import useDeviceProfile from "../../hooks/useDeviceProfile";
import { profile } from "../../data/content";
import { EASE_OUT } from "../../lib/motion";
import { goToSection } from "../../lib/navigation";

/**
 * ── PHOTO INTRO — the cover screen ────────────────────────────────────
 * The FIRST thing a visitor sees: a cinematic duotone portrait that melts
 * into the background (no frame), a commanding statement headline on the
 * left, film grain + vignette over everything. It is fully OPAQUE, so it
 * hides the persistent 3D world behind it — the gem + rings only appear
 * once you scroll past this screen into the real Hero, and carry the rest
 * of the journey from there.
 *
 * Duotone grade + edge feather are pure CSS (blend modes + a radial mask),
 * so it costs nothing and degrades gracefully. Motion: a slow Ken-Burns,
 * pointer parallax (fine-pointer only), a load reveal, and a scroll
 * parallax hand-off. Honours reduced motion.
 */

// The cover's base tone — a steel-blue navy the cutout melts into (used for
// the bottom fade so figure + background are one surface).
const BG = "#0c1526";

/* ── Animated diagonal light streaks ──────────────────────────────────
   Thin bright rays raking across the frame on a slight angle, each drifting
   with its own gentle vertical wave — atmosphere + motion behind the copy.
   Screen-blended, low opacity; skipped under reduced motion. */
const BEAMS = [
  { top: "8%", w: "62%", dur: 11, delay: 0.0, op: 0.12 },
  { top: "26%", w: "78%", dur: 15, delay: 2.0, op: 0.08 },
  { top: "48%", w: "54%", dur: 12, delay: 3.4, op: 0.14 },
  { top: "66%", w: "70%", dur: 17, delay: 1.2, op: 0.07 },
  { top: "84%", w: "58%", dur: 13, delay: 4.0, op: 0.1 },
];

function LightStreaks({ reduce }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ mixBlendMode: "screen" }}
    >
      {/* two soft, wide light shafts for depth */}
      <div
        className="absolute -left-[10%] top-[-20%] h-[160%] w-[38%] -rotate-[20deg]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(120,160,230,0.10), transparent)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute right-[6%] top-[-25%] h-[170%] w-[30%] -rotate-[20deg]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(150,130,220,0.09), transparent)",
          filter: "blur(34px)",
        }}
      />
      {/* the raking streaks */}
      {BEAMS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px]"
          style={{
            top: b.top,
            width: b.w,
            rotate: "-20deg",
            opacity: b.op,
            filter: "blur(1px)",
            background:
              "linear-gradient(90deg, transparent, rgba(165,190,240,0.95) 45%, rgba(200,215,255,1) 55%, transparent)",
          }}
          initial={{ x: "-40%" }}
          animate={reduce ? { x: "40%" } : { x: ["-40%", "150%"], y: [0, 16, 0] }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  x: { duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.delay },
                  y: { duration: b.dur * 0.55, repeat: Infinity, ease: "easeInOut" },
                }
          }
        />
      ))}
    </div>
  );
}

// Big statement headline — last word carries the accent.
const HEADLINE = [
  { text: "I ENGINEER" },
  { text: "INTERFACES THAT" },
  { text: "FEEL" },
  { text: "ALIVE.", accent: true },
];

const CUT = "/portrait-negm-cut.webp";

function DuotonePhoto({ lite, reduce }) {
  // Parallax (whole figure drifts opposite the cursor).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 55, damping: 18, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 55, damping: 18, mass: 0.7 });
  // Cursor spotlight position within the figure (px), + a hover fade.
  const gx = useMotionValue(-999);
  const gy = useMotionValue(-999);
  const glow = useSpring(useMotionValue(0), { stiffness: 120, damping: 24 });

  const onMove = (e) => {
    if (lite) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    px.set(-nx * 16);
    py.set(-ny * 12);
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
    glow.set(1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    glow.set(0);
  };

  // The cutout's silhouette used as a mask, so effects only touch the person.
  const cutMask = {
    WebkitMaskImage: `url(${CUT})`,
    maskImage: `url(${CUT})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "bottom",
    maskPosition: "bottom",
  };

  return (
    <motion.div
      className="photo-intro-portrait absolute -bottom-[9%] right-0 aspect-[4/5] h-[58%] sm:-bottom-[6%] sm:h-[64%] md:bottom-0 md:right-[3%] md:h-[94%]
                 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      initial={reduce ? false : { scale: 1.06, opacity: 0, filter: "blur(12px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.3, ease: EASE_OUT }}
    >
      {/* slow, imperceptible breathing */}
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { scale: [1, 1.03, 1], y: [0, -7, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* steel-blue back-light halo behind the figure so it reads and its
            edges bleed into the coloured background (no hard cut) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(56% 50% at 52% 34%, rgba(96,132,196,0.34), transparent 66%)",
          }}
        />

        {/* the cutout — REAL colours, lightly graded; the drop-shadow is in
            the background hue so the silhouette dissolves rather than cuts */}
        <img
          src={CUT}
          alt="Mohamed Negm — software engineer"
          className="absolute inset-0 h-full w-full object-contain object-bottom"
          style={{
            filter:
              "contrast(1.05) saturate(1.08) brightness(1.02) drop-shadow(0 0 26px rgba(20,32,58,0.9)) drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
          }}
          decoding="async"
          fetchPriority="high"
        />

        {/* a faint steel wash tying the colours to the palette (kept low so
            the real colours stay), masked to the figure only */}
        <div aria-hidden className="absolute inset-0" style={cutMask}>
          <div
            className="absolute inset-0"
            style={{ background: "#4d6ba6", mixBlendMode: "soft-light", opacity: 0.4 }}
          />
          {/* cool shadow lift so the darks match the blue background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 40%, rgba(18,30,56,0.55) 100%)",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* ✨ cursor spotlight — a warm light that follows the mouse and lifts
            the colour/brightness where you point, on the figure only */}
        {!lite && (
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ ...cutMask, opacity: glow }}
          >
            <motion.div
              className="absolute h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: gx,
                top: gy,
                background:
                  "radial-gradient(circle, rgba(255,246,232,0.9) 0%, rgba(180,205,255,0.35) 40%, transparent 72%)",
                mixBlendMode: "soft-light",
              }}
            />
          </motion.div>
        )}

        {/* the suit dissolves down into the page — emerging from darkness */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[40%]"
          style={{ background: `linear-gradient(180deg, transparent 0%, ${BG} 94%)` }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function PhotoIntro() {
  const ref = useRef(null);
  const { tier, touch } = useDeviceProfile();
  const reduce = useReducedMotion();
  const lite = touch || tier === "low";
  const instant = reduce || lite;

  // Scroll hand-off: as the cover leaves, the photo drifts up + fades, the
  // copy lifts — so it dissolves into the Hero rather than cutting.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const photoOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const line = (i) => ({
    initial: { y: "115%" },
    animate: { y: "0%" },
    transition: { duration: 1, delay: 0.35 + i * 0.12, ease: EASE_OUT },
  });

  return (
    <section
      id="intro"
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        height: "100svh",
        // Opaque cover so the fixed 3D world stays hidden on this first screen.
        // Steel-blue base graded with a complementary violet — the cutout
        // melts into it.
        background: `
          radial-gradient(70% 60% at 82% 12%, rgba(58,96,158,0.30), transparent 60%),
          radial-gradient(60% 60% at 10% 88%, rgba(96,74,166,0.22), transparent 62%),
          linear-gradient(120deg, #0a1120 0%, ${BG} 45%, #101a30 72%, #0b1424 100%)
        `,
      }}
    >
      {/* animated diagonal light streaks */}
      <LightStreaks reduce={instant} />

      {/* the graded portrait */}
      <motion.div style={{ y: photoY, opacity: photoOpacity }} className="absolute inset-0">
        <DuotonePhoto lite={lite} reduce={instant} />
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[58%] md:hidden"
        style={{
          background: `linear-gradient(180deg, ${BG} 0%, rgba(12,22,42,0.92) 62%, transparent 100%)`,
        }}
      />

      {/* film grain + vignette over the whole frame */}
      <div
        aria-hidden
        className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 220px 40px rgba(4,6,10,0.9)" }}
      />

      {/* ── Copy (left) ── */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="photo-intro-copy relative z-10 mx-auto flex h-full w-[90%] max-w-7xl flex-col justify-start pt-[10svh] sm:pt-[11svh] md:justify-center md:pt-0"
      >
        {/* kicker */}
        <motion.div
          initial={instant ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE_OUT }}
          className="mb-4 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/60 md:mb-6 md:text-[11px] md:tracking-[0.34em]"
        >
          <span className="h-px w-10 bg-gradient-to-r from-[#aab4c4] to-transparent" />
          {profile.name} — Software Engineer
        </motion.div>

        {/* statement headline */}
        {/* The page's one and only <h1>. The visible lines are the statement;
            the visually hidden lead-in gives crawlers and screen readers the
            identity that the decorative eyebrow above carries visually. */}
        <h1 className="photo-intro-headline font-display text-[clamp(2.15rem,10.8vw,3.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.02em] md:text-[clamp(3.4rem,8vw,7.5rem)]">
          <span className="sr-only">
            {profile.name} — {profile.role}.{" "}
          </span>
          {HEADLINE.map((l, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                className={`block ${l.accent ? "text-gradient" : "text-white"}`}
                {...(instant ? {} : line(i))}
              >
                {l.text}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* tagline */}
        <motion.p
          initial={instant ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7, ease: EASE_OUT }}
          className="photo-intro-tagline mt-5 max-w-md text-sm leading-relaxed text-white/60 md:mt-7 md:text-lg"
        >
          {profile.tagline}
        </motion.p>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.button
        onClick={() => {
          goToSection("hero", { cinematic: false, offset: -20 });
        }}
        data-cursor="hover"
        initial={instant ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{ opacity: copyOpacity }}
        className="group absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/50"
        aria-label="Scroll to enter"
      >
        <span className="text-[10px] uppercase tracking-[0.34em]">Enter</span>
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-white/30 p-1 transition-colors group-hover:border-white/60">
          <motion.span
            className="h-2 w-[3px] rounded-full bg-white/60"
            animate={{ y: [0, 10, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.button>
    </section>
  );
}
