import { lazy, Suspense } from "react";
import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import useDeviceProfile from "../../hooks/useDeviceProfile";
import { SHOWCASE_MODE, SHOWCASE_FALLBACK } from "../../config/showcase";

/**
 * ── Projects — presentation dispatcher ────────────────────────────────
 * The section shell (anchor id, heading, footer note) is stable; the
 * presentation inside is swapped by ONE config variable in
 * `src/config/showcase.js`. Every mode is its own lazy chunk, so only
 * the selected presentation's code is ever downloaded.
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

  let mode = MODES[SHOWCASE_MODE] ? SHOWCASE_MODE : SHOWCASE_FALLBACK;
  if (HEAVY_MODES.has(mode) && (tier === "low" || reducedMotion)) {
    mode = SHOWCASE_FALLBACK;
  }
  const Showcase = MODES[mode] || MODES.classic;

  return (
    <section id="projects" className="relative w-full py-24 md:py-40">
      <div className="mx-auto w-[90%] max-w-7xl">
        <SectionHeading num="06" eyebrow="Selected Work" title="Featured" accent="Projects" />
      </div>

      <Suspense fallback={<ShowcasePlaceholder />}>
        <Showcase />
      </Suspense>

      <div className="mx-auto w-[90%] max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ delay: 0.2 }}
          className="mt-20 text-center text-sm text-white/35"
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
