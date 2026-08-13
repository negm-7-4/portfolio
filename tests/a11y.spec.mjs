/**
 * Automated accessibility audit against the built site.
 *
 * Written as a plain script rather than a Playwright test-runner suite so it
 * needs no extra config and runs the same way locally and in CI:
 *
 *   npm run build && npm run test:a11y
 *
 * It walks the page the way a visitor does — cover screen, then scrolled
 * through every section so the lazy chunks have actually mounted — and runs
 * axe-core at each stop. Auditing only the first paint would miss most of
 * the site, since almost everything here arrives lazily.
 *
 * Violations are printed with the offending selectors and the process exits
 * non-zero, so this can gate a merge.
 */
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.A11Y_BASE_URL || "http://localhost:4173";

/* Rules disabled, with reasons. Keep this list short and argued — an audit
   whose exclusions are unexplained is not an audit. */
const DISABLED_RULES = [
  // The animated 3D world paints text over a moving WebGL canvas. axe cannot
  // resolve a background colour behind a canvas and reports every overlaid
  // string as "incomplete"; contrast on those is handled by the fixed scrim
  // (see the mobile veil in App.jsx) and checked by eye.
  "color-contrast-enhanced",
];

const scrollThroughPage = async (page) => {
  const stops = [];
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 1400;
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(220);
    stops.push(y);
  }
  return stops.length;
};

/* Jump every finite animation to its end state before measuring.
 *
 * axe folds an element's live `opacity` into its contrast maths, and this
 * site reveals almost everything with an opacity animation. Sampling at an
 * arbitrary moment therefore caught text at 40% through its entrance and
 * reported failures that exist in no state a human ever sees — a different
 * element roughly every other run. A gate that flaky is worse than no gate,
 * because it teaches everyone to re-run until it goes green.
 *
 * Waiting longer does not fix it (reveals re-trigger on scroll), and neither
 * does emulating reduced motion: Motion deliberately keeps opacity and colour
 * animations in that mode and only drops transform and layout ones.
 *
 * `finish()` lands each entrance on its settled, visible state — the state
 * contrast is actually about. Infinite animations (the caret blink, the
 * loading spinners) throw on finish and are left alone; they carry no text
 * whose contrast is being judged.
 */
const settleAnimations = async (page) => {
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        /* infinite iteration count — nothing to settle */
      }
    }
  });
  await page.waitForTimeout(120);
};

const audit = async (page, label) => {
  await settleAnimations(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // `data-decorative` marks aria-hidden ornament whose whole design is to
    // be barely visible — the giant 8%-white ghost numerals behind the project
    // titles. A contrast threshold is the wrong question for those, and the
    // attribute keeps the exception explicit and greppable instead of hidden
    // in a disabled rule that would also stop checking real text.
    .exclude("[data-decorative]")
    .disableRules(DISABLED_RULES)
    .analyze();
  return { label, violations: results.violations };
};

/* PLAYWRIGHT_BROWSERS_PATH points at a preinstalled Chromium in some
   environments; elsewhere (CI) Playwright resolves its own download. Only
   pass an explicit path when one is actually provided. */
const executablePath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const findings = [];

try {
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    {
      // axe-core/playwright requires a real context, not browser.newPage().
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });

      /* Wait for the preloader to actually leave before auditing.
       A fixed timeout raced its exit animation, and axe sampling a
       half-faded overlay computes contrast against a blend of the overlay
       and the page underneath — which reported a colour-contrast violation
       on the preloader wordmark roughly one run in two. A flaky gate is
       worse than no gate: it trains everyone to re-run until it passes. */
      await page
        .waitForFunction(
          () => {
            const el = document.querySelector("[data-preloader]");
            if (!el) return true;
            return getComputedStyle(el).opacity === "0";
          },
          { timeout: 20000 }
        )
        .catch(() => {
          // Preloader never resolved — audit anyway rather than fail the run
          // on a symptom; a genuinely stuck preloader is its own bug.
        });
      await page.waitForTimeout(1200);

      findings.push(await audit(page, `${label} · cover`));

      const stops = await scrollThroughPage(page);
      await page.waitForTimeout(2000);
      findings.push(await audit(page, `${label} · full page (${stops} stops)`));

      await page.close();
      await context.close();
    }
  }
} finally {
  await browser.close();
}

/* Deduplicate: the same violation shows up at every stop and both viewports. */
const byRule = new Map();
for (const { label, violations } of findings) {
  for (const v of violations) {
    const entry = byRule.get(v.id) ?? { ...v, where: new Set(), targets: new Set() };
    entry.where.add(label);
    v.nodes.forEach((n) => entry.targets.add(n.target.join(" ")));
    byRule.set(v.id, entry);
  }
}

if (byRule.size === 0) {
  console.log(`No accessibility violations across ${findings.length} audits (${BASE}).`);
  process.exit(0);
}

console.error(`\n${byRule.size} accessibility violation type(s):\n`);
for (const v of byRule.values()) {
  console.error(`  [${v.impact}] ${v.id} — ${v.help}`);
  console.error(`     seen in: ${[...v.where].join(", ")}`);
  [...v.targets].slice(0, 6).forEach((t) => console.error(`     → ${t}`));
  if (v.targets.size > 6) console.error(`     → …and ${v.targets.size - 6} more`);
  console.error(`     ${v.helpUrl}\n`);
}
process.exit(1);
