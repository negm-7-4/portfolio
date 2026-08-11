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

// Two-tone grade. Cool steel-blue to match the site. Shadows are set to the
// EXACT page background so the photo's dark areas ARE the background — no
// seam. (Swap DUO_HI for a warm tone like "#e23b3b" + DUO_LO "#160709" for
// the red cinematic look — the only change needed is the colour.)
const BG = "#080b12"; // the cover's base — the photo melts into this
const DUO_LO = BG; // shadows sink into the background (identical tone)
const DUO_HI = "#aab4c4"; // highlights take the accent

// Feather the photo into the background: a wide horizontal ramp (dissolves
// the left/text side completely) intersected with a soft top/bottom fade.
// Result: no visible edge — photo and background read as one graded surface.
const MASK_H =
  "linear-gradient(90deg, transparent 0%, transparent 24%, rgba(0,0,0,0.55) 50%, #000 74%)";
const MASK_V =
  "linear-gradient(180deg, transparent 0%, #000 16%, #000 82%, transparent 100%)";
const MASK = {
  WebkitMaskImage: `${MASK_H}, ${MASK_V}`,
  WebkitMaskComposite: "source-in",
  maskImage: `${MASK_H}, ${MASK_V}`,
  maskComposite: "intersect",
};

// Big statement headline — last word carries the accent.
const HEADLINE = [
  { text: "I ENGINEER" },
  { text: "INTERFACES THAT" },
  { text: "FEEL", },
  { text: "ALIVE.", accent: true },
];

function DuotonePhoto({ lite, reduce }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  const onMove = (e) => {
    if (lite) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    px.set(-nx * 18); // shift opposite the cursor for depth
    py.set(-ny * 14);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      className="absolute inset-0"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={MASK}
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: sx, y: sy }}
        initial={reduce ? false : { scale: 1.14, opacity: 0, filter: "blur(14px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
      >
        {/* Ken-Burns wrapper — slow, imperceptible breathing zoom. */}
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { scale: [1.02, 1.09, 1.02], x: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* base grayscale photo — kept bright so the face reads clearly */}
          <img
            src="/portrait-negm.jpg"
            alt="Mohamed Negm — software engineer"
            className="absolute inset-0 h-full w-full object-cover object-[62%_22%]"
            style={{ filter: "grayscale(1) contrast(1.08) brightness(1.06)" }}
            decoding="async"
            fetchPriority="high"
          />
          {/* TRUE DUOTONE: `color` blend keeps the photo's luminance (face
              visible) but takes the hue of a shadow→highlight gradient, so
              darks go steel-navy and lights go silver-blue. */}
          <div
            className="absolute inset-0"
            style={{
              mixBlendMode: "color",
              opacity: 0.9,
              background: `linear-gradient(135deg, ${DUO_LO} 0%, #4a5a72 42%, ${DUO_HI} 78%, #dfe6f0 100%)`,
            }}
          />
          {/* deepen the shadow side toward the page tone so the merge with
              the background is seamless (no visible photo boundary) */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, ${BG} 8%, transparent 55%)` }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PhotoIntro() {
  const ref = useRef(null);
  const { tier, touch } = useDeviceProfile();
  const reduce = useReducedMotion();
  const lite = touch || tier === "low";

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
        // Base tone == the photo's shadow tone, so the two are seamless.
        background: `linear-gradient(90deg, #070a10 0%, ${BG} 52%, #0b1119 100%)`,
      }}
    >
      {/* the graded portrait */}
      <motion.div style={{ y: photoY, opacity: photoOpacity }} className="absolute inset-0">
        <DuotonePhoto lite={lite} reduce={reduce} />
      </motion.div>

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
        className="relative z-10 mx-auto flex h-full w-[90%] max-w-7xl flex-col justify-center"
      >
        {/* kicker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE_OUT }}
          className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/60"
        >
          <span className="h-px w-10 bg-gradient-to-r from-[#aab4c4] to-transparent" />
          {profile.name} — Software Engineer
        </motion.div>

        {/* statement headline */}
        <h1
          className="font-display font-bold uppercase leading-[0.92] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.6rem, 8vw, 7.5rem)" }}
        >
          {HEADLINE.map((l, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                className={`block ${l.accent ? "text-gradient" : "text-white"}`}
                {...(reduce ? {} : line(i))}
              >
                {l.text}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7, ease: EASE_OUT }}
          className="mt-7 max-w-md text-base leading-relaxed text-white/60 md:text-lg"
        >
          {profile.tagline}
        </motion.p>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.button
        onClick={() => {
          const el = document.getElementById("hero");
          if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -20 });
          else el?.scrollIntoView({ behavior: "smooth" });
        }}
        data-cursor="hover"
        initial={{ opacity: 0 }}
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
