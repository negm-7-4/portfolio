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

const audit = async (page, label) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
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
    // axe-core/playwright requires a real context, not browser.newPage().
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2500);

    findings.push(await audit(page, `${label} · cover`));

    const stops = await scrollThroughPage(page);
    await page.waitForTimeout(2000);
    findings.push(await audit(page, `${label} · full page (${stops} stops)`));

    await page.close();
    await context.close();
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
