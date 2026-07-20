// Chunks that should NOT be modulepreloaded — they're huge and only
// needed lazily / on interaction. Preloading them would defeat the
// whole point of code-splitting.

const LAZY_CHUNKS = new Set(["spline", "gsap", "gsap-plugins", "three"]);

// The now-free GSAP club plugins (SplitText, MorphSVG, DrawSVG, …). They are
// only pulled in by `loadGsap()` when a premium effect first mounts, so they
// live in their OWN lazy chunk — kept out of the small `gsap` core chunk that
// ScrollTrigger loads early, and off the critical path entirely.
// NB: Observer is intentionally NOT here — ScrollTrigger (in the core `gsap`
// chunk) imports it, so splitting it out creates a gsap ⇄ gsap-plugins cycle.
const GSAP_PLUGINS =
  /[\\/]gsap[\\/](SplitText|MorphSVGPlugin|DrawSVGPlugin|MotionPathPlugin|Flip|ScrambleTextPlugin|CustomEase|CustomBounce|CustomWiggle|InertiaPlugin|Physics2DPlugin|Draggable|EasePack|TextPlugin)/;

// The full React-Three-Fiber stack. Isolated into one lazy chunk so the
// ~860 kB of three.js + drei + postprocessing is ONLY fetched on mid/high
// devices (when CinematicWorld lazy-loads) and never on the critical path.
// NB: zustand is deliberately NOT here — the store is imported eagerly by
// ExperienceBridge, so it must live in a small, eager-safe chunk.
const THREE_STACK =
  /[\\/](three|three-stdlib|three-mesh-bvh|@react-three|postprocessing|maath|troika[-\w]*|bidi-js|webgl-sdf-generator|suspend-react|its-fine|react-reconciler|react-use-measure|detect-gpu|glsl-noise|hls\.js|stats-gl|camera-controls|meshline|potpack|@monogrid|n8ao)[\\/]/;

export default defineConfig({ // This is now the only default export
  plugins: [react(), tailwindcss()],

  // ── React-Three-Fiber + Vite interop ──────────────────────────────────
  // Without this, Vite's dep optimiser can resolve React through two module
  // instances once the R3F stack is pre-bundled, which nulls the hook
  // dispatcher and crashes the *DOM* tree ("more than one copy of React").
  // dedupe forces a single React/three instance; pinning the 3D libs in
  // optimizeDeps.include pre-bundles them once up front so there's no
  // mid-session re-optimise + full reload when the world first mounts.
  resolve: {
    dedupe: ["react", "react-dom", "three"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "postprocessing",
      "maath/easing",
      "zustand",
      "zustand/middleware",
    ],
  },

  build: {
    chunkSizeWarningLimit: 2200,

    // Don't let Vite auto-preload the heavy lazy chunks
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((d) => !Array.from(LAZY_CHUNKS).some((c) => d.includes(`/${c}-`))),
    },

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;

          // Spline — biggest contributor by far.
          if (id.includes("@splinetool"))               return "spline";


          // zustand is tiny and on the EAGER path (the experience store) —
          // pin it to vendor BEFORE the three test so it can never drag the
          // 3D stack onto the critical path.
          if (id.includes("zustand"))                   return "vendor";

          // The whole React-Three-Fiber stack → one lazy chunk.
          if (THREE_STACK.test(id))                     return "three";

          // Animation libs
          if (id.includes("framer-motion") || id.includes("motion"))
            return "motion";
          // Premium GSAP plugins → separate lazy chunk (before the core test).
          if (GSAP_PLUGINS.test(id))                    return "gsap-plugins";
          if (id.includes("gsap"))                      return "gsap";

          // Smooth scroll
          if (id.includes("lenis"))                     return "lenis";

          if (id.includes("react") || id.includes("scheduler"))
            return "react-vendor";

          return "vendor";
        },
      },
    },
  },
});
