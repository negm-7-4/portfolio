import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActiveSection } from "../../hooks/useActiveSection";

/**
 * "Now entering" chapter banner. When the active section changes, this
 * flashes the new chapter's number + name across the top of the viewport
 * in that section's color, then fades. Skips the very first paint to
 * avoid a hello banner on initial load.
 */
export default function ChapterIntro() {
  const { active } = useActiveSection();
  const [shown, setShown] = useState(null);
  const firstMount = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    setShown(active);
    clearTimeout(timerRef.current);
    // Slightly shorter dwell — less time on-screen feels snappier
    timerRef.current = setTimeout(() => setShown(null), 1500);
    return () => clearTimeout(timerRef.current);
  }, [active]);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-20 z-[30] flex justify-center px-4">
      <AnimatePresence mode="wait">
        {shown && (
          <motion.div
            key={shown.id}
            initial={{ opacity: 0, y: -28, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 rounded-full bg-black/50 px-5 py-2.5 backdrop-blur-md"
            style={{
              border: `1px solid ${shown.color}55`,
              boxShadow: `0 0 50px ${shown.color}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
            }}
          >
            {/* spinning accent ring */}
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="relative h-3 w-3"
            >
              <span className="absolute inset-0 rounded-full border" style={{ borderColor: `${shown.color}80` }} />
              <span
                className="absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: shown.color, boxShadow: `0 0 6px ${shown.color}` }}
              />
            </motion.span>

            <span
              className="font-display text-[11px] font-semibold uppercase tracking-[0.4em] tabular-nums"
              style={{ color: shown.color }}
            >
              Ch · {shown.num}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="text-[12px] font-semibold tracking-widest text-white">
              {shown.label}
            </span>
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: shown.accent, boxShadow: `0 0 8px ${shown.accent}` }}
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
