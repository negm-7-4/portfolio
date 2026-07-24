import { useRef } from "react";
import { motion, useInView } from "motion/react";

/**
 * Creative bilingual "star" signature — نجم / Najm.
 * A five-point star draws itself, an orbit ring sweeps around it, then the
 * name resolves in English (script) and Arabic with a light shimmer.
 * "نجم" (Najm) literally means "star", so the mark and the name are one idea.
 */
export default function StarSignature({ className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15%", once: false });

  // points of a 5-point star centred at (40,40), outer r=30, inner r=12
  const starPath = (() => {
    const cx = 40, cy = 40, outer = 30, inner = 12, pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts[0]} L${pts.slice(1).join(" L")} Z`;
  })();

  return (
    <div ref={ref} className={`relative flex flex-col items-center gap-4 ${className}`}>
      <div className="flex items-center gap-5">
        {/* ── Animated star mark ── */}
        <div className="relative h-20 w-20">
          {/* orbit ring */}
          <motion.span
            className="absolute inset-0 rounded-full border border-white/15"
            animate={inView ? { rotate: 360 } : {}}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#aab4c4]" style={{ boxShadow: "0 0 10px #aab4c4" }} />
          </motion.span>

          <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full" aria-label="Najm star mark">
            <defs>
              <linearGradient id="star-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#aab4c4" />
                <stop offset="100%" stopColor="#6f7c8c" />
              </linearGradient>
            </defs>
            {/* glow fill that fades in after the stroke draws */}
            <motion.path
              d={starPath}
              fill="url(#star-grad)"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={inView ? { opacity: 0.18, scale: 1 } : { opacity: 0, scale: 0.6 }}
              transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "40px 40px", filter: "drop-shadow(0 0 12px rgba(170,180,196,0.6))" }}
            />
            {/* drawn outline */}
            <motion.path
              d={starPath}
              fill="none"
              stroke="url(#star-grad)"
              strokeWidth="2"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
        </div>

        {/* ── Bilingual wordmark ── */}
        <div className="flex flex-col leading-none">
          {/* Arabic */}
          <motion.span
            dir="rtl"
            lang="ar"
            initial={{ opacity: 0, x: 18, filter: "blur(6px)" }}
            animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ delay: 1.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl"
            style={{ textShadow: "0 0 30px rgba(170,180,196,0.25)" }}
          >
            نجم
          </motion.span>
          {/* English script */}
          <motion.span
            initial={{ opacity: 0, x: -18 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 1.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-1 overflow-hidden bg-gradient-to-r from-white via-[#c8d2dd] to-[#8a93a6] bg-clip-text font-display text-2xl font-light italic tracking-wide text-transparent md:text-3xl"
          >
            Najm
            {/* shimmer sweep */}
            <motion.span
              aria-hidden
              className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              initial={{ x: "-150%" }}
              animate={inView ? { x: "150%" } : {}}
              transition={{ delay: 2.1, duration: 1.1, ease: "easeInOut" }}
              style={{ mixBlendMode: "overlay" }}
            />
          </motion.span>
        </div>
      </div>

      {/* tiny caption */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.4, duration: 0.6 }}
        className="text-[9px] uppercase tracking-[0.4em] text-white/50"
      >
        Signed · نجم · Najm
      </motion.p>
    </div>
  );
}
