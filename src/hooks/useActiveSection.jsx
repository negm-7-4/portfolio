import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMotionValue } from "motion/react";
import { sections } from "../data/sections";
import { goToSection } from "../lib/navigation";

/**
 * Tracks which section is currently most-in-view via IntersectionObserver.
 * Re-observes when section elements get swapped in the DOM (lazy section
 * components replacing their Suspense placeholders).
 *
 * Exposes:
 *   - active:   section object (re-renders consumers on change)
 *   - index:    position in `sections` array
 *   - progress: 0–1 motion value — subscribe via .get() or motion props.
 *               Does NOT trigger React re-renders on every scroll tick.
 *   - goto(id): smooth-scroll helper (prefers global Lenis if available)
 */
const Ctx = createContext({
  active: sections[0],
  index: 0,
  progress: null,
  goto: () => {},
});

export function ActiveSectionProvider({ children }) {
  const [active, setActive] = useState(sections[0]);
  const progress = useMotionValue(0);
  const observedRef = useRef(new Map()); // id → element currently observed

  useEffect(() => {
    // Captured once: cleanup must clear the same map this effect populated,
    // not whatever the ref points at by the time React tears the effect down.
    const observed = observedRef.current;
    const ratios = new Map(sections.map((s) => [s.id, 0]));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.intersectionRatio);
        }
        let bestId = sections[0].id;
        let bestRatio = -1;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        const next = sections.find((s) => s.id === bestId);
        if (next) setActive((cur) => (cur.id === next.id ? cur : next));
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "-15% 0px -15% 0px",
      }
    );

    /** Sync the IO with whatever section elements currently exist in DOM.
     *  Re-attaches observation when lazy sections swap in. */
    const sync = () => {
      for (const s of sections) {
        const el = document.getElementById(s.id);
        const prev = observed.get(s.id);
        if (el !== prev) {
          if (prev) io.unobserve(prev);
          if (el) io.observe(el);
          if (el) observed.set(s.id, el);
          else observed.delete(s.id);
        }
      }
      return observed.size === sections.length;
    };

    const allResolved = sync();

    /* Watch for lazy section chunks swapping their placeholders out.
     *
     * This used to observe document.body with subtree:true for the lifetime of
     * the page. On a page whose entire premise is AnimatePresence adding and
     * removing nodes constantly, that fired hundreds of times for the handful
     * of mutations that actually mattered.
     *
     * Two changes: scope it to the <main> that actually contains the sections,
     * and — since sections only ever appear, never disappear — disconnect for
     * good once every one has been found. In practice the observer is alive
     * for the first few seconds of the visit and then costs nothing.
     */
    let mo = null;
    if (!allResolved) {
      let pending = false;
      const scheduledSync = () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          if (sync()) {
            mo?.disconnect();
            mo = null;
          }
        });
      };
      mo = new MutationObserver(scheduledSync);
      mo.observe(document.getElementById("main-content") ?? document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Page progress 0–1 — written into a motion value so subscribers
    // (ChapterRail height, ReadingIndicator percentage, etc.) don't
    // trigger React re-renders on every scroll event.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      mo?.disconnect();
      observed.clear();
      window.removeEventListener("scroll", onScroll);
    };
  }, [progress]);

  const value = useMemo(() => {
    const index = sections.findIndex((s) => s.id === active.id);
    return { active, index, progress, goto: goToSection };
  }, [active, progress]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveSection() {
  return useContext(Ctx);
}
