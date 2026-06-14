import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "../../data/content";

/**
 * Floating WhatsApp action button, bottom-right corner.
 * - Pulsing brand-color halo to draw attention without being annoying.
 * - On hover: lifts, tooltip slides in with a quick reply.
 * - On first show: delayed entrance + a single attention bounce.
 * - Hides on mobile keyboards (when an input is focused & viewport is short).
 */

// Normalize the phone number for wa.me: digits only, no +/spaces
const waNumber = profile.phone.replace(/[^\d]/g, "");
const WA_URL = `https://wa.me/${waNumber}?text=${encodeURIComponent(
  "Hi Mohamed — just visited your portfolio."
)}`;

function WhatsAppGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.52 3.48A11.86 11.86 0 0012.05 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.27-1.64a11.94 11.94 0 005.78 1.47h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.49-8.41zM12.06 21.78h-.01a9.88 9.88 0 01-5.04-1.38l-.36-.22-3.72.98 1-3.63-.24-.37a9.83 9.83 0 01-1.51-5.22c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.98 2.89a9.81 9.81 0 012.89 6.99c0 5.45-4.43 9.84-9.87 9.84zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.57-.49-.49-.66-.5l-.56-.01a1.08 1.08 0 00-.78.37c-.27.3-1.03 1-1.03 2.44 0 1.43 1.05 2.82 1.2 3.02.15.2 2.06 3.14 5 4.4.7.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.76-.72 2-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.34z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Delayed entrance after the preloader finishes
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // Hide if user focuses any input/textarea on a short viewport (mobile keyboard)
  useEffect(() => {
    const onFocusChange = () => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      const short = window.innerHeight < 600;
      setHidden(typing && short);
    };
    document.addEventListener("focusin", onFocusChange);
    document.addEventListener("focusout", onFocusChange);
    return () => {
      document.removeEventListener("focusin", onFocusChange);
      document.removeEventListener("focusout", onFocusChange);
    };
  }, []);

  return (
    <AnimatePresence>
      {mounted && !hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 30, transition: { duration: 0.22 } }}
          transition={{ type: "spring", stiffness: 320, damping: 20, mass: 0.7 }}
          className="fixed bottom-6 right-6 z-[8500] md:bottom-8 md:right-8"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Tooltip card — slides in from the right on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.88 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.92, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.55 }}
                className="pointer-events-none absolute right-[72px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-[rgba(15,18,24,0.92)] px-4 py-2.5 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <p className="font-display text-sm font-semibold tracking-tight text-white">
                  Chat on WhatsApp
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Usually replies fast
                </p>
                {/* arrow */}
                <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-white/10 bg-[rgba(15,18,24,0.92)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulsing halo behind the button */}
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full bg-[#25d366]"
            animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            aria-hidden
          />
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full bg-[#25d366]"
            animate={{ scale: [1, 2, 1], opacity: [0.18, 0, 0.18] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            aria-hidden
          />

          {/* The button itself */}
          <motion.a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            data-cursor-text="Chat"
            aria-label="Chat on WhatsApp"
            whileHover={{ scale: 1.1, rotate: -8 }}
            whileTap={{ scale: 0.92, rotate: 4 }}
            // little attention-grab bounce on first appearance
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0, -3, 0] }}
            transition={{ duration: 1.4, delay: 0.4, times: [0, 0.25, 0.5, 0.75, 1] }}
            className="group/wa relative flex h-14 w-14 items-center justify-center rounded-full text-white md:h-16 md:w-16"
            style={{
              background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "0 18px 36px -8px rgba(37,211,102,0.55), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {/* shimmer sweep on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full overflow-hidden rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 ease-out group-hover/wa:translate-x-full"
            />

            <span className="relative">
              <WhatsAppGlyph size={30} />
            </span>

            {/* tiny "live" status dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-60" />
              <span
                className="relative inline-flex h-3 w-3 rounded-full bg-white"
                style={{ boxShadow: "0 0 0 2px #0b0d11, 0 0 8px rgba(255,255,255,0.8)" }}
              />
            </span>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
