"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useProgress } from "@react-three/drei";
import { profile } from "@/lib/content";

const MIN_MS = 1900; // ensure the reveal has room to breathe

/**
 * Cinematic preloader. A large live percentage counter over an atmospheric
 * field, blending real asset progress (drei useProgress) with a minimum
 * on-screen time so the reveal always lands. Fades into the world at 100%.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const { progress, active } = useProgress();
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(performance.now());
  const raf = useRef(0);

  useEffect(() => {
    const tick = () => {
      const elapsed = performance.now() - start.current;
      const timed = Math.min(100, (elapsed / MIN_MS) * 100);
      // displayed value chases the slower of real-vs-timed, easing up
      const target = active ? Math.min(progress, timed) : Math.min(100, Math.max(progress, timed));
      setShown((v) => {
        const next = v + (target - v) * 0.12;
        return next > 99.4 ? 100 : next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [progress, active]);

  useEffect(() => {
    if (shown >= 99.9 && !done && performance.now() - start.current >= MIN_MS) {
      setDone(true);
      const t = setTimeout(onDone, 900); // let the exit animation play
      return () => clearTimeout(t);
    }
  }, [shown, done, onDone]);

  const pct = Math.round(shown);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#05060a]"
      initial={{ opacity: 1 }}
      animate={done ? { opacity: 0, filter: "blur(12px)", scale: 1.04 } : { opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.83, 0, 0.17, 1] }}
      style={{ pointerEvents: done ? "none" : "auto" }}
    >
      {/* breathing aura */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[60vmin] w-[60vmin] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(126,147,200,0.18), transparent 60%)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col items-center">
        <motion.span
          className="kicker mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {profile.name}
        </motion.span>

        <div className="font-display text-[18vw] font-bold leading-none tracking-tighter text-gradient sm:text-[14vw] md:text-[140px]">
          {pct}
          <span className="align-top text-[0.35em] text-muted">%</span>
        </div>

        {/* progress line */}
        <div className="mt-8 h-px w-[42vw] max-w-sm overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-steel to-ice"
            style={{ width: `${shown}%` }}
          />
        </div>

        <motion.span
          className="mt-6 text-xs uppercase tracking-[0.35em] text-faint"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Entering the world
        </motion.span>
      </div>
    </motion.div>
  );
}
