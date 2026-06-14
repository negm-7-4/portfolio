import { useEffect } from "react";

/**
 * Quietly prefetches the lazy section chunks after the page has been idle.
 * Result: when the user actually scrolls down, the chunks are already in
 * the HTTP cache so Suspense flips to the real component immediately —
 * no skeleton blink, no parse delay.
 *
 * Only runs when the network connection looks decent (skips on saveData
 * or slow-2g) so it doesn't waste mobile bandwidth.
 */
const PREFETCHERS = [
  () => import("./sections/Services"),
  () => import("./sections/Skills"),
  () => import("./sections/Experience"),
  () => import("./sections/Process"),
  () => import("./sections/Projects"),
  () => import("./sections/Testimonials"),
  () => import("./sections/Socials"),
  () => import("./sections/Contact"),
  () => import("./sections/Footer"),
];

export default function PrefetchSections() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user data preferences
    const conn = navigator.connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return;

    let i = 0;
    let canceled = false;

    const fetchNext = (deadline) => {
      if (canceled) return;
      // Run as many imports as we can fit in this idle window
      while (
        i < PREFETCHERS.length &&
        (!deadline || deadline.timeRemaining?.() > 5 || deadline.didTimeout)
      ) {
        PREFETCHERS[i]?.().catch(() => undefined);
        i++;
        if (!deadline) break; // setTimeout fallback — only fire one per beat
      }
      if (i < PREFETCHERS.length) schedule();
    };

    const schedule = () => {
      if (canceled) return;
      const ric = window.requestIdleCallback;
      if (ric) ric(fetchNext, { timeout: 3000 });
      else setTimeout(() => fetchNext(null), 600);
    };

    // Wait for the page to fully load first so we never compete with
    // critical resources
    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => { canceled = true; };
  }, []);

  return null;
}
