import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import Timeline from "../projects/Timeline";
import Showcase from "../projects/Showcase";

// Globe pulls in Three.js — only load its chunk when the user picks that view.
const Globe = lazy(() => import("../projects/Globe"));

const MODES = [
  { id: "timeline", label: "Timeline", icon: "❙" },
  { id: "globe",    label: "Globe",    icon: "◍" },
  { id: "showcase", label: "Showcase", icon: "▦" },
];

/* Segmented control to switch between the three project views */
function ModeSwitch({ mode, setMode }) {
  return (
    <div className="mb-14 flex items-center justify-center">
      <div className="relative inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl"
           style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        {MODES.map((m) => {
          const activeMode = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              data-cursor="hover"
              className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 md:px-5"
              style={{ color: activeMode ? "#0b0d11" : "rgba(255,255,255,0.6)" }}
            >
              {activeMode && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="text-xs">{m.icon}</span>
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Projects() {
  const [mode, setMode] = useState("timeline");

  return (
    <section id="projects" className="relative w-full py-24 md:py-36">
      <div className="mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="06" eyebrow="Selected Work" title="Featured" accent="Projects" />
        <ModeSwitch mode={mode} setMode={setMode} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === "globe" ? (
            <Suspense
              fallback={
                <div className="flex h-[60vh] items-center justify-center">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">Spinning up globe…</span>
                </div>
              }
            >
              <Globe />
            </Suspense>
          ) : (
            <div className="mx-auto w-[90%] max-w-7xl">
              {mode === "timeline" ? <Timeline /> : <Showcase />}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto mt-20 w-[90%] max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-white/35"
        >
          All projects live on{" "}
          <a href="https://github.com/negm-7-4" target="_blank" rel="noopener noreferrer"
             data-cursor="hover"
             className="text-white/60 underline underline-offset-4 transition-colors hover:text-white">
            GitHub ↗
          </a>
        </motion.p>
      </div>
    </section>
  );
}
