import { lazy, Suspense, useState } from "react";
import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import useDeviceProfile from "../../hooks/useDeviceProfile";
import { SHOWCASE_MODE, SHOWCASE_FALLBACK } from "../../config/showcase";

/**
 * ── Projects — presentation dispatcher ────────────────────────────────
 * The section shell (anchor id, heading, footer note) is stable; the
 * presentation inside is swapped live by the mode switcher below the
 * heading (config's SHOWCASE_MODE is the default; the visitor's choice
 * persists in localStorage). Every mode is its own lazy chunk, so only
 * presentations that are actually viewed get downloaded.
 *
 * WebGL-heavy modes degrade to the fallback mode on low-tier devices and
 * for users who prefer reduced motion — nobody gets a broken or hostile
 * experience.
 */
const MODES = {
  globe:    lazy(() => import("../showcase/globe/GlobeShowcase")),
  timeline: lazy(() => import("../showcase/timeline/TimelineShowcase")),
  cards:    lazy(() => import("../showcase/cards/FlipCardsShowcase")),
  classic:  lazy(() => import("../showcase/ClassicShowcase")),
};

/* Modes that need real GPU headroom to feel premium. */
const HEAVY_MODES = new Set(["globe"]);

const STORAGE_KEY = "showcase-mode";

/* The three switchable presentations (classic stays the silent fallback). */
const MODE_OPTIONS = [
  {
    key: "globe",
    label: "Globe",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-3.5 w-3.5" aria-hidden>
        <circle cx="8" cy="8" r="6.2" />
        <ellipse cx="8" cy="8" rx="2.8" ry="6.2" />
        <path d="M2 8h12" />
      </svg>
    ),
  },
  {
    key: "timeline",
    label: "Timeline",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-3.5 w-3.5" aria-hidden>
        <path d="M8 1.5v13" />
        <circle cx="8" cy="4" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="8" cy="9" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="8" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "cards",
    label: "Cards",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-3.5 w-3.5" aria-hidden>
        <rect x="1.5" y="3.5" width="8.5" height="11" rx="1.6" />
        <path d="M11.5 2h1.7c.7 0 1.3.6 1.3 1.3v8.9" />
      </svg>
    ),
  },
];

/* ── Segmented pill — the active option carries a shared sliding chip. ── */
function ModeSwitcher({ options, mode, onChange }) {
  return (
    <div className="mb-14 flex justify-center">
      <div
        role="group"
        aria-label="Project display mode"
        className="relative inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >
        {options.map((o) => {
          const active = mode === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              data-cursor="hover"
              aria-pressed={active}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 md:px-5 ${
                active ? "text-black" : "text-white/55 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="showcase-mode-chip"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-white"
                  style={{ boxShadow: "0 8px 24px -10px rgba(255,255,255,0.5)" }}
                />
              )}
              <span className="relative z-[1]">{o.icon}</span>
              <span className="relative z-[1]">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ShowcasePlaceholder() {
  return (
    <div
      aria-hidden
      className="flex min-h-[70vh] items-center justify-center"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}
    >
      <div className="flex flex-col items-center gap-3 opacity-30">
        <div className="relative h-8 w-8">
          <span
            className="absolute inset-0 animate-spin rounded-full border border-white/15 border-t-white/45"
            style={{ animationDuration: "2.4s" }}
          />
          <span className="absolute inset-2 rounded-full bg-white/20" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/40">Loading</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const { tier, reducedMotion } = useDeviceProfile();
  const lowPower = tier === "low" || reducedMotion;

  const [selected, setSelected] = useState(() => {
    if (typeof window === "undefined") return SHOWCASE_MODE;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && MODES[saved]) return saved;
    } catch {
      /* storage unavailable (private mode) — fall through to the default */
    }
    return SHOWCASE_MODE;
  });

  let mode = MODES[selected] ? selected : SHOWCASE_FALLBACK;
  if (HEAVY_MODES.has(mode) && lowPower) mode = SHOWCASE_FALLBACK;
  const Showcase = MODES[mode] || MODES.classic;

  // Heavy options that would silently degrade are not offered at all.
  const options = MODE_OPTIONS.filter((o) => !(HEAVY_MODES.has(o.key) && lowPower));

  const switchMode = (key) => {
    if (key === selected) return;
    setSelected(key);
    try {
      window.localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* non-fatal */
    }
    // Modes differ wildly in height (600vh flight corridor vs a grid) —
    // re-anchor the viewport on the section top so the swap never strands
    // the visitor mid-page.
    requestAnimationFrame(() => {
      const el = document.getElementById("projects");
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -50, duration: 0.9 });
      else el.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <section id="projects" className="relative w-full py-24 md:py-40">
      <div className="mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="06" eyebrow="Selected Work" title="Featured" accent="Projects" />
        <ModeSwitcher options={options} mode={mode} onChange={switchMode} />
      </div>

      <Suspense fallback={<ShowcasePlaceholder />}>
        <Showcase />
      </Suspense>

      <div className="mx-auto mt-20 w-[90%] max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-white/35"
        >
          All projects live on{" "}
          <a
            href="https://github.com/negm-7-4"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="text-white/60 underline underline-offset-4 transition-colors hover:text-white"
          >
            GitHub ↗
          </a>
        </motion.p>
      </div>
    </section>
  );
}
