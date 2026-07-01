import { useState } from "react";
import { motion } from "motion/react";
import { toggleAudio } from "../../lib/ambientAudio";

/**
 * Opt-in ambient-sound control. Muted by default (autoplay-policy friendly).
 * Sits just above the back-to-top button. The bars animate while sound is on.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);

  const handle = () => setOn(toggleAudio());

  // Five equaliser bars; they "play" only while enabled.
  const bars = [0, 1, 2, 3, 4];

  return (
    <motion.button
      type="button"
      onClick={handle}
      data-cursor="hover"
      data-cursor-text={on ? "Mute" : "Sound"}
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Enable ambient sound"}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="group fixed bottom-24 left-6 z-[8400] flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[rgba(15,18,24,0.85)] text-white backdrop-blur-md md:bottom-28 md:left-8 md:h-14 md:w-14"
      style={{ boxShadow: "0 14px 34px -12px rgba(0,0,0,0.6)" }}
    >
      {/* soft halo when active */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}
        style={{ boxShadow: "0 0 24px rgba(170,180,196,0.35)" }}
      />
      <div className="flex h-4 items-end gap-[2px]">
        {bars.map((b) => (
          <motion.span
            key={b}
            className="w-[2px] rounded-full bg-[#aab4c4]"
            animate={
              on
                ? { height: ["35%", "100%", "45%", "85%", "35%"] }
                : { height: "30%" }
            }
            transition={
              on
                ? { duration: 1 + b * 0.18, repeat: Infinity, ease: "easeInOut", delay: b * 0.08 }
                : { duration: 0.3 }
            }
            style={{ height: "30%" }}
          />
        ))}
      </div>
      <span className="sr-only">{on ? "Sound on" : "Sound off"}</span>
    </motion.button>
  );
}
