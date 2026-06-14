import { useEffect, useState } from "react";

/**
 * Defers mounting its children until after the browser is idle (or
 * a max timeout has elapsed). Use for non-critical floating UI like
 * particle trails, vignettes, command palettes — anything that doesn't
 * need to be there for the first paint.
 *
 * When the document goes hidden (tab backgrounded), idle work is
 * skipped — saves CPU while the user isn't looking.
 */
export default function DeferredMount({ children, delay = 0 }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let canceled = false;
    let idleId, timeoutId;

    const tryMount = () => {
      if (canceled) return;
      // If the user already backgrounded the tab, wait until they return
      if (document.hidden) {
        const onVis = () => {
          if (!document.hidden) {
            document.removeEventListener("visibilitychange", onVis);
            tryMount();
          }
        };
        document.addEventListener("visibilitychange", onVis);
        return;
      }
      setReady(true);
    };

    const ric = window.requestIdleCallback;
    if (ric) {
      idleId = ric(tryMount, { timeout: 2000 + delay });
    } else {
      timeoutId = setTimeout(tryMount, 400 + delay);
    }

    return () => {
      canceled = true;
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay]);

  return ready ? children : null;
}
