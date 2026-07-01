import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { burst } from "../../lib/confetti";

/**
 * Konami code easter egg: ↑ ↑ ↓ ↓ ← → ← → B A
 * Activating it:
 *   - Flashes a centered "DEVELOPER MODE" banner.
 *   - Triggers a fireworks confetti finale.
 *   - Adds a `data-dev` flag on <html> for any future styling hooks.
 * Press the sequence again to disable.
 */
const SEQ = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let progress = 0;
    let timer;

    const reset = () => { progress = 0; };

    const onKey = (e) => {
      // Ignore while typing
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      const want = SEQ[progress];
      const got = e.key;
      const match =
        want === got ||
        (want.toLowerCase() === got.toLowerCase() && want.length === 1);

      if (match) {
        progress += 1;
        // Reset progress if no further input within 2.5s
        clearTimeout(timer);
        timer = setTimeout(reset, 2500);

        if (progress === SEQ.length) {
          progress = 0;
          setActive((a) => !a);
        }
      } else {
        progress = 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);

  // Side effects when activation flips
  useEffect(() => {
    document.documentElement.setAttribute("data-dev", active ? "true" : "false");
    if (active) {
      setShow(true);
      // Multi-burst fireworks
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const colors = ["#aab4c4", "#ffffff", "#8a93a6", "#dfe3ea"];
      burst(cx, cy, { particleCount: 120, spread: 120, colors, scalar: 1.2 });
      setTimeout(() => burst(cx * 0.4, cy, { particleCount: 60, spread: 90, colors }), 220);
      setTimeout(() => burst(cx * 1.6, cy, { particleCount: 60, spread: 90, colors }), 380);
      setTimeout(() => burst(cx, cy * 0.5, { particleCount: 80, spread: 140, colors }), 540);
      setTimeout(() => setShow(false), 3200);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-[10001] flex items-center justify-center"
        >
          <div
            className="relative rounded-3xl border border-white/15 bg-[rgba(15,18,24,0.88)] px-12 py-10 text-center backdrop-blur-2xl"
            style={{
              boxShadow:
                "0 60px 120px -20px rgba(0,0,0,0.7), 0 0 80px rgba(170,180,196,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-white/40" />
            <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-white/40" />
            <span className="pointer-events-none absolute left-3 bottom-3 h-3 w-3 border-l border-b border-white/40" />
            <span className="pointer-events-none absolute right-3 bottom-3 h-3 w-3 border-r border-b border-white/40" />

            {/* slowly rotating accent ring behind everything */}
            <motion.span
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-6 rounded-full border border-dashed border-white/[0.06]"
            >
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[#aab4c4]"
                style={{ boxShadow: "0 0 8px rgba(170,180,196,0.8)" }}
              />
            </motion.span>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <p className="mb-2 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/45">
                <span className="block h-1 w-1 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
                {active ? "Unlocked" : "Locked"}
              </p>
              <motion.p
                animate={{ backgroundPosition: ["0% center", "250% center"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="font-display text-3xl font-bold tracking-tight md:text-5xl"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, #b8c4d6 0%, #ffffff 35%, #aab4c4 50%, #ffffff 65%, #8a93a6 100%)",
                  backgroundSize: "250% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Developer Mode
              </motion.p>
              <p className="mt-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.32em] text-white/55">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="inline-block text-[#aab4c4]"
                >✦</motion.span>
                Welcome, fellow code wanderer
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="inline-block text-[#aab4c4]"
                >✦</motion.span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
