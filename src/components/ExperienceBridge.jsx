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

    /* ── Chapter anchors ────────────────────────────────────────────────
       The scroll position at which each chapter's section reaches the top of
       the viewport, plus a terminator at the page's end. This is what turns
       raw scroll into the story position the 3D world is choreographed
       against; see the `story` note in the store for why the old uniform
       split could not work.

       Re-measured whenever the document's height changes, because almost
       every section below the fold arrives in a lazy chunk and replaces a
       short placeholder — measure once at mount and every anchor below the
       fold is wrong for the rest of the session. */
    let anchors = [];
    let measuredHeight = -1;

    const measure = (max) => {
      const next = sections.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });

      // A section that is not in the DOM yet gets an evenly spaced guess
      // between its known neighbours rather than dropping out of the map.
      for (let i = 0; i < next.length; i++) {
        if (next[i] != null) continue;
        let prev = i - 1;
        while (prev >= 0 && next[prev] == null) prev--;
        let ahead = i + 1;
        while (ahead < next.length && next[ahead] == null) ahead++;
        const lo = prev >= 0 ? next[prev] : 0;
        const hi = ahead < next.length ? next[ahead] : max;
        next[i] = lo + ((hi - lo) * (i - prev)) / (ahead - prev);
      }

      next.push(max); // terminator: the bottom of the page

      // Strictly increasing, so the segment search below can never divide by
      // zero on two sections that happen to start at the same offset.
      for (let i = 1; i < next.length; i++) {
        if (next[i] <= next[i - 1]) next[i] = next[i - 1] + 1;
      }
      anchors = next;
    };

    /** Raw scrollY → continuous chapter position, 0 … sections.length. */
    const toStory = (y) => {
      if (anchors.length < 2) return 0;
      if (y <= anchors[0]) return 0;
      const last = anchors.length - 1;
      if (y >= anchors[last]) return last;
      // Linear scan: ten entries, and it starts where it left off in practice.
      for (let i = 0; i < last; i++) {
        if (y < anchors[i + 1]) {
          return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
        }
      }
      return last;
    };

    const loop = (t) => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      if (doc.scrollHeight !== measuredHeight) {
        measuredHeight = doc.scrollHeight;
        measure(max);
      }

      const dt = Math.max(t - lastT, 1);
      const raw = (y - lastY) / dt;
      // Ease the velocity so it ramps in and decays out smoothly to rest.
      vel += (raw - vel) * 0.18;
      lastY = y;
      lastT = t;

      const s = experience.getState();
      const story = toStory(y);
      // Normalised against the LAST CHAPTER, not the page terminator, so the
      // finale grade is fully reached by the time contact is on screen.
      const span = Math.max(1, sections.length - 1);
      s.setScroll(progress, vel, story, Math.min(1, story / span));

      // The chapter the visitor is actually in — from the same measurement,
      // so the world's dye, the comets and the camera can never disagree
      // about which chapter is on screen.
      s.setSection(Math.min(sections.length - 1, Math.max(0, Math.round(story))));

      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onPointer = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      experience.getState().setPointer(x, y);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Gyroscope parallax on touch devices — tilting the phone drifts the
    // camera the way the mouse does on desktop. Android fires these freely;
    // iOS 13+ gates them behind a permission gesture we never ask for, so
    // there this is simply a silent no-op.
    const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    let onOrient = null;
    if (coarse) {
      let sx = 0;
      let sy = 0;
      onOrient = (e) => {
        if (e.gamma == null || e.beta == null) return;
        // gamma: left/right tilt; beta: front/back (≈45° is a natural hold).
        const x = Math.max(-1, Math.min(1, e.gamma / 28));
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / 32));
        sx += (x - sx) * 0.12;
        sy += (y - sy) * 0.12;
        experience.getState().setPointer(sx, -sy);
      };
      window.addEventListener("deviceorientation", onOrient, { passive: true });
    }

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
      if (onOrient) window.removeEventListener("deviceorientation", onOrient);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
