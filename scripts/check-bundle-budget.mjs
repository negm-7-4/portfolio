/**
 * Fails the build if the critical path grows past its budget.
 *
 * "The site is fast" is a claim this portfolio makes explicitly, so it should
 * be enforced rather than re-measured by hand every few months. The numbers
 * below are the current sizes plus a little headroom — tight enough that an
 * accidental eager import of three.js or a second animation library trips it,
 * loose enough that ordinary content edits do not.
 *
 * What is measured is the EAGER path: the entry chunk plus everything the
 * browser must parse before first paint. The lazy chunks (three, gsap,
 * gsap-plugins, spline) are deliberately excluded — that is the entire point
 * of splitting them out — but each is capped separately so none can balloon
 * unnoticed either.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const DIST = "dist/assets";

/** Gzipped kB budgets. */
const BUDGETS = {
  eager: 190, // index + react-vendor + motion + vendor + lenis + CSS
  three: 400, // only fetched on mid/high tiers, after the cover screen
  gsap: 60, // core + ScrollTrigger
};

/* Club plugins load one at a time (see lib/gsapPlugins.js), so what matters is
   that no SINGLE plugin chunk gets large — not their combined size. */
const PER_PLUGIN_BUDGET = 12;

const LAZY_PREFIXES = ["three-", "gsap-", "spline-"];

const gzipKb = (buffer) => gzipSync(buffer).length / 1024;
const fmt = (n) => `${n.toFixed(1)} kB`;

async function main() {
  let files;
  try {
    files = await readdir(DIST);
  } catch {
    console.error(`No build output at ${DIST}. Run "npm run build" first.`);
    process.exitCode = 1;
    return;
  }

  const sizes = new Map();
  let eager = 0;

  for (const file of files) {
    if (!/\.(js|css)$/.test(file)) continue;
    const full = path.join(DIST, file);
    if (!(await stat(full)).isFile()) continue;

    const size = gzipKb(await readFile(full));
    sizes.set(file, size);

    const lazyPrefix = LAZY_PREFIXES.find((p) => file.startsWith(p));
    if (lazyPrefix) continue;

    // Route-level lazy chunks (sections, overlays) are named after their
    // component and are not on the critical path either.
    const isEntryPath = /^(index|react-vendor|motion|vendor|lenis)-/.test(file);
    if (isEntryPath) eager += size;
  }

  const results = [
    ["eager critical path", eager, BUDGETS.eager],
    ...Object.entries(BUDGETS)
      .filter(([name]) => name !== "eager")
      .map(([name, budget]) => {
        // Anchored on the content hash so the `gsap` budget cannot silently
        // measure `gsap-plugins-<hash>.js` instead.
        const pattern = new RegExp(`^${name}-[A-Za-z0-9_-]+\\.(js|css)$`);
        const match = [...sizes.entries()].find(([file]) => pattern.test(file));
        return [name, match ? match[1] : 0, budget];
      }),
  ];

  // Every club-plugin chunk, checked individually.
  for (const [file, size] of sizes) {
    const plugin = file.match(/^gsap-([a-z0-9]+)-[A-Za-z0-9_-]+\.js$/);
    if (plugin && plugin[1] !== "plugins") {
      results.push([`gsap plugin: ${plugin[1]}`, size, PER_PLUGIN_BUDGET]);
    }
  }

  let failed = false;
  console.log("Bundle budget (gzipped)\n");
  for (const [label, actual, budget] of results) {
    const over = actual > budget;
    failed ||= over;
    const pct = budget ? Math.round((actual / budget) * 100) : 0;
    console.log(
      `  ${over ? "FAIL" : "ok  "}  ${label.padEnd(22)} ${fmt(actual).padStart(9)} / ${fmt(budget).padStart(9)}  (${pct}%)`
    );
  }

  if (failed) {
    console.error(
      "\nThe critical path grew past its budget.\n" +
        "Either the addition genuinely belongs there (raise the budget in this\n" +
        "file, deliberately) or something heavy leaked out of a lazy chunk —\n" +
        "check manualChunks in vite.config.js."
    );
    process.exitCode = 1;
  } else {
    console.log("\nAll bundles within budget.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
