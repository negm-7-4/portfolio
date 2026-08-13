/**
 * Navigation — the single owner of "how this site moves".
 *
 * Everything that scrolls the page goes through here. Before this module the
 * same eight lines were copy-pasted into seven components via three global
 * `window.__*` handles (`__lenis`, `__goto`, `__toast`), which meant load
 * order decided whether a click was cinematic or a hard jump.
 *
 * The Lenis instance and the cinematic section transition register themselves
 * here when they mount; every caller just asks for `goToSection(id)` and gets
 * the best available behaviour:
 *
 *   1. the PageTransition curtain (if it is mounted), else
 *   2. a Lenis smooth scroll (if Lenis is running), else
 *   3. native `scrollIntoView`.
 */

/** Sticky-header clearance applied to every section landing. */
export const NAV_OFFSET = -40;

let lenis = null;
let sectionTransition = null;

/* ── Registration (called by useLenis / PageTransition on mount) ── */

export function registerLenis(instance) {
  lenis = instance;
  return () => {
    if (lenis === instance) lenis = null;
  };
}

/** The live Lenis instance, or null before it boots / after unmount. */
export function getLenis() {
  return lenis;
}

export function registerSectionTransition(fn) {
  sectionTransition = fn;
  return () => {
    if (sectionTransition === fn) sectionTransition = null;
  };
}

/* ── Scrolling ── */

/**
 * Scroll to an element, a numeric offset, or a selector — smoothly through
 * Lenis when it is available, natively otherwise.
 */
export function scrollTo(target, options = {}) {
  const { offset = 0, duration, immediate = false } = options;

  if (lenis) {
    lenis.scrollTo(target, { offset, duration, immediate });
    return;
  }

  const behavior = immediate ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  // Native scrollIntoView has no offset, so do the arithmetic by hand.
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}

/** Back to the very top of the page. */
export function scrollToTop(options = {}) {
  scrollTo(0, { duration: 1.6, ...options });
}

/**
 * Travel to a section by id.
 *
 * `cinematic: false` skips the curtain transition — use it for in-place jumps
 * (a gallery scrolling itself into view) where a full-screen wipe would be
 * disorienting.
 */
export function goToSection(id, options = {}) {
  const { cinematic = true, offset = NAV_OFFSET } = options;
  const el = document.getElementById(id);
  if (!el) return false;

  if (cinematic && sectionTransition) {
    sectionTransition(id);
    return true;
  }

  scrollTo(el, { offset });
  return true;
}
