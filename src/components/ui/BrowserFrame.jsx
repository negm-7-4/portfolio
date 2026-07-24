import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Realistic browser chrome wrapper. Tilts on scroll (cinematic), floats
 * gently, and tilts toward the cursor on hover for a tactile feel.
 * Holds any child as the "page" inside the chrome.
 */
export default function BrowserFrame({
  children,
  url = "",
  accent = "#8a93a6",
  float = true,
  tilt = true,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scroll-driven base parallax
  const y     = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rot   = useTransform(scrollYProgress, [0, 0.5, 1], [tilt ? 6 : 0, 0, tilt ? -6 : 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.96]);

  // Cursor-reactive tilt on hover
  const hx = useMotionValue(0);
  const hy = useMotionValue(0);
  const shx = useSpring(hx, { stiffness: 240, damping: 22, mass: 0.5 });
  const shy = useSpring(hy, { stiffness: 240, damping: 22, mass: 0.5 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width  - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    hx.set(-py * 8);   // rotateX from vertical mouse position
    hy.set( px * 10);  // rotateY from horizontal mouse position
  };
  const onLeave = () => { hx.set(0); hy.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ y, rotate: rot, scale, rotateX: shx, rotateY: shy, transformPerspective: 1400 }}
      className="group/frame relative w-full"
    >
      {/* Outer floating wrapper — continuous bob */}
      <motion.div
        animate={float ? { y: [0, -10, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Glow halo — intensifies on hover */}
        <div
          className="pointer-events-none absolute -inset-6 rounded-3xl opacity-30 blur-2xl transition-opacity duration-500 group-hover/frame:opacity-60"
          style={{ background: `radial-gradient(circle at 50% 30%, ${accent}55 0%, transparent 65%)` }}
        />

        {/* Frame */}
        <div
          className="gradient-border relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] transition-colors duration-300 group-hover/frame:border-white/20"
          style={{
            background: "linear-gradient(180deg,rgba(28,32,40,0.92) 0%,rgba(15,18,24,0.95) 100%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {/* Top chrome bar — traffic lights + nav + URL */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            {/* traffic lights */}
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80 transition-all duration-300 hover:scale-110" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80 transition-all duration-300 hover:scale-110" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80 transition-all duration-300 hover:scale-110" />
            </div>

            {/* nav buttons (hidden on small) */}
            <div className="hidden items-center gap-2 pl-3 text-white/45 md:flex">
              <span className="text-[10px]">◀</span>
              <span className="text-[10px]">▶</span>
              <span className="text-[10px]">↻</span>
            </div>

            {/* URL bar */}
            <div className="ml-1 flex flex-1 items-center gap-2 truncate rounded-md bg-black/30 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60">
              {/* lock icon */}
              <span className="text-[9px] text-green-400/70">🔒</span>
              <span className="truncate">
                <span className="text-white/50">https://</span>
                {url}
              </span>
            </div>

            {/* live indicator pulse */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full"
                style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
              />
              <span className="text-[9px] uppercase tracking-widest text-white/55">Live</span>
            </div>
          </div>

          {/* Screenshot body */}
          <div className="relative aspect-[16/9.4] w-full overflow-hidden bg-black/40">
            {children}
            {/* subtle scanline overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 50%, rgba(255,255,255,1) 50%)",
                backgroundSize: "100% 4px",
              }}
              aria-hidden
            />
            {/* live scan beam — a soft bright line sweeps down like a monitor refresh */}
            <div
              className="scan-beam pointer-events-none absolute inset-x-0 top-0 h-14 opacity-[0.06]"
              style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent)" }}
              aria-hidden
            />
          </div>
        </div>

        {/* Bottom reflection bar */}
        <div
          className="pointer-events-none mx-auto mt-2 h-3 w-[88%] rounded-full opacity-50 blur-md"
          style={{ background: `radial-gradient(ellipse, ${accent}33 0%, transparent 70%)` }}
        />
      </motion.div>
    </motion.div>
  );
}
