import { motion, useReducedMotion } from "motion/react";

const orbitDots = [18, 42, 66, 88];

export default function NotFound() {
  const reduce = useReducedMotion();

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0b0d11] px-6 py-16 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(108,123,255,0.18), transparent 34%), radial-gradient(circle at 20% 85%, rgba(154,123,255,0.12), transparent 30%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 0.7px, transparent 0.7px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-8 flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full border border-white/10"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            {orbitDots.map((position, index) => (
              <span
                key={position}
                className="absolute h-1.5 w-1.5 rounded-full bg-[#aab4c4]"
                style={{ left: `${position}%`, top: `${(position * 1.7 + index * 11) % 100}%`, boxShadow: "0 0 12px #aab4c4" }}
              />
            ))}
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute inset-7 rounded-full border border-dashed border-white/10"
            animate={reduce ? undefined : { rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-14 rounded-full bg-[#6c7bff]/15 blur-2xl" aria-hidden />
          <span className="relative font-display text-7xl font-semibold tracking-[-0.08em] sm:text-8xl">404</span>
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.65 }}
          className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#aab4c4]"
        >
          Coordinates not found
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.7 }}
          className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          This page drifted out of orbit.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.65 }}
          className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/48 sm:text-base"
        >
          The link may have moved, but the work is still here. Return to the portfolio and pick up the journey from the beginning.
        </motion.p>
        <motion.a
          href="/"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.6 }}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-0.5"
        >
          Return home <span aria-hidden>→</span>
        </motion.a>
      </div>
    </main>
  );
}
