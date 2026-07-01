"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { useExperience } from "./store";
import { CHAPTER_COUNT } from "./journey";

type ScrollAPI = {
  /** Smooth-scroll to a chapter id (DOM element id), or to a y offset. */
  to: (target: string | number, opts?: { offset?: number; immediate?: boolean }) => void;
  lenis: () => Lenis | null;
};

const ScrollCtx = createContext<ScrollAPI | null>(null);
export const useScrollTo = () => {
  const ctx = useContext(ScrollCtx);
  return ctx ?? { to: () => {}, lenis: () => null };
};

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.085,
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    const { setScroll, setChapter } = useExperience.getState();

    lenis.on("scroll", (e: Lenis) => {
      const p = e.progress || 0;
      setScroll(p, e.velocity);
      // Equal scroll bands per act → highlight the current chapter.
      const ch = Math.min(CHAPTER_COUNT - 1, Math.max(0, Math.floor(p * CHAPTER_COUNT + 0.0001)));
      setChapter(ch);
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Pointer → normalized -1..1, fed to the scene for parallax / look-at.
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      useExperience.getState().setPointer(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const api: ScrollAPI = {
    to: (target, opts) => {
      const lenis = lenisRef.current;
      if (!lenis) return;
      const el = typeof target === "string" ? document.getElementById(target) : target;
      if (el == null) return;
      lenis.scrollTo(el as HTMLElement | number, {
        offset: opts?.offset ?? 0,
        immediate: opts?.immediate ?? false,
        duration: 1.4,
      });
    },
    lenis: () => lenisRef.current,
  };

  return <ScrollCtx.Provider value={api}>{children}</ScrollCtx.Provider>;
}
