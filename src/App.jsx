import { lazy, Suspense, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";

import useLenis from "./hooks/useLenis";
import useDeviceProfile from "./hooks/useDeviceProfile";
import { CursorProvider } from "./hooks/useCursor";
import { ActiveSectionProvider } from "./hooks/useActiveSection";

import Preloader from "./components/Preloader";
import DeferredMount from "./components/DeferredMount";
import PrefetchSections from "./components/PrefetchSections";
import CustomCursor from "./components/CustomCursor";
import KeyboardNavBridge from "./components/AppInner";
import ScrollProgress from "./components/ScrollProgress";
import WebGLBackground from "./components/ui/WebGLBackground";
import ExperienceBridge from "./components/ExperienceBridge";
import VelocityMarquee from "./components/ui/VelocityMarquee";
import PageTransition from "./components/PageTransition";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/ui/Toast";

// Above-the-fold + immediately needed sections are imported eagerly so
// they're in the main bundle and ready on first paint.
import Hero from "./components/sections/Hero";
import Stats from "./components/sections/Stats";
import About from "./components/sections/About";
// Manifesto is a few KB of markup (GSAP arrives lazily inside it) — eager
// import keeps its 260vh pin corridor in the layout from first paint, so
// lazy-chunk arrival never shifts the scroll geometry mid-journey.
import Manifesto from "./components/sections/Manifesto";

// Below-the-fold sections are code-split. Each one is wrapped in a
// placeholder section element so the chapter-rail observer can keep
// tracking it while the chunk loads.
const Services      = lazy(() => import("./components/sections/Services"));
const Skills        = lazy(() => import("./components/sections/Skills"));
const Experience    = lazy(() => import("./components/sections/Experience"));
const Process       = lazy(() => import("./components/sections/Process"));
const Projects      = lazy(() => import("./components/sections/Projects"));
const CapabilitiesGallery = lazy(() => import("./components/sections/CapabilitiesGallery"));
const Testimonials  = lazy(() => import("./components/sections/Testimonials"));
const Socials       = lazy(() => import("./components/sections/Socials"));
const Contact       = lazy(() => import("./components/sections/Contact"));
const Footer        = lazy(() => import("./components/sections/Footer"));

/* Skeleton placeholder used while a section chunk loads. Reserves space
   so scroll doesn't jump, carries the section id so the chapter rail's
   IntersectionObserver keeps tracking it, and renders a subtle pulsing
   placeholder ring so the user knows something is incoming. */
function SectionPlaceholder({ id }) {
  return (
    <section
      id={id}
      style={{ minHeight: "60vh", contentVisibility: "auto", containIntrinsicSize: "0 600px" }}
      aria-hidden
      className="relative flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3 opacity-30">
        <div className="relative h-8 w-8">
          <span className="absolute inset-0 animate-spin rounded-full border border-white/15 border-t-white/45" style={{ animationDuration: "2.4s" }} />
          <span className="absolute inset-2 rounded-full bg-white/20" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/40">Loading</span>
      </div>
    </section>
  );
}

// ── Lazy chunks: only load when first needed (deferred / off-fold) ──
// The cinematic R3F world is the heaviest chunk on the site (three + drei +
// postprocessing), so it's code-split and only ever requested on capable
// (mid/high) devices — low-tier hardware never downloads it.
const CinematicWorld    = lazy(() => import("./components/three/CinematicWorld"));
const SpaceBackground   = lazy(() => import("./components/three/SpaceBackground"));
const ChapterBackdrop   = lazy(() => import("./components/ui/ChapterBackdrop"));
const ChapterRail       = lazy(() => import("./components/ui/ChapterRail"));
const ChapterIntro      = lazy(() => import("./components/ui/ChapterIntro"));
const CursorParticles   = lazy(() => import("./components/ui/CursorParticles"));
const CursorSpotlight   = lazy(() => import("./components/ui/CursorSpotlight"));
const GrainOverlay      = lazy(() => import("./components/ui/GrainOverlay"));
const VelocityVignette  = lazy(() => import("./components/ui/VelocityVignette"));
const ClickRipple       = lazy(() => import("./components/ui/ClickRipple"));
const KonamiEasterEgg   = lazy(() => import("./components/ui/KonamiEasterEgg"));
const CommandPalette    = lazy(() => import("./components/ui/CommandPalette"));
const KeyboardHint      = lazy(() => import("./components/ui/KeyboardHint"));
const ReadingIndicator  = lazy(() => import("./components/ui/ReadingIndicator"));
const BackToTop         = lazy(() => import("./components/ui/BackToTop"));
const WhatsAppButton    = lazy(() => import("./components/ui/WhatsAppButton"));
const SoundToggle       = lazy(() => import("./components/ui/SoundToggle"));

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const { tier, touch } = useDeviceProfile();
  useLenis();

  const isLow = tier === "low";

  return (
    // reducedMotion="user" — every <motion> element automatically drops
    // transform/layout animation when the OS "reduce motion" pref is on.
    <MotionConfig reducedMotion="user">
    <CursorProvider>
      <ActiveSectionProvider>
        <ToastProvider>
          {/* Keyboard skip-link — first focusable element on the page */}
          <a
            href="#main-content"
            className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[10000] focus-visible:rounded-lg focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-black"
          >
            Skip to content
          </a>

          {/* ── Background layers ───────────────────────────────────
              Mid/high devices travel through the persistent cinematic R3F
              world (its own fog/stars own the backdrop). Low-tier / reduced-
              motion stays on the cheap GLSL aurora + CSS starfield.        */}
          {isLow ? (
            <WebGLBackground />
          ) : (
            <Suspense fallback={null}>
              <CinematicWorld quality={tier} />
              <ExperienceBridge />
            </Suspense>
          )}

          {/* These are visual but not critical for first paint.
              Touched-down tiers skip the heaviest extras to stay smooth. */}
          <Suspense fallback={null}>
            <DeferredMount>
              {isLow && <SpaceBackground />}
              <ChapterBackdrop />
              {!isLow && !touch && <CursorSpotlight />}
              {!isLow && <VelocityVignette />}
              {!isLow && <GrainOverlay />}
            </DeferredMount>
          </Suspense>

          {/* ── Floating chrome (z-30+) ─────────────────────────── */}
          <ScrollProgress />
          <PageTransition />
          <Navbar />
          <Suspense fallback={null}>
            <DeferredMount>
              <ChapterRail />
              <ChapterIntro />
            </DeferredMount>
          </Suspense>

          {/* ── Page content ─────────────────────────────────────── */}
          <main id="main-content" className="relative z-[2]">
            <Hero />
            <Stats />
            <About />
            <Suspense fallback={<SectionPlaceholder id="services" />}><Services /></Suspense>
            <VelocityMarquee text="REACT · NEXT.JS · THREE.JS · GSAP · TAILWIND" baseVelocity={2.5} />
            <Suspense fallback={<SectionPlaceholder id="skills" />}><Skills /></Suspense>
            <Suspense fallback={<SectionPlaceholder id="experience" />}><Experience /></Suspense>
            <Suspense fallback={<SectionPlaceholder id="process" />}><Process /></Suspense>
            <Manifesto />
            <VelocityMarquee text="LET'S BUILD SOMETHING GREAT" baseVelocity={3} />
            <Suspense fallback={<SectionPlaceholder id="projects" />}><Projects /></Suspense>
            <Suspense fallback={null}><CapabilitiesGallery /></Suspense>
            <Suspense fallback={<SectionPlaceholder id="testimonials" />}><Testimonials /></Suspense>
            <Suspense fallback={<SectionPlaceholder id="socials" />}><Socials /></Suspense>
            <Suspense fallback={<SectionPlaceholder id="contact" />}><Contact /></Suspense>
            <Suspense fallback={null}><Footer /></Suspense>
          </main>

          {/* ── Cursor + interactive layer — deferred, all lazy.
              Heavy cursor effects skipped on touch + low-tier devices.   */}
          {!touch && !isLow && (
            <Suspense fallback={null}>
              <DeferredMount delay={400}>
                <ClickRipple />
                <CursorParticles />
              </DeferredMount>
            </Suspense>
          )}
          {!touch && <CustomCursor />}

          <Suspense fallback={null}>
            <DeferredMount delay={800}>
              {!touch && <KeyboardHint />}
              <KeyboardNavBridge />
              <CommandPalette />
              <KonamiEasterEgg />
              <ReadingIndicator />
              <BackToTop />
              <WhatsAppButton />
              {!isLow && <SoundToggle />}
            </DeferredMount>
          </Suspense>

          <PrefetchSections />

          <AnimatePresence>
            {!loaded && <Preloader key="preloader" onDone={() => setLoaded(true)} />}
          </AnimatePresence>
        </ToastProvider>
      </ActiveSectionProvider>
    </CursorProvider>
    </MotionConfig>
  );
}
