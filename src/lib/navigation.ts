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
 *   3. native scrolling with the offset applied by hand.
 */

/**
 * The slice of Lenis this app actually uses. Keeps the import graph free of
 * Lenis, and documents the contract: anything satisfying this can drive the
 * site's scrolling, which is what makes the fallback path testable.
 */
export interface ScrollDriver {
  scrollTo: (
    target: Element | number | string,
    options?: { offset?: number; duration?: number | undefined; immediate?: boolean }
  ) => void;
  /** Suspend smooth scrolling — used while a modal holds the viewport. */
  stop?: () => void;
  /** Resume after a stop. */
  start?: () => void;
  readonly isStopped?: boolean;
}

export interface ScrollOptions {
  /** Pixels to shift the landing position by. Negative clears a sticky header. */
  offset?: number;
  /** Seconds. Only honoured by the smooth driver. */
  duration?: number;
  /** Jump with no animation (used while a transition curtain covers the page). */
  immediate?: boolean;
}

export interface GoToSectionOptions extends ScrollOptions {
  /**
   * Play the full-screen curtain transition. Pass `false` for in-place jumps
   * (a gallery scrolling itself into view) where a wipe would be disorienting.
   */
  cinematic?: boolean;
}

type SectionTransition = (id: string) => void;
type Unregister = () => void;

/** Sticky-header clearance applied to every section landing. */
export const NAV_OFFSET = -40;

let lenis: ScrollDriver | null = null;
let sectionTransition: SectionTransition | null = null;

/* ── Registration (called by useLenis / PageTransition on mount) ── */

export function registerLenis(instance: ScrollDriver): Unregister {
  lenis = instance;
  return () => {
    // Guarded so a late unmount cannot clear an instance registered after it.
    if (lenis === instance) lenis = null;
  };
}

/** The live Lenis instance, or null before it boots / after unmount. */
export function getLenis(): ScrollDriver | null {
  return lenis;
}

export function registerSectionTransition(fn: SectionTransition): Unregister {
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
export function scrollTo(target: Element | number | string, options: ScrollOptions = {}): void {
  const { offset = 0, duration, immediate = false } = options;

  /* Resolve the target BEFORE choosing a path. Lenis happens to accept a
     selector string too, which hid the fact that the two branches disagreed:
     a selector matching nothing was a silent no-op natively but reached Lenis
     as a live call. Resolving up front makes both behave the same. */
  const resolved = typeof target === "string" ? document.querySelector(target) : target;

  if (resolved == null) return;

  if (lenis) {
    lenis.scrollTo(resolved, { offset, duration, immediate });
    return;
  }

  const behavior: ScrollBehavior = immediate ? "auto" : "smooth";
  if (typeof resolved === "number") {
    window.scrollTo({ top: resolved, behavior });
    return;
  }
  // Native scrollIntoView has no offset, so do the arithmetic by hand.
  const top = resolved.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}

/** Back to the very top of the page. */
export function scrollToTop(options: ScrollOptions = {}): void {
  scrollTo(0, { duration: 1.6, ...options });
}

/**
 * Travel to a section by id.
 *
 * @returns `true` if the section exists and navigation started, `false` if
 *   there is no such section — so a caller can fall back rather than silently
 *   doing nothing.
 */
export function goToSection(id: string, options: GoToSectionOptions = {}): boolean {
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
