import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useRef, useState, useEffect } from "react";
import SplineRobot from "../SplineRobot";
import MagneticButton from "../ui/MagneticButton";
import MagneticText from "../ui/MagneticText";
import { celebrate } from "../../lib/confetti";
import { profile, heroTags } from "../../data/content";

const ROLES = [
  "Front-End Developer",
  "React Specialist",
  "Motion Designer",
  "CS & AI Student",
];

/* ─── Cycling typewriter for the role line ─── */
function TypewriterRole() {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing");
  const [idx, setIdx] = useState(0);
  const word = ROLES[idx];

  useEffect(() => {
    if (reduce) return; // honour "reduce motion" — show a static role instead
    let t;
    if (phase === "typing") {
      if (text.length < word.length) {
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), 90);
      } else {
        t = setTimeout(() => setPhase("erasing"), 1600);
      }
    } else if (phase === "erasing") {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), 45);
      } else {
        setIdx((i) => (i + 1) % ROLES.length);
        setPhase("waiting");
      }
    } else {
      t = setTimeout(() => setPhase("typing"), 400);
    }
    return () => clearTimeout(t);
  }, [text, phase, word, reduce]);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-[#aab4c4] mr-3">✦</span>
      <span className="font-display font-semibold tracking-tight text-white">
        {reduce ? ROLES[0] : text}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse", ease: "steps(1)" }}
          className="ml-1 inline-block h-[0.95em] w-[3px] translate-y-[0.05em] rounded-sm bg-[#aab4c4] align-middle"
        />
      </span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Multi-layer parallax — spring-smoothed so it doesn't feel jittery on Lenis
  const sScroll = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const yText  = useTransform(sScroll, [0, 1], [0, -180]);
  const yDecor = useTransform(sScroll, [0, 1], [0,  -90]);
  const yRobot = useTransform(sScroll, [0, 1], [0,   60]);
  const opacity = useTransform(sScroll, [0, 0.7], [1, 0]);
  const scale   = useTransform(sScroll, [0, 0.6], [1, 0.92]);
  const robotRotate = useTransform(sScroll, [0, 1], [0, -8]);
  const robotScale  = useTransform(sScroll, [0, 1], [1, 0.88]);

  const scrollDown = () => {
    if (window.__goto) return window.__goto("about");
    const el = document.getElementById("about");
    window.__lenis?.scrollTo(el, { offset: -40 });
  };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full min-h-[100svh] pt-28 pb-28 md:pt-40 md:pb-32"
      style={{ overflow: "visible" }}
    >
      {/* ── Ambient decorations ──────────────────────────────────── */}
      <motion.div
        style={{ y: yDecor }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #aab4c4 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.16, 1], rotate: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-16 bottom-[18%] h-72 w-72 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #6f7c8c 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* spinning ring top-left */}
        <motion.div
          className="absolute left-[6%] top-[26%] h-24 w-24 rounded-full border border-white/[0.08]"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#aab4c4]/70" style={{ boxShadow: "0 0 8px rgba(170,180,196,0.6)" }} />
        </motion.div>
        {/* small cross */}
        <motion.div
          className="absolute right-[20%] bottom-[28%] opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-px w-12 bg-white/50" />
          <div className="absolute left-1/2 top-1/2 h-12 w-px -translate-x-1/2 -translate-y-1/2 bg-white/50" />
        </motion.div>
      </motion.div>

      {/* ── Main content grid ───────────────────────────────────── */}
      <div className="mx-auto grid w-[90%] sm:w-[88%] max-w-7xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-4">

        {/* LEFT: copy */}
        <motion.div style={{ y: yText, opacity, scale }} className="z-10">
          {/* Available status pill */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="group/pill mb-6 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 transition-all duration-300 hover:bg-white/[0.08] hover:tracking-[0.32em]"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 32px rgba(74,222,128,0.06)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400"
                style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }}
              />
            </span>
            <span className="text-green-400/90">Available</span>
            <span className="text-white/25">·</span>
            <span>For New Projects</span>
          </motion.div>

          {/* Hi there I'm */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 flex items-center gap-3"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-10 origin-left bg-gradient-to-r from-white/40 to-transparent"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
              Hi there, I&apos;m
            </span>
          </motion.div>

          {/* MASSIVE NAME — locked single line per word */}
          <h1
            className="font-display font-bold leading-[0.88] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 7rem)",
              textShadow: "0 0 40px rgba(170,180,196,0.10)",
            }}
          >
            <span className="block overflow-hidden whitespace-nowrap">
              <motion.span
                className="block whitespace-nowrap"
                initial={{ y: "110%", rotate: 4, filter: "blur(8px)" }}
                animate={{ y: 0, rotate: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <MagneticText text={profile.firstName} radius={180} strength={24} />
              </motion.span>
            </span>
            <span className="block overflow-hidden whitespace-nowrap">
              <motion.span
                className="block whitespace-nowrap italic font-light text-gradient"
                initial={{ y: "110%", rotate: -3, filter: "blur(8px)" }}
                animate={{ y: 0, rotate: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
              >
                <MagneticText text={profile.lastName} radius={180} strength={24} />
              </motion.span>
            </span>
          </h1>

          {/* Role typewriter — bigger */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-2xl md:text-3xl"
          >
            <TypewriterRole />
          </motion.div>

          {/* tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-base leading-relaxed text-white/55 md:text-lg"
          >
            {profile.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.18, duration: 0.6 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <MagneticButton
              onClick={(e) => {
                celebrate(e.clientX, e.clientY);
                window.__goto?.("projects");
              }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-white px-7 py-4 text-sm font-semibold text-black shadow-[0_18px_36px_-12px_rgba(255,255,255,0.35)]"
            >
              {/* Shimmer sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <span className="relative">View My Work</span>
              <motion.span
                className="relative inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </MagneticButton>

            <MagneticButton
              onClick={(e) => {
                celebrate(e.clientX, e.clientY, "#aab4c4");
                window.__goto?.("contact");
              }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl glass px-7 py-4 text-sm font-semibold text-white"
            >
              {/* Light sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <span className="relative">Get In Touch</span>
              <span className="relative text-white/55 transition-colors group-hover:text-white">↗</span>
            </MagneticButton>
          </motion.div>

          {/* tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8"
          >
            <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30">
              Crafting with
            </p>
            <ul className="flex flex-wrap gap-2">
              {heroTags.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, scale: 0.75, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.06, type: "spring", stiffness: 180, damping: 14 }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  data-cursor="hover"
                  className="group/tag relative inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 text-xs text-white/65 transition-colors hover:text-white"
                >
                  <span className="text-[#aab4c4] transition-transform duration-300 group-hover/tag:rotate-90">◇</span>
                  {t}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* RIGHT: robot — Spline's vertical FOV is fixed, so we widen the
            canvas (aspect ratio > 1) so the camera renders extra horizontal
            space for the arm-swing animation. Outer wrapper handles the
            scroll layer; inner div extends well past its parent's bounds on
            BOTH sides. overflow:visible at every level lets the limbs render
            freely. */}
        <motion.div
          style={{ y: yRobot, rotate: robotRotate, scale: robotScale, overflow: "visible" }}
          className="relative h-[560px] w-full md:h-[820px] md:-mt-10"
        >
          <div
            className="absolute inset-y-0 -left-24 -right-24 md:-left-40 md:-right-40 lg:-left-56 lg:-right-56"
            style={{ overflow: "visible" }}
          >
            <SplineRobot />
          </div>
        </motion.div>
      </div>

      {/* ── Scroll cue ──────────────────────────────────────────── */}
      <motion.button
        onClick={scrollDown}
        data-cursor="hover"
        data-cursor-text="Down"
        style={{ opacity }}
        className="group absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.6 }}
      >
        {/* tiny pulsing accent dot at the top */}
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1 w-1 rounded-full bg-[#aab4c4]"
        />

        <motion.span
          className="text-[10px] uppercase tracking-[0.32em]"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Scroll
        </motion.span>

        {/* Mouse outline with falling dot */}
        <span
          className="relative flex h-9 w-5 justify-center rounded-full border border-white/30 p-1 transition-all duration-300 group-hover:border-white/60 group-hover:bg-white/[0.04]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
        >
          <motion.span
            className="h-2 w-[3px] rounded-full bg-white/60 transition-colors duration-300 group-hover:bg-white"
            animate={{ y: [0, 10, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>

        {/* tiny down arrow flickering */}
        <motion.span
          animate={{ y: [0, 3, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="text-[8px]"
        >
          ▾
        </motion.span>
      </motion.button>

    </section>
  );
}
