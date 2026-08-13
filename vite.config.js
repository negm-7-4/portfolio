import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Chunks that should NOT be modulepreloaded — they're huge and only
// needed lazily / on interaction. Preloading them would defeat the
// whole point of code-splitting.

// NB: "gsap" also matches every per-plugin chunk (gsap-drawsvgplugin-*, …).
const LAZY_CHUNKS = new Set(["spline", "gsap", "three"]);

// The now-free GSAP club plugins (SplitText, MorphSVG, DrawSVG, …). Each gets
// its OWN chunk, so `loadGsap("DrawSVGPlugin")` fetches 2 kB rather than the
// 25 kB the whole set used to cost when they shared one chunk. All are kept
// out of the small `gsap` core chunk that ScrollTrigger loads.
// NB: Observer is intentionally NOT here — ScrollTrigger (in the core `gsap`
// chunk) imports it, so splitting it out creates a dependency cycle.
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

/**
 * Injects per-project structured data into index.html at build time.
 *
 * The page already carried Person and WebSite JSON-LD, but the projects — the
 * actual substance a recruiter or a search engine wants — were invisible to
 * crawlers, since they only exist after React renders. Generating the graph
 * from the same `projects` array the UI renders means the two can never drift:
 * add a project to content.js and it appears in the structured data.
 */
function projectSchema(env) {
  const site = (env.VITE_SITE_URL || SITE_DEFAULTS.VITE_SITE_URL).replace(/\/+$/, "");
  return {
    name: "portfolio-project-schema",
    async transformIndexHtml(html) {
      const { projects, profile } = await import("./src/data/content.js");

      const graph = projects.map((project) => ({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        headline: project.tagline,
        description: project.desc,
        genre: project.category,
        keywords: project.tech.join(", "),
        url: project.live || project.github || `${site}/#projects`,
        ...(project.image ? { image: `${site}${project.image}` } : {}),
        ...(project.github ? { codeRepository: project.github } : {}),
        author: { "@type": "Person", name: profile.name, url: `${site}/` },
        inLanguage: "en",
      }));

      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { type: "application/ld+json" },
            children: JSON.stringify(graph),
            injectTo: "head",
          },
        ],
      };
    },
  };
}

/**
 * Fills the <noscript> block with the site's real content at build time.
 *
 * Everything on this page is client-rendered, so a client that does not run
 * JavaScript sees an empty div and a one-line apology. Google renders JS, but
 * plenty of things that matter do not: link unfurlers, archive crawlers,
 * text-mode readers, corporate proxies that strip scripts, and anyone whose
 * bundle simply failed to load on a bad connection.
 *
 * The content is generated from the same `content.js` the app renders, so it
 * cannot drift, and it lives inside <noscript> — visible only when scripts are
 * off. That is the honest placement: it is a fallback, not a second hidden
 * copy of the page served to crawlers.
 */
function noscriptContent() {
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );

  return {
    name: "portfolio-noscript-content",
    async transformIndexHtml(html) {
      const { profile, projects, services, experience } = await import("./src/data/content.js");

      const section = (heading, items) =>
        `<h2 style="font-size:1.05rem;margin:2rem 0 .6rem;color:#dfe3ea">${esc(heading)}</h2>` +
        `<ul style="padding-left:1.1rem;line-height:1.75">${items.join("")}</ul>`;

      const body = [
        `<h1 style="font-size:1.7rem;margin-bottom:.35rem">${esc(profile.name)}</h1>`,
        `<p style="color:#aab4c4;margin:0 0 .4rem">${esc(profile.role)} · ${esc(profile.location)}</p>`,
        `<p style="line-height:1.7">${esc(profile.tagline)}</p>`,
        `<p><a href="mailto:${esc(profile.email)}" style="color:#aab4c4">${esc(profile.email)}</a>` +
          ` · <a href="${esc(profile.resumeUrl)}" style="color:#aab4c4">CV (PDF)</a></p>`,

        section(
          "Projects",
          projects.map(
            (p) =>
              `<li><strong>${esc(p.title)}</strong> — ${esc(p.tagline)}. ${esc(p.desc)}` +
              ` <em>${esc(p.tech.join(", "))}</em>` +
              (p.github ? ` <a href="${esc(p.github)}" style="color:#aab4c4">source</a>` : "") +
              (p.live ? ` <a href="${esc(p.live)}" style="color:#aab4c4">live</a>` : "") +
              `</li>`
          )
        ),

        section(
          "Services",
          services.map((s) => `<li><strong>${esc(s.title)}</strong> — ${esc(s.desc)}</li>`)
        ),

        section(
          "Experience",
          experience.map(
            (e) =>
              `<li><strong>${esc(e.role)}</strong>, ${esc(e.company)} (${esc(e.period)}) — ${esc(e.desc)}</li>`
          )
        ),

        section(
          "Elsewhere",
          profile.socials.map(
            (s) => `<li><a href="${esc(s.url)}" style="color:#aab4c4">${esc(s.label)}</a></li>`
          )
        ),

        `<p style="margin-top:2rem;color:#8a93a6">This portfolio's interactive 3D experience needs JavaScript. Everything above is the same content, in plain text.</p>`,
      ].join("");

      return html.replace(
        "<!--noscript-content-->",
        `<div style="max-width:46rem;margin:8vh auto;padding:0 1.5rem;font-family:system-ui,sans-serif;color:#dfe3ea">${body}</div>`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [
      react(),
      tailwindcss(),
      htmlEnv(env),
      sitemap(env),
      projectSchema(env),
      noscriptContent(),
    ],

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
            // Each club plugin gets its OWN chunk, so loading one does not
            // drag the other nine along (before the core gsap test).
            const clubPlugin = id.match(GSAP_PLUGINS);
            if (clubPlugin) return `gsap-${clubPlugin[1].toLowerCase()}`;
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
      include: ["src/**/*.test.{js,jsx,ts,tsx}", "api/**/*.test.js"],
      coverage: {
        provider: "v8",
        include: ["src/lib/**", "src/hooks/**", "src/config/**", "api/**"],
        reporter: ["text", "lcov"],
      },
    },
  };
});
