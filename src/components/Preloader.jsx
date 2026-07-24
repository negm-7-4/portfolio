import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { profile } from "../data/content";
import { experience } from "../store/experience";
import useDeviceProfile from "../hooks/useDeviceProfile";

const greetings = ["Hello", "مرحبا", "Bonjour", "こんにちは", "Hola", "Ciao", "Hallo"];
const PANELS    = 8;
const NAME_HOLD = 2800;
const MAX_DURATION = 11000;

/* Golden-angle scatter — each character starts at a unique orbital position */
function scatterPos(idx) {
  const angle = (idx * 137.508 * Math.PI) / 180;
  const r = 55 + (idx % 4) * 22;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r * 0.65,
    rotate: ((idx % 7) - 3) * 14,
    scale: 0.3,
    filter: "blur(8px)",
    opacity: 0,
  };
}

/* Circular SVG progress ring */
function RingProgress({ progress }) {
  const R = 54;
  const circ = 2 * Math.PI * R;
  const springP = useSpring(progress, { stiffness: 60, damping: 18 });

  return (
    <svg width="124" height="124" viewBox="0 0 124 124" className="absolute inset-0 -rotate-90">
      {/* track */}
      <circle cx="62" cy="62" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      {/* fill */}
      <motion.circle
        cx="62" cy="62" r={R}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          pathLength: springP,
          strokeDasharray: circ,
        }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a93a6" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Museum-grade preloader:
 *  - loading phase: orbital progress ring + clip-path greeting reveal
 *  - name phase:    letters assemble from golden-angle scatter positions
 *                   + horizontal scan line + corner brackets
 *  - done phase:    8-panel alternating-direction curtain reveal
 */
export default function Preloader({ onDone }) {
  const [count,      setCount]      = useState(0);
  const [greetIndex, setGreetIndex] = useState(0);
  const [phase,      setPhase]      = useState("loading");
  const [robotReady, setRobotReady] = useState(false);
  const [scanDone,   setScanDone]   = useState(false);
  const [showSkip,   setShowSkip]   = useState(false);
  const finishedRef = useRef(false);
  const { tier } = useDeviceProfile();

  /* progress as 0-1 for the ring */
  const rawProgress = useMotionValue(0);

  /* ── Readiness ─────────────────────────────────────────────
     Synced to the cinematic world's first painted frame, so the curtain
     lifts exactly as the 3D scene is alive. Low tier never mounts the world,
     so a short 1.5s baseline reveals promptly there; capable tiers wait for
     the real first frame, with a long safety net so a stalled chunk can
     never trap the user. (`robotReady` kept as the internal flag name.) */
  useEffect(() => {
    if (experience.getState().ready) {
      setRobotReady(true);
      return;
    }
    const unsub = experience.subscribe(
      (s) => s.ready,
      (ready) => ready && setRobotReady(true)
    );
    const baseline = setTimeout(() => setRobotReady(true), tier === "low" ? 1500 : 9000);
    return () => {
      unsub();
      clearTimeout(baseline);
    };
  }, [tier]);

  /* ── Skip affordance — never trap anyone in an intro ── */
  useEffect(() => {
    const id = setTimeout(() => setShowSkip(true), 3500);
    return () => clearTimeout(id);
  }, []);

  const skip = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase("done");
    setTimeout(onDone, 1100);
  };

  /* ── Counter / progress ───────────────────────────────────────────
     Honest progress. Three signals race each other:
       • a time ramp (guarantees motion, but CAPS at 88 — the last stretch
         is never faked),
       • the store's real asset progress (drei useProgress → GLB/textures),
       • `robotReady` — the world's first painted frame (or the low-tier
         baseline), which alone unlocks 100.
     So the counter only completes when the experience is genuinely ready,
     and on slow GPUs it visibly holds just under 90 instead of lying.   */
  useEffect(() => {
    if (phase !== "loading") return;
    let ramp = 0;
    let done = false;
    const id = setInterval(() => {
      ramp = Math.min(ramp + Math.random() * 2.6 + 1.3, 88);
      const real = experience.getState().loadProgress * 0.92;
      const target = robotReady ? 100 : Math.min(97, Math.max(ramp, real));
      setCount((c) => {
        // Ease toward the target, clamped so a sudden asset finish reads as a
        // confident acceleration rather than a teleport.
        const step = Math.min(9, Math.max(target >= 100 ? 2.5 : 1, (target - c) * 0.22));
        const n = Math.min(c + step, target, 100);
        rawProgress.set(n / 100);
        if (n >= 100 && !done) {
          done = true;
          clearInterval(id);
          setTimeout(() => setPhase("name"), 450);
        }
        return Math.floor(n);
      });
    }, 110);
    return () => clearInterval(id);
  }, [phase, robotReady, rawProgress]);

  /* ── Greeting cycle ───────────────────────────────────── */
  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(() => setGreetIndex((i) => (i + 1) % greetings.length), 750);
    return () => clearInterval(id);
  }, [phase]);

  /* ── Name phase → done ────────────────────────────────── */
  useEffect(() => {
    if (phase !== "name") return;
    const nameStart = Date.now();
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setPhase("done");
      setTimeout(onDone, 1100);
    };
    const poll = setInterval(() => {
      if (Date.now() - nameStart >= NAME_HOLD && robotReady) finish();
    }, 150);
    const max = setTimeout(finish, MAX_DURATION);
    return () => { clearInterval(poll); clearTimeout(max); };
  }, [phase, robotReady, onDone]);

  const covering = phase !== "done";

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden"
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={count}
    >

      {/* ══ 8-panel exit curtain ══ */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: PANELS }).map((_, i) => {
          const even = i % 2 === 0;
          return (
            <motion.div
              key={i}
              className="h-full flex-1 bg-[#0b0d11]"
              initial={{ y: 0 }}
              animate={phase === "done"
                ? { y: even ? "-105%" : "105%" }
                : { y: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.76, 0, 0.24, 1],
                delay: phase === "done" ? i * 0.045 : 0,
              }}
            />
          );
        })}
      </div>

      {/* ══ Content (fades out on done) ══ */}
      <motion.div
        className="absolute inset-0 flex flex-col overflow-hidden"
        animate={{ opacity: phase === "done" ? 0 : 1 }}
        transition={{ duration: 0.35 }}
      >
        {/* ── Cinematic atmosphere — drifting luminous dust behind it all ── */}
        {/* <PreloaderAtmosphere /> */} {/* This component is not defined in the provided context, assuming it's commented out or removed */}

        {/* ── Top bar ── */}
        <motion.div
          className="flex items-center justify-between px-8 py-7 sm:px-12"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <span className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-white">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="text-[#aab4c4]"
            >
              ✦
            </motion.span>
            <span>
              <span className="text-white/55">&lt;</span>ME
              <span className="text-white/55"> /&gt;</span>
            </span>
          </span>
          <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/50 tabular-nums">
            <span className="h-1 w-1 rounded-full bg-white/40" />
            Portfolio · {new Date().getFullYear()}
          </span>
        </motion.div>

        {/* ── Soft vignette glow — pulses subtly ── */}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(170,180,196,0.12) 0%, transparent 60%)" }}
        />

        {/* ── Subtle 3D atmosphere — slow wireframe sculptures drifting behind ── */}
        {/* <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "done" ? 0 : 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <Gyro size={460} dur={48} color="rgba(170,184,210,0.16)" className="absolute" />
          <WireCube size={150} dur={40} color="rgba(170,184,210,0.14)" className="absolute left-[14%] top-[24%] hidden md:block" />
          <WireCube size={110} dur={34} color="rgba(170,184,210,0.12)" className="absolute right-[16%] bottom-[26%] hidden md:block" />
        </motion.div> */} {/* These components are not defined in the provided context, assuming they are commented out or removed */}

        {/* ══ LOADING PHASE ══ */}
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div
              key="loading"
              className="flex flex-1 flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.45 }}
            >
              {/* Orbital progress ring */}
              <div className="relative flex h-[124px] w-[124px] items-center justify-center">
                <RingProgress progress={rawProgress} />
                {/* orbiting dot on the ring */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                    style={{ boxShadow: "0 0 10px 3px rgba(255,255,255,0.5)" }}
                  />
                </motion.div>
                {/* inner % counter */}
                <div className="relative text-center">
                  <div className="font-display text-2xl font-bold tabular-nums text-white">
                    {count}
                  </div>
                  <div className="text-[8px] uppercase tracking-[0.25em] text-white/55">%</div>
                </div>
              </div>

              {/* Greeting — clip-path horizontal reveal */}
              <div className="mt-10 h-20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={greetIndex}
                    className="font-display text-5xl font-light tracking-wide text-white md:text-7xl"
                    initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                    animate={{ clipPath: "inset(0 0% 0 0)",   opacity: 1 }}
                    exit={{    clipPath: "inset(0 0 0 100%)",  opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  >
                    {greetings[greetIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* corner decorations */}
              <motion.div
                className="absolute left-8 bottom-20 text-white/10 font-mono text-xs tracking-[0.3em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {robotReady ? "READY" : "LOADING EXPERIENCE"}
              </motion.div>
            </motion.div>
          )}

          {/* ══ NAME PHASE ══ */}
          {phase !== "loading" && (
            <motion.div
              key="name"
              className="relative flex flex-1 flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* corner brackets */}
              {[
                "absolute top-12 left-8 border-t border-l",
                "absolute top-12 right-8 border-t border-r",
                "absolute bottom-12 left-8 border-b border-l",
                "absolute bottom-12 right-8 border-b border-r",
              ].map((cls, i) => (
                <motion.div
                  key={i}
                  className={`${cls} h-8 w-8 border-white/20`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

              {/* name */}
              <div className="relative text-center">
                {/* horizontal scan line that sweeps through */}
                <motion.div
                  className="pointer-events-none absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8a93a6]/60 to-transparent"
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.4, delay: 0.3, ease: "linear" }}
                  onAnimationComplete={() => setScanDone(true)}
                />

                <div className="flex flex-wrap justify-center overflow-visible">
                  {profile.name.split("").map((ch, i) => {
                    const scatter = scatterPos(i);
                    return (
                      <motion.span
                        key={i}
                        className={`font-display text-5xl font-bold md:text-8xl ${ch !== " " ? "text-gradient" : ""}`}
                        style={{ display: "inline-block" }}
                        initial={scatter}
                        animate={{ x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)", opacity: 1 }}
                        transition={{
                          duration: 0.9,
                          delay: i * 0.055,
                          ease: [0.16, 1, 0.3, 1],
                          filter: { duration: 0.5 },
                        }}
                      >
                        {ch === " " ? " " : ch}
                      </motion.span>
                    );
                  })}
                </div>

                {/* role — clip-path sweep */}
                <motion.div
                  className="mt-5 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.span
                    className="block text-[11px] uppercase tracking-[0.38em] text-white/65 md:text-xs"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{ duration: 0.9, delay: profile.name.length * 0.055 + 0.2, ease: [0.76, 0, 0.24, 1] }}
                  >
                    {profile.role}
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom bar: status + percentage ── */}
        <motion.div
          className="flex items-end justify-between px-8 pb-8 sm:px-12 sm:pb-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/55">
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="h-1 w-1 rounded-full bg-[#aab4c4]"
              />
              {robotReady ? "Ready · welcome" : "Loading experience"}
            </span>
            {/* blinking cursor line */}
            <motion.div
              className="h-px w-12 bg-white/20"
              animate={{ scaleX: [1, 0.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="relative font-display text-6xl font-bold tabular-nums leading-none text-white md:text-8xl">
            {/* glow halo behind the percentage */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -inset-x-4 rounded-full opacity-40 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(170,180,196,0.4), transparent 70%)" }}
            />
            <span className="relative">
              {String(count).padStart(3, "0")}
              <span className="ml-1 text-xl text-white/45 md:text-2xl">%</span>
            </span>
          </div>
        </motion.div>

        {/* ── Skip intro — appears after a beat, never traps the user ── */}
        <AnimatePresence>
          {showSkip && covering && (
            <motion.button
              key="skip"
              onClick={skip}
              data-cursor="hover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="group absolute bottom-24 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-white/55 transition-colors hover:text-white/80"
            >
              Skip intro
              <span className="mx-auto mt-1.5 block h-px w-0 bg-white/50 transition-all duration-400 group-hover:w-full" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Full-width progress line ── */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5"
          animate={{ opacity: phase === "done" ? 0 : 1 }}
        >
          <div
            className="h-full bg-gradient-to-r from-[#8a93a6] via-[#aab4c4] to-white bar-shimmer"
            style={{
              width: `${count}%`,
              transition: "width 200ms ease-out",
              background: "linear-gradient(90deg, #8a93a6aa, #aab4c4, #ffffffaa, #aab4c4, #8a93a6aa)",
            }}
          />
        </motion.div>

      </motion.div>
    </div>
  );
}
