/**
 * Transient, mutable state shared between the DOM layer (ScrollTrigger,
 * pointer events) and the R3F globe scene. The scene reads these inside
 * its render loop every frame; the DOM writes them on scroll/pointer —
 * neither side ever causes a React re-render. Same pattern as the site's
 * experience store, but scoped to the showcase and even cheaper.
 */
export const globeState = {
  /** Raw scroll progress 0 → 1 across the pinned wrapper. */
  progress: 0,
  /** Continuous destination index 0 → n-1 (with a hold tail at the end). */
  x: 0,
  /** Normalised pointer over the section, -1 → 1 on each axis. */
  pointer: { x: 0, y: 0 },
};
