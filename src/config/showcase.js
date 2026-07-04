/**
 * ── Project Showcase Configuration ────────────────────────────────────
 * ONE variable switches the entire Projects presentation. Each mode is a
 * fully isolated, lazy-loaded chunk — switching modes never ships the
 * other modes' code to the browser.
 *
 *   "globe"    — Cinematic Half-Globe Experience. A realistic WebGL Earth
 *                holds the left of the frame while scroll flies the camera
 *                between per-project destinations. The signature mode.
 *
 *   "timeline" — Cinematic Keynote Timeline. A glowing spine grows down
 *                the page; each project arrives as a staged, masked
 *                keynote slide.
 *
 *   "cards"    — Premium Flip Cards. Physical glass cards that tilt to
 *                the cursor and flip with lift → anticipation → rotation
 *                → settle choreography.
 *
 *   "classic"  — The original two-column scrollytelling gallery,
 *                preserved untouched.
 *
 * This is the DEFAULT for first-time visitors — the section now renders a
 * three-button mode switcher (globe / timeline / cards) and remembers the
 * visitor's choice in localStorage ("showcase-mode").
 */
export const SHOWCASE_MODE = "globe";

/* Modes that need WebGL fall back to this when the device profile is
   low-tier or the user prefers reduced motion. */
export const SHOWCASE_FALLBACK = "classic";
