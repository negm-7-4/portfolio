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

/** Rendering quality tier, mirrored from `useDeviceProfile`. */
export type Quality = "high" | "mid";

export interface ExperienceState {
  // ── Live, per-frame state (written by ExperienceBridge) ──
  /** Page progress 0 → 1. */
  scroll: number;
  /** Smoothed scroll velocity, signed. */
  velocity: number;
  /** Normalised cursor, -1 → 1 on each axis. Mutated in place; see setPointer. */
  pointer: { x: number; y: number };
  sectionIndex: number;
  /** Cursor is over an interactive 3D object (the hero orb). */
  hovered: boolean;
  /** Hex string while the projects gallery is on screen — dyes the world. */
  accentOverride: string | null;
  /** -1 → 1 across the projects gallery; lateral camera dolly. */
  gallery: number;
  /** Arrival shockwave — set to 1 on anchor nav, decays inside the world. */
  warp: number;
  /** Radial pulse through the particle field; MorphField owns the decay. */
  shock: number;

  // ── Configuration (written once on mount) ──
  sectionCount: number;
  quality: Quality;
  reducedMotion: boolean;

  // ── Lifecycle ──
  ready: boolean;
  paused: boolean;
  /** Real asset progress 0 → 100. */
  loadProgress: number;

  // ── Writers ──
  setScroll: (scroll: number, velocity?: number) => void;
  setPointer: (x: number, y: number) => void;
  setSection: (sectionIndex: number) => void;
  setHovered: (hovered: boolean) => void;
  setAccentOverride: (accentOverride: string | null) => void;
  setGallery: (gallery: number) => void;
  setWarp: (warp: number) => void;
  setShock: (shock: number) => void;
  setQuality: (quality: Quality) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setReady: (ready: boolean) => void;
  setPaused: (paused: boolean) => void;
  setLoadProgress: (loadProgress: number) => void;
}

export const useExperience = create<ExperienceState>()(
  subscribeWithSelector((set) => ({
    // ── Live, per-frame state (written by ExperienceBridge) ──
    scroll: 0, // page progress 0 → 1
    velocity: 0, // smoothed scroll velocity (signed)
    pointer: { x: 0, y: 0 }, // normalised cursor, -1 → 1 on each axis
    sectionIndex: 0, // current chapter (0 → sectionCount-1)
    hovered: false, // cursor is over an interactive 3D object (the hero orb)
    accentOverride: null, // hex string while the projects gallery is on screen — dyes the world
    gallery: 0, // -1 → 1 across the projects gallery; lateral camera dolly
    warp: 0, // arrival shockwave — set to 1 on anchor nav, decays inside the world
    shock: 0, // radial pulse through the particle field — hero-orb click sets 1, MorphField owns the decay

    // ── Configuration (written once on mount) ──
    sectionCount: 10,
    quality: "high", // 'high' | 'mid' — drives DPR, particle counts, post-fx
    reducedMotion: false,

    // ── Lifecycle ──
    ready: false, // the world has painted its first frame
    paused: false, // tab hidden → freeze the render loop
    loadProgress: 0, // real asset progress 0 → 100 (drei useProgress, world chunk)

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
    setHovered: (hovered) => set((s) => (s.hovered === hovered ? {} : { hovered })),
    setAccentOverride: (accentOverride) =>
      set((s) => (s.accentOverride === accentOverride ? {} : { accentOverride })),
    setGallery: (gallery) => set((s) => (s.gallery === gallery ? {} : { gallery })),
    setWarp: (warp) => set({ warp }),
    setShock: (shock) => set({ shock }),
    setQuality: (quality) => set({ quality }),
    setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    setReady: (ready) => set({ ready }),
    setPaused: (paused) => set({ paused }),
    setLoadProgress: (loadProgress) => set({ loadProgress }),
  }))
);

// Non-hook accessor for use outside React (rAF loops, event handlers).
export const experience = useExperience;
