import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Chunks that should NOT be modulepreloaded — they're huge and only
// needed lazily / on interaction. Preloading them would defeat the
// whole point of code-splitting.
const LAZY_CHUNKS = new Set(["spline", "gsap"]);

export default defineConfig({
  plugins: [react(), tailwindcss()],

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

          // Animation libs
          if (id.includes("framer-motion") || id.includes("motion"))
            return "motion";
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
