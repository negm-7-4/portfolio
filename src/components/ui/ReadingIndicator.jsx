import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useTransform } from "motion/react";
import { useActiveSection } from "../../hooks/useActiveSection";
import { sections } from "../../data/sections";

/**
 * Floating "now reading" pill — bottom-center of the viewport. Reads the
 * progress motion value via useTransform / useMotionValueEvent so it
 * never re-renders on scroll (only on section change).
 */
export default function ReadingIndicator() {
  const { active, index, progress } = useActiveSection();
  const [visible, setVisible] = useState(false);

  // Toggle visibility based on motion-value events, not React state per scroll
  useMotionValueEvent(progress, "change", (p) => {
    const shouldShow = active.id !== "hero" && p > 0.02;
    if (shouldShow !== visible) setVisible(shouldShow);
  });

  useEffect(() => {
    setVisible(active.id !== "hero" && progress.get() > 0.02);
  }, [active.id, progress, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.94, transition: { duration: 0.22 } }}
          transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.55 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[45] hidden -translate-x-1/2 lg:block"
          aria-hidden
        >
          <div
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/[0.10] bg-[rgba(15,18,24,0.82)] px-4 py-2 backdrop-blur-md"
            style={{
              boxShadow:
                "0 18px 40px -10px rgba(0,0,0,0.55), 0 0 32px rgba(170,180,196,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-[10px]"
              style={{ color: active.accent }}
            >
              ✦
            </motion.span>

            <span className="font-display text-[10px] font-semibold tracking-[0.3em] text-white/55">
              ( {active.num} )
            </span>

            <div className="relative h-4 min-w-[80px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active.id}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{    y: -14, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-0 whitespace-nowrap text-[12px] font-medium tracking-wide text-white/85"
                >
                  {active.label}
                </motion.span>
              </AnimatePresence>
            </div>

            <span className="h-3 w-px bg-white/15" />

            <div className="flex items-center gap-1">
              {sections.map((s, i) => {
                const isHere = i === index;
                const past   = i < index;
                return (
                  <motion.span
                    key={s.id}
                    initial={false}
                    animate={{
                      width: isHere ? 12 : 4,
                      backgroundColor: isHere
                        ? s.accent
                        : past
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.12)",
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-[3px] rounded-full"
                  />
                );
              })}
            </div>

            {/* progress percentage — subscribes directly to motion value */}
            <PctText progress={progress} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PctText({ progress }) {
  const pct = useTransform(progress, (v) => `${String(Math.round(v * 100)).padStart(3, "0")}%`);
  return (
    <span className="ml-1 font-display text-[10px] font-semibold tracking-widest tabular-nums text-white/50">
      <motion.span>{pct}</motion.span>
    </span>
  );
}
