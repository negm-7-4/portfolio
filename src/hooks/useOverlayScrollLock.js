import { useEffect } from "react";

let activeLocks = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";
let lockedLenis = null;
let shouldRestartLenis = false;

/**
 * Locks the document while an overlay is open without disabling native scroll
 * inside elements marked with `data-lenis-prevent`.
 *
 * The module-level counter keeps nested/overlapping overlays from restarting
 * Lenis or unlocking the body until the final overlay has closed.
 */
export default function useOverlayScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    if (activeLocks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;

      const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
      const currentPadding = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight
      ) || 0;

      document.body.style.overflow = "hidden";
      if (scrollbarGap > 0) {
        document.body.style.paddingRight = `${currentPadding + scrollbarGap}px`;
      }

      lockedLenis = window.__lenis ?? null;
      shouldRestartLenis = Boolean(lockedLenis && !lockedLenis.isStopped);
      if (shouldRestartLenis) lockedLenis.stop();
    }

    activeLocks += 1;

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);
      if (activeLocks > 0) return;

      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;

      if (shouldRestartLenis) lockedLenis?.start?.();
      lockedLenis = null;
      shouldRestartLenis = false;
    };
  }, [active]);
}
