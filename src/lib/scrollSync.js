/**
 * Shared lazy loader for GSAP + ScrollTrigger.
 *
 * Every GSAP consumer (Stats counters, the Manifesto scrub, …) goes through
 * here so the ~115 kB gsap chunk is fetched exactly once, and only when the
 * first scrubbed section actually mounts — never on the critical path.
 *
 * It also wires ScrollTrigger into the Lenis instance the moment GSAP
 * arrives: Lenis animates the real scroll position, so ScrollTrigger mostly
 * "just works", but pushing its update through Lenis's own scroll event keeps
 * pinned/scrubbed timelines frame-accurate instead of one rAF behind.
 */
let promise = null;

export function loadScrollSync() {
  if (!promise) {
    promise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        const lenis = window.__lenis;
        if (lenis && !lenis.__stSynced) {
          lenis.__stSynced = true;
          lenis.on("scroll", ScrollTrigger.update);
        }
        // Lazy sections below a trigger change the page height when their
        // chunks arrive, which strands ScrollTrigger's measured start/end
        // positions. Watch the document height and re-measure (debounced) so
        // pinned corridors stay frame-accurate no matter when chunks land.
        if (typeof ResizeObserver !== "undefined" && !document.body.__stObserved) {
          document.body.__stObserved = true;
          let tid = 0;
          const ro = new ResizeObserver(() => {
            clearTimeout(tid);
            tid = setTimeout(() => ScrollTrigger.refresh(), 200);
          });
          ro.observe(document.body);
        }
        return { gsap, ScrollTrigger };
      }
    );
  }
  return promise;
}
