import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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

/* Public, non-secret defaults so a clean checkout (or a CI job with no .env)
   still builds correct canonical/OG URLs. A real deployment overrides these
   with environment variables. */
const SITE_DEFAULTS = {
  VITE_SITE_URL: "https://mohamed-negm.vercel.app",
  VITE_CONTACT_EMAIL: "mohammednegm11234@gmail.com",
};

/**
 * Substitutes %VITE_*% placeholders in index.html.
 *
 * Vite does this natively only for variables that are actually defined; an
 * undefined one is left in the markup as a literal `%VITE_SITE_URL%`, which
 * would ship broken canonical tags. This plugin always resolves them, falling
 * back to the public defaults above.
 */
function htmlEnv(env) {
  const values = { ...SITE_DEFAULTS, ...env };
  return {
    name: "portfolio-html-env",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(/%(VITE_[A-Z0-9_]+)%/g, (match, key) =>
          values[key] ? String(values[key]).replace(/\/+$/, "") : match
        ),
    },
  };
}

/**
 * Emits sitemap.xml at build time.
 *
 * The checked-in sitemap carried a hand-typed domain and a hand-typed
 * `lastmod` that went stale the moment anyone forgot to edit it. Generating it
 * means the URL always matches VITE_SITE_URL and the date always matches the
 * build.
 */
function sitemap(env) {
  const site = (env.VITE_SITE_URL || SITE_DEFAULTS.VITE_SITE_URL).replace(/\/+$/, "");
  return {
    name: "portfolio-sitemap",
    apply: "build",
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), tailwindcss(), htmlEnv(env), sitemap(env)],

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
            // Keep Vite's dynamic-import helper on the eager vendor path. If it
            // drifts into the Three chunk, the entry bundle must download all of
            // Three.js just to call `import()` for unrelated lazy sections.
            if (id.includes("vite/preload-helper")) return "vendor";
            if (!id.includes("node_modules")) return undefined;

            // Spline — biggest contributor by far.
            if (id.includes("@splinetool")) return "spline";

            // zustand is tiny and on the EAGER path (the experience store) —
            // pin it to vendor BEFORE the three test so it can never drag the
            // 3D stack onto the critical path.
            if (id.includes("zustand")) return "vendor";

            // The whole React-Three-Fiber stack → one lazy chunk.
            if (THREE_STACK.test(id)) return "three";

            // Animation libs
            if (id.includes("framer-motion") || id.includes("motion")) return "motion";
            // Premium GSAP plugins → separate lazy chunk (before the core test).
            if (GSAP_PLUGINS.test(id)) return "gsap-plugins";
            if (id.includes("gsap")) return "gsap";

            // Smooth scroll
            if (id.includes("lenis")) return "lenis";

            if (id.includes("react") || id.includes("scheduler")) return "react-vendor";

            return "vendor";
          },
        },
      },
    },

    test: {
      environment: "node",
      include: ["src/**/*.test.{js,jsx}", "api/**/*.test.js"],
      coverage: {
        provider: "v8",
        include: ["src/lib/**", "src/hooks/**", "api/**"],
        reporter: ["text", "lcov"],
      },
    },
  };
});
