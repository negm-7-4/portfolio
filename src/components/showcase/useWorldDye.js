import { useEffect } from "react";
import { projects } from "../../data/content";
import { experience } from "../../store/experience";

/**
 * While a showcase is on screen, the active project takes over the world:
 * its brand colour dyes the cinematic background's accent light and the
 * world camera dollies laterally (-1 → 1) as you move between projects.
 *
 * Extracted from the original Projects section so every presentation mode
 * keeps the same "each project dyes the whole scene" behaviour for free.
 */
export default function useWorldDye(active, inView) {
  // Release the dye when the showcase unmounts, no matter what.
  useEffect(
    () => () => {
      const s = experience.getState();
      s.setAccentOverride(null);
      s.setGallery(0);
    },
    []
  );

  useEffect(() => {
    const s = experience.getState();
    if (!inView) {
      s.setAccentOverride(null);
      s.setGallery(0);
      return;
    }
    const n = projects.length;
    s.setAccentOverride(projects[active]?.color || null);
    s.setGallery(n > 1 ? (active / (n - 1)) * 2 - 1 : 0);
  }, [active, inView]);
}
