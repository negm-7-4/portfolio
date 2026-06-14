import { useEffect } from "react";
import { sections } from "../data/sections";

/**
 * Global keyboard navigation.
 *   ←  →  → jump to previous / next section
 *   Home   → jump to top (hero)
 *   End    → jump to last section
 *
 * Ignores key presses while typing into any form field.
 */
export default function useKeyboardNav(currentIndex) {
  useEffect(() => {
    const go = (id) => {
      if (window.__goto) return window.__goto(id);
      const el = document.getElementById(id);
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -40 });
      else el.scrollIntoView({ behavior: "smooth" });
    };

    const onKey = (e) => {
      // ignore if user is typing
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      // ignore if any modifier (let the browser shortcuts win)
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const i = typeof currentIndex === "number" ? currentIndex : 0;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = sections[Math.min(sections.length - 1, i + 1)];
        if (next) go(next.id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = sections[Math.max(0, i - 1)];
        if (prev) go(prev.id);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(sections[0].id);
      } else if (e.key === "End") {
        e.preventDefault();
        go(sections[sections.length - 1].id);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex]);
}
