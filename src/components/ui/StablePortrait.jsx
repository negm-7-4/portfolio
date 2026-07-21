import { motion } from "motion/react";
import TiltCard from "./TiltCard";
import { EASE_OUT } from "../../lib/motion";

/**
 * StablePortrait — a fixed, premium framed photo. No swinging, no drag: it
 * simply sits there and looks expensive. A glass card with a gradient border
 * tilts a touch toward the cursor (stable and flat at rest), a soft accent
 * glow breathes behind it, corner crosshair ticks echo the hero HUD, and a
 * bilingual name plate anchors the bottom. Honours reduced motion via the
 * global MotionConfig.
 */
export default function StablePortrait({
  src = "/portrait-najm.jpg",
  alt = "Mohamed Negm — نجم",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, margin: "-12%" }}
      transition={{ duration: 0.8, ease: EASE_OUT }}
      className="relative mx-auto w-full max-w-[320px]"
    >
      {/* soft accent glow behind the card — breathes slowly */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2rem] blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(170,180,196,0.28), transparent 70%)" }}
      />

      <TiltCard
        max={8}
        spotColor="170,180,196"
        data-cursor="hover"
        className="gradient-border group relative overflow-hidden rounded-[22px] glass p-[6px]"
      >
        {/* photo */}
        <div className="relative overflow-hidden rounded-[17px] bg-black">
          <div className="relative aspect-[4/5] w-full">
            <img
              src={src}
              alt={alt}
              width="460"
              height="575"
              loading="lazy"
              decoding="async"
              draggable="false"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            />

            {/* cool cinematic grade + readability scrim */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(8,10,14,0.15) 0%, transparent 30%, transparent 55%, rgba(6,8,12,0.85) 100%)",
              }}
            />
            {/* light sweep on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-full"
            />
          </div>

          {/* corner crosshair ticks — hero-HUD echo */}
          {[
            "left-3 top-3 border-l border-t",
            "right-3 top-3 border-r border-t",
            "left-3 bottom-3 border-l border-b",
            "right-3 bottom-3 border-r border-b",
          ].map((c) => (
            <span key={c} className={`pointer-events-none absolute ${c} h-5 w-5 border-white/25`} />
          ))}

          {/* bilingual name plate */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-4">
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.32em] text-white/50">
                <span className="h-1 w-1 rounded-full bg-[#aab4c4]" style={{ boxShadow: "0 0 6px rgba(170,180,196,0.9)" }} />
                Front-End Developer
              </span>
              <span className="mt-1 font-display text-lg font-bold tracking-tight text-white">
                Mohamed Negm
              </span>
            </div>
            <span dir="rtl" lang="ar" className="font-display text-2xl font-bold text-[#c8d2dd]">
              نجم
            </span>
          </div>
        </div>
      </TiltCard>

      <p className="mt-3 text-center text-[9px] uppercase tracking-[0.32em] text-white/25">
        ✦ Cairo · Egypt
      </p>
    </motion.div>
  );
}
