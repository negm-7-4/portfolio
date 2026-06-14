import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { sections } from "../data/sections";

const PANELS = 8;

/**
 * Cinematic navigation transition.
 *   1. Eight panels sweep up to fully cover the viewport (staggered).
 *   2. While covered, scroll jumps to the target section instantly.
 *   3. Panels sweep further up to reveal the target section.
 *
 * The cover screen shows the destination's chapter number + label so the
 * transition feels intentional rather than a flicker.
 */
export default function PageTransition() {
  const [stage, setStage] = useState("idle"); // idle → in → out
  const targetRef = useRef(null);

  useEffect(() => {
    window.__goto = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const section = sections.find((s) => s.id === id);
      targetRef.current = section || { id, num: "", label: id, color: "#aab4c4" };
      setStage("in");
      // Trim total transition by ~150ms — feels noticeably snappier.
      window.setTimeout(() => {
        if (window.__lenis) window.__lenis.scrollTo(el, { immediate: true, offset: -40 });
        else el.scrollIntoView();
        setStage("out");
      }, 500);
      window.setTimeout(() => setStage("idle"), 1100);
    };
    return () => {
      window.__goto = null;
    };
  }, []);

  const yFor = (s) => (s === "in" ? "0%" : s === "out" ? "-100%" : "100%");
  const target = targetRef.current;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9500] flex">
      {Array.from({ length: PANELS }).map((_, i) => (
        <motion.div
          key={i}
          className="h-full flex-1"
          style={{
            background:
              "linear-gradient(180deg, #1c2028 0%, #0f1218 60%, #0b0d11 100%)",
            borderRight: i < PANELS - 1 ? "1px solid rgba(255,255,255,0.02)" : "none",
          }}
          initial={{ y: "100%" }}
          animate={{ y: yFor(stage) }}
          transition={
            stage === "idle"
              ? { duration: 0 }
              : {
                  duration: 0.55,                              // 0.65 → 0.55
                  ease: [0.76, 0, 0.24, 1],
                  delay: (stage === "in" ? i : PANELS - 1 - i) * 0.038, // 0.045 → 0.038
                }
          }
        />
      ))}

      {/* Centered destination card while covered */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: stage === "in" ? 1 : 0 }}
        transition={{ duration: 0.22, delay: stage === "in" ? 0.28 : 0 }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Tiny "going to" cue */}
          <motion.span
            initial={false}
            animate={{ opacity: stage === "in" ? 1 : 0, y: stage === "in" ? 0 : -8 }}
            transition={{ duration: 0.38, delay: stage === "in" ? 0.36 : 0 }}
            className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/35"
          >
            Going to
          </motion.span>

          {/* Chapter number — animated parens */}
          {target?.num && (
            <motion.span
              initial={false}
              animate={{
                opacity: stage === "in" ? 1 : 0,
                y: stage === "in" ? 0 : 12,
              }}
              transition={{ duration: 0.48, delay: stage === "in" ? 0.4 : 0, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-base font-medium tracking-[0.18em]"
              style={{ color: target?.color || "#aab4c4" }}
            >
              <span className="text-white/30">( </span>
              {target.num}
              <span className="text-white/30"> )</span>
            </motion.span>
          )}

          {/* Big label */}
          <motion.span
            initial={false}
            animate={{
              opacity: stage === "in" ? 1 : 0,
              y: stage === "in" ? 0 : 18,
              filter: stage === "in" ? "blur(0px)" : "blur(8px)",
            }}
            transition={{ duration: 0.52, delay: stage === "in" ? 0.44 : 0, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-bold tracking-tight text-white md:text-7xl"
          >
            {target?.label || ""}
          </motion.span>

          {/* tiny moving line */}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: stage === "in" ? 1 : 0 }}
            transition={{ duration: 0.55, delay: stage === "in" ? 0.56 : 0, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 block h-px w-16 origin-left bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}
