import { useEffect } from "react";
import { experience } from "../store/experience";
import { sections } from "../data/sections";

/**
 * ExperienceBridge — the DOM → store pump. Renders nothing.
 *
 * It is the *only* place the page's scroll position and cursor are read for
 * the 3D world. It normalises them and writes them into the experience store;
 * the Canvas reads them transiently inside its render loop. This keeps the
 * two worlds decoupled: the DOM owns input, the store is the wire, the canvas
 * just listens.
 */
export default function ExperienceBridge() {
  useEffect(() => {
    const store = experience.getState();
    store.setSection(0);
    // keep the store's section count honest with the real chapter list
    experience.setState({ sectionCount: sections.length });

    let raf = 0;
    let running = true;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0; // smoothed signed velocity (px/ms)

    const loop = (t) => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      const dt = Math.max(t - lastT, 1);
      const raw = (y - lastY) / dt;
      // Ease the velocity so it ramps in and decays out smoothly to rest.
      vel += (raw - vel) * 0.18;
      lastY = y;
      lastT = t;

      const s = experience.getState();
      s.setScroll(progress, vel);

      const idx = Math.min(
        s.sectionCount - 1,
        Math.max(0, Math.floor(progress * s.sectionCount + 0.0001))
      );
      s.setSection(idx);

      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onPointer = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      experience.getState().setPointer(x, y);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Don't burn a rAF loop on a hidden tab.
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        lastT = performance.now();
        lastY = window.scrollY;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
