import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";

/**
 * Floating "back to top" button in the bottom-left corner.
 * - Hidden until the user has scrolled past 50% of the first viewport.
 * - Shows a circular SVG progress ring around the arrow indicating
 *   how far through the page the user is.
 * - On click: smooth-scrolls to the very top using Lenis if available.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  // ring fill (0 → 1) proportional to page progress
  const ringDash = useTransform(scrollYProgress, [0, 1], [283, 0]);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 30, transition: { duration: 0.22 } }}
          transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.6 }}
          onClick={goTop}
          data-cursor="hover"
          data-cursor-text="Top"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="group fixed bottom-6 left-6 z-[8500] hidden h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[rgba(15,18,24,0.85)] text-white backdrop-blur-md md:flex md:bottom-8 md:left-8 md:h-16 md:w-16"
          style={{
            boxShadow:
              "0 18px 36px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
          aria-label="Scroll to top"
        >
          {/* outer pulsing halo (only on hover) */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(circle, rgba(170,180,196,0.5), transparent 70%)" }}
          />

          {/* progress ring */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 -rotate-90"
            aria-hidden
          >
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="url(#bttGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="283"
              style={{
                strokeDashoffset: ringDash,
                filter: "drop-shadow(0 0 4px rgba(170,180,196,0.6))",
              }}
            />
            <defs>
              <linearGradient id="bttGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#aab4c4" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>

          {/* up arrow with continuous bounce + percentage on hover */}
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex flex-col items-center transition-opacity duration-300 group-hover:opacity-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </motion.span>

          {/* hover label */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-semibold uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
