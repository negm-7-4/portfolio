import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * One-time keyboard-shortcut hint. Slides in after 3.5s and
 * disappears once the user presses any arrow key, or after 12s.
 */
export default function KeyboardHint() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), 3500);
    const t2 = setTimeout(() => setShow(false), 12000);
    const onKey = (e) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
        setShow(false);
        setDismissed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener("keydown", onKey);
    };
  }, [dismissed]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: -16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, x: -16, scale: 0.94 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed bottom-24 left-6 z-[50] hidden items-center gap-3 rounded-full glass px-4 py-2.5 text-[11px] uppercase tracking-[0.25em] text-white/70 md:flex"
          style={{
            boxShadow:
              "0 18px 36px -10px rgba(0,0,0,0.55), 0 0 24px rgba(170,180,196,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* pulsing tip indicator */}
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-[#aab4c4]"
          >
            ✦
          </motion.span>
          <span className="text-white/60">Tip</span>
          <span className="h-3 w-px bg-white/15" />
          <motion.kbd
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 font-display text-white"
          >←</motion.kbd>
          <motion.kbd
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 font-display text-white"
          >→</motion.kbd>
          <span className="text-white/55">to navigate</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
