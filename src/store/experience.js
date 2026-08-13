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
    /**
     * Where the visitor is in the STORY, as a continuous chapter position:
     * 0 = chapter 0 is on screen, 1 = chapter 1, … and `sectionCount` = the
     * very bottom of the page.
     *
     * This is not `scroll * sectionCount`. Chapters are wildly different
     * heights — the projects gallery is several screens, the hero is one —
     * so a uniform split put every camera shot and every particle formation
     * somewhere between the two chapters it was composed for. The hero's own
     * shot was the worst casualty: it lived entirely behind the opaque cover
     * screen, and by the time the hero was actually visible the camera was a
     * third of the way to the About shot with the rings already dissolving.
     *
     * ExperienceBridge measures the real section offsets and interpolates
     * between them, so chapter k is exactly k and every shot lands.
     */
    story: 0,
    storyN: 0, // the same value normalised to 0 → 1, for journey-wide grades
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

    // ── Lifecycle ──
    // NB: there is deliberately no `reducedMotion` or `paused` here. Both used
    // to exist with setters nothing ever called, which read as "the world
    // responds to these" when it does not. Reduced motion is handled upstream
    // (it forces the "low" tier, and the low tier never mounts the world at
    // all), and pausing is the Canvas's own `frameloop` switch.
    ready: false, // the world has painted its first frame
    loadProgress: 0, // real asset progress 0 → 100 (drei useProgress, world chunk)

    // ── Writers ──
    setScroll: (scroll, velocity = 0, story = 0, storyN = 0) =>
      set({ scroll, velocity, story, storyN }),
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
    setReady: (ready) => set({ ready }),
    setLoadProgress: (loadProgress) => set({ loadProgress }),
  }))
);

// Non-hook accessor for use outside React (rAF loops, event handlers).
export const experience = useExperience;
