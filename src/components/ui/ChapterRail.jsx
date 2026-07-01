import { AnimatePresence, motion, useMotionTemplate, useTransform } from "motion/react";
import { sections } from "../../data/sections";
import { useActiveSection } from "../../hooks/useActiveSection";

/**
 * Floating right-side chapter rail. Shows every section as a thin line.
 * The active line expands, glows, and reveals its label + number on a
 * glass pill; other sections progressively dim. Acts as a clickable TOC.
 *
 * Reads `progress` as a motion value — subscribes via useTransform so
 * scroll updates do NOT trigger React re-renders here.
 */
export default function ChapterRail() {
  const { active, index, progress, goto } = useActiveSection();

  // Height of the inner progress ribbon, driven by the motion value
  const progressHeight = useMotionTemplate`${useTransform(progress, [0, 1], [0, 100])}%`;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed right-3 top-1/2 z-[40] hidden -translate-y-1/2 md:block"
      aria-hidden
    >
      {/* top + bottom subtle vertical fade markers */}
      <span aria-hidden className="absolute -right-2 -top-3 h-px w-3 bg-white/15" />
      <span aria-hidden className="absolute -right-2 -bottom-3 h-px w-3 bg-white/15" />

      {/* page progress ribbon */}
      <div className="absolute -right-2 top-0 bottom-0 w-px overflow-visible rounded-full bg-white/[0.06]">
        <motion.div
          style={{ height: progressHeight }}
          className="relative w-full bg-gradient-to-b from-white/55 via-white/30 to-white/10"
        >
          <span
            className="absolute -right-1 -bottom-1 block h-2 w-2 rounded-full bg-white"
            style={{ boxShadow: "0 0 8px rgba(255,255,255,0.85), 0 0 14px rgba(170,180,196,0.7)" }}
          />
        </motion.div>
      </div>

      <ul className="pointer-events-auto flex flex-col gap-3.5 pl-3">
        {sections.map((s, i) => {
          const isActive = s.id === active.id;
          const past = i < index;
          return (
            <li key={s.id}>
              <button
                onClick={() => goto(s.id)}
                data-cursor="hover"
                data-cursor-text={s.label}
                className="group flex items-center justify-end gap-3"
                aria-label={`Jump to ${s.label}`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key={s.id}
                      initial={{ opacity: 0, x: 14, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 14, scale: 0.94, transition: { duration: 0.22 } }}
                      transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
                      className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] backdrop-blur-md"
                      style={{
                        color: s.accent,
                        border: `1px solid ${s.color}55`,
                        boxShadow: `0 0 24px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.06)`,
                      }}
                    >
                      <span className="text-white/45 tabular-nums">{s.num}</span>
                      <span>{s.label}</span>
                      <motion.span
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        className="h-1 w-1 rounded-full"
                        style={{ background: s.accent, boxShadow: `0 0 6px ${s.accent}` }}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>

                <motion.span
                  initial={false}
                  animate={{
                    width: isActive ? 28 : past ? 14 : 12,
                    backgroundColor: isActive
                      ? s.accent
                      : past
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(255,255,255,0.18)",
                    height: isActive ? 2 : 1,
                  }}
                  transition={{
                    width:           { type: "spring", stiffness: 380, damping: 28, mass: 0.55 },
                    height:          { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                    backgroundColor: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className="relative block rounded-full"
                  style={{
                    boxShadow: isActive
                      ? `0 0 14px ${s.color}99, 0 0 4px ${s.color}`
                      : "none",
                  }}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <ProgressPercent progress={progress} />
    </motion.aside>
  );
}

/* Subscribes the percentage display directly to the motion value so the
   parent never re-renders on scroll. */
function ProgressPercent({ progress }) {
  const pct = useTransform(progress, (v) => String(Math.round(v * 100)).padStart(3, "0"));
  return (
    <div className="absolute -bottom-12 right-0 flex flex-col items-end gap-1">
      <span className="font-display text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30 tabular-nums">
        <motion.span>{pct}</motion.span>
        <span className="text-white/15">%</span>
      </span>
    </div>
  );
}
