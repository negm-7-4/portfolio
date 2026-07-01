import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

/**
 * ── The Experience Store ──────────────────────────────────────────────
 * The single channel through which the React DOM and the React-Three-Fiber
 * canvas talk to each other. The DOM layer (scroll, pointer, section
 * tracking) *writes* here; the 3D world *reads* transiently inside its
 * render loop via `useExperience.getState()` so the Canvas never re-renders
 * React on a scroll tick — it just lerps toward the latest values.
 *
 * Keep this lean. It is hot state, read every frame.
 */
export const useExperience = create(
  subscribeWithSelector((set) => ({
    // ── Live, per-frame state (written by ExperienceBridge) ──
    scroll: 0, // page progress 0 → 1
    velocity: 0, // smoothed scroll velocity (signed)
    pointer: { x: 0, y: 0 }, // normalised cursor, -1 → 1 on each axis
    sectionIndex: 0, // current chapter (0 → sectionCount-1)
    hovered: false, // cursor is over an interactive 3D object (the hero orb)

    // ── Configuration (written once on mount) ──
    sectionCount: 10,
    quality: "high", // 'high' | 'mid' — drives DPR, particle counts, post-fx
    reducedMotion: false,

    // ── Lifecycle ──
    ready: false, // the world has painted its first frame
    paused: false, // tab hidden → freeze the render loop

    // ── Writers ──
    setScroll: (scroll, velocity = 0) => set({ scroll, velocity }),
    setPointer: (x, y) =>
      set((s) => {
        // Mutate in place — pointer has no React subscribers, only the
        // canvas reads it transiently. Avoids allocating a new object 60×/s.
        s.pointer.x = x;
        s.pointer.y = y;
        return {};
      }),
    setSection: (sectionIndex) =>
      set((s) => (s.sectionIndex === sectionIndex ? {} : { sectionIndex })),
    setHovered: (hovered) =>
      set((s) => (s.hovered === hovered ? {} : { hovered })),
    setQuality: (quality) => set({ quality }),
    setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    setReady: (ready) => set({ ready }),
    setPaused: (paused) => set({ paused }),
  }))
);

// Non-hook accessor for use outside React (rAF loops, event handlers).
export const experience = useExperience;
