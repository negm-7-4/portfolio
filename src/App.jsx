import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";

import useLenis from "./hooks/useLenis";
import useDeviceProfile from "./hooks/useDeviceProfile";
import { CursorProvider } from "./hooks/useCursor";
import { ActiveSectionProvider } from "./hooks/useActiveSection";

import Preloader from "./components/Preloader";
import ErrorBoundary from "./components/ErrorBoundary";
import DeferredMount from "./components/DeferredMount";
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
import PhotoIntro from "./components/sections/PhotoIntro";
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
const Services = lazy(() => import("./components/sections/Services"));
const Skills = lazy(() => import("./components/sections/Skills"));
const Experience = lazy(() => import("./components/sections/Experience"));
const Process = lazy(() => import("./components/sections/Process"));
const Projects = lazy(() => import("./components/sections/Projects"));
const SamsCaseStudy = lazy(() => import("./components/sections/SamsCaseStudy"));
const CapabilitiesGallery = lazy(() => import("./components/sections/CapabilitiesGallery"));
const Socials = lazy(() => import("./components/sections/Socials"));
const Contact = lazy(() => import("./components/sections/Contact"));
const Footer = lazy(() => import("./components/sections/Footer"));

/* Skeleton placeholder used while a section chunk loads. Reserves space
   so scroll doesn't jump, carries the section id so the chapter rail's
   IntersectionObserver keeps tracking it, and renders a subtle pulsing
   placeholder ring so the user knows something is incoming. */
function SectionPlaceholder({ id }) {
  return (
    <section
      id={id}
      // Marks this as a stand-in, not the real chapter. `useActiveSection`
      // needs to tell them apart: both carry the same id, so counting ids was
      // not enough to know whether the real section had arrived.
      data-section-placeholder=""
      style={{ minHeight: "60vh", contentVisibility: "auto", containIntrinsicSize: "0 600px" }}
      aria-hidden
      className="relative flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-8 w-8 opacity-40">
          <span
            className="absolute inset-0 animate-spin rounded-full border border-white/15 border-t-white/45"
            style={{ animationDuration: "2.4s" }}
          />
          <span className="absolute inset-2 rounded-full bg-white/20" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/70">Loading</span>
      </div>
    </section>
  );
}

/* React.lazy only becomes a real performance win when the component itself
   is not rendered on the first pass. This gate starts each below-fold import
   shortly before its placeholder reaches the viewport. */
function ViewportSection({ id, children, minHeight = "70vh", rootMargin = "1200px 0px" }) {
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;
    const marker = markerRef.current;
    if (!marker || typeof IntersectionObserver === "undefined") {
      setReady(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [ready, rootMargin]);

  if (ready) {
    // One failing section should cost the visitor that section, not the site.
    // The id stays in the DOM either way so the chapter rail keeps tracking.
    return (
      <ErrorBoundary label={`section:${id}`} fallback={<section id={id} hidden />}>
        {children}
      </ErrorBoundary>
    );
  }
  return (
    <div ref={markerRef} style={{ minHeight }}>
      <SectionPlaceholder id={id} />
    </div>
  );
}

// ── Lazy chunks: only load when first needed (deferred / off-fold) ──
// The cinematic R3F world is the heaviest chunk on the site (three + drei +
// postprocessing), so it's code-split and only ever requested on capable
// (mid/high) devices — low-tier hardware never downloads it.
const CinematicWorld = lazy(() => import("./components/three/CinematicWorld"));
const SpaceBackground = lazy(() => import("./components/three/SpaceBackground"));
const ChapterBackdrop = lazy(() => import("./components/ui/ChapterBackdrop"));
const AmbientField = lazy(() => import("./components/ui/AmbientField"));
const ChapterRail = lazy(() => import("./components/ui/ChapterRail"));
const ChapterIntro = lazy(() => import("./components/ui/ChapterIntro"));
const CursorParticles = lazy(() => import("./components/ui/CursorParticles"));
const CursorSpotlight = lazy(() => import("./components/ui/CursorSpotlight"));
const GrainOverlay = lazy(() => import("./components/ui/GrainOverlay"));
const VelocityVignette = lazy(() => import("./components/ui/VelocityVignette"));
const ClickRipple = lazy(() => import("./components/ui/ClickRipple"));
const KonamiEasterEgg = lazy(() => import("./components/ui/KonamiEasterEgg"));
const CommandPalette = lazy(() => import("./components/ui/CommandPalette"));
const KeyboardHint = lazy(() => import("./components/ui/KeyboardHint"));
const ReadingIndicator = lazy(() => import("./components/ui/ReadingIndicator"));
const BackToTop = lazy(() => import("./components/ui/BackToTop"));
const WhatsAppButton = lazy(() => import("./components/ui/WhatsAppButton"));
const SoundToggle = lazy(() => import("./components/ui/SoundToggle"));
const CvModal = lazy(() => import("./components/ui/CvModal"));
const Lightbox = lazy(() => import("./components/ui/Lightbox"));

export default function App() {
  const { tier, touch } = useDeviceProfile();
  const [loaded, setLoaded] = useState(() => tier === "low" || touch);
  const [worldEnabled, setWorldEnabled] = useState(false);
  useLenis();

  const isLow = tier === "low";
  // The 3D world runs on capable PHONES too (tier "mid"): touch alone is not
  // weakness, and dropping every phone to the flat backdrop meant most
  // visitors never saw the hero at all. Only genuinely weak hardware and
  // reduced-motion/data-saver users get the lightweight path.
  const useLite = isLow;

  /* The opening portrait is fully opaque, so downloading and executing the
     3D world behind it only burns the critical path. Warm it when the visitor
     starts leaving the cover, with a long idle fallback for stationary tabs. */
  useEffect(() => {
    if (useLite || worldEnabled) return undefined;
    const enable = () => {
      if (window.scrollY < window.innerHeight * 0.35) return;
      setWorldEnabled(true);
    };
    const idleFallback = window.setTimeout(() => setWorldEnabled(true), 30000);
    window.addEventListener("scroll", enable, { passive: true });
    return () => {
      window.clearTimeout(idleFallback);
      window.removeEventListener("scroll", enable);
    };
  }, [useLite, worldEnabled]);

  return (
    // reducedMotion="user" — every <motion> element automatically drops
    // transform/layout animation when the OS "reduce motion" pref is on.
    <MotionConfig reducedMotion={useLite ? "always" : "user"}>
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
            {useLite ? (
              <ErrorBoundary label="SpaceBackground" fallback={null}>
                <Suspense fallback={null}>
                  <SpaceBackground />
                </Suspense>
              </ErrorBoundary>
            ) : !worldEnabled ? (
              <ErrorBoundary label="WebGLBackground" fallback={null}>
                <WebGLBackground />
              </ErrorBoundary>
            ) : (
              /* If the R3F world throws — a shader that will not compile on some
               driver, a lost context, a failed asset — fall back to the cheap
               GLSL aurora rather than letting React unmount the whole site. */
              <ErrorBoundary label="CinematicWorld" fallback={<WebGLBackground />}>
                <Suspense fallback={null}>
                  <CinematicWorld quality={tier} />
                  <ExperienceBridge />
                </Suspense>
              </ErrorBoundary>
            )}

            {/* Mobile readability veil — on phones the single-column layout puts
              copy directly over the full-width 3D world, so dim it to an
              ambient backdrop so text always stays crisp. Most visitors are on
              phones, so legibility wins over spectacle here. Desktop: none. */}
            {!useLite && (
              <div
                aria-hidden
                className="pointer-events-none fixed inset-0 md:hidden"
                style={{
                  zIndex: -5,
                  background:
                    "linear-gradient(180deg, rgba(6,8,12,0.6) 0%, rgba(6,8,12,0.74) 45%, rgba(6,8,12,0.68) 100%)",
                }}
              />
            )}

            {/* These are visual but not critical for first paint.
              Touched-down tiers skip the heaviest extras to stay smooth. */}
            <ErrorBoundary label="ambient chrome" fallback={null}>
              <Suspense fallback={null}>
                <DeferredMount>
                  <ChapterBackdrop />
                  {!useLite && <AmbientField />}
                  {!useLite && <CursorSpotlight />}
                  {!useLite && <VelocityVignette />}
                  {!useLite && <GrainOverlay />}
                </DeferredMount>
              </Suspense>
            </ErrorBoundary>

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
              {/* The opaque photo cover screen — hides the 3D world; the gem +
                Hero reveal on scroll and carry the rest of the journey. */}
              <PhotoIntro />
              <Hero />
              <Stats />
              <About />
              <ViewportSection id="services">
                <Suspense fallback={<SectionPlaceholder id="services" />}>
                  <Services />
                </Suspense>
              </ViewportSection>
              <VelocityMarquee
                text="REACT · NEXT.JS · THREE.JS · GSAP · FRAMER MOTION · LOTTIE · WEBGL · D3 · TAILWIND"
                baseVelocity={2.5}
              />
              <ViewportSection id="skills">
                <Suspense fallback={<SectionPlaceholder id="skills" />}>
                  <Skills />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="experience">
                <Suspense fallback={<SectionPlaceholder id="experience" />}>
                  <Experience />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="process">
                <Suspense fallback={<SectionPlaceholder id="process" />}>
                  <Process />
                </Suspense>
              </ViewportSection>
              <Manifesto />
              <VelocityMarquee text="LET'S BUILD SOMETHING GREAT" baseVelocity={3} />
              <ViewportSection id="projects" minHeight="90vh">
                <Suspense fallback={<SectionPlaceholder id="projects" />}>
                  <Projects />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="sams-case-study" minHeight="90vh">
                <Suspense fallback={<SectionPlaceholder id="sams-case-study" />}>
                  <SamsCaseStudy />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="capabilities" minHeight="80vh">
                <Suspense fallback={<SectionPlaceholder id="capabilities" />}>
                  <CapabilitiesGallery />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="socials">
                <Suspense fallback={<SectionPlaceholder id="socials" />}>
                  <Socials />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="contact" minHeight="90vh">
                <Suspense fallback={<SectionPlaceholder id="contact" />}>
                  <Contact />
                </Suspense>
              </ViewportSection>
              <ViewportSection id="footer">
                <Suspense fallback={<SectionPlaceholder id="footer" />}>
                  <Footer />
                </Suspense>
              </ViewportSection>
            </main>

            {/* ── Cursor + interactive layer — deferred, all lazy.
              Heavy cursor effects skipped on touch + low-tier devices.   */}
            {!touch && !isLow && (
              <ErrorBoundary label="cursor effects" fallback={null}>
                <Suspense fallback={null}>
                  <DeferredMount delay={400}>
                    <ClickRipple />
                    <CursorParticles />
                  </DeferredMount>
                </Suspense>
              </ErrorBoundary>
            )}
            {!touch && (
              <ErrorBoundary label="CustomCursor" fallback={null}>
                <CustomCursor />
              </ErrorBoundary>
            )}

            <ErrorBoundary label="floating tools" fallback={null}>
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
            </ErrorBoundary>

            {/* CV modal — mounted early (no delay) so the "My CV" button always
              has a live listener; renders nothing until the open-cv event. */}
            <Suspense fallback={null}>
              <CvModal />
            </Suspense>

            {/* Image viewer. Same reasoning: it listens for clicks on any
              zoomable image anywhere on the page, so it has to be listening
              before the visitor reaches one. Renders nothing until opened. */}
            <ErrorBoundary label="Lightbox" fallback={null}>
              <Suspense fallback={null}>
                <Lightbox />
              </Suspense>
            </ErrorBoundary>

            <AnimatePresence>
              {!loaded && <Preloader key="preloader" onDone={() => setLoaded(true)} />}
            </AnimatePresence>
          </ToastProvider>
        </ActiveSectionProvider>
      </CursorProvider>
    </MotionConfig>
  );
}
