"use client";

import { create } from "zustand";

export type Phase = "loading" | "intro" | "ready";
export type Quality = "low" | "mid" | "high";

interface ExperienceState {
  /** Lifecycle: loading → intro (reveal) → ready. */
  phase: Phase;
  /** Asset load progress 0..1 (from drei useProgress). */
  progress: number;
  /** Global scroll progress 0..1 across the whole page. */
  scroll: number;
  /** Smoothed scroll velocity (signed). */
  velocity: number;
  /** Active chapter index. */
  chapter: number;
  /** Normalized pointer, -1..1 on each axis, origin = center. */
  pointer: { x: number; y: number };
  /** Device quality tier — gates heavy effects. */
  quality: Quality;
  reducedMotion: boolean;
  /** Index of hovered project in the Work act, or null. */
  hoveredProject: number | null;
  /** Whether the command/menu overlay is open. */
  menuOpen: boolean;

  setPhase: (p: Phase) => void;
  setProgress: (n: number) => void;
  setScroll: (scroll: number, velocity: number) => void;
  setChapter: (i: number) => void;
  setPointer: (x: number, y: number) => void;
  setQuality: (q: Quality, reducedMotion: boolean) => void;
  setHoveredProject: (i: number | null) => void;
  setMenuOpen: (b: boolean) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  phase: "loading",
  progress: 0,
  scroll: 0,
  velocity: 0,
  chapter: 0,
  pointer: { x: 0, y: 0 },
  quality: "high",
  reducedMotion: false,
  hoveredProject: null,
  menuOpen: false,

  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setScroll: (scroll, velocity) => set({ scroll, velocity }),
  setChapter: (chapter) => set((s) => (s.chapter === chapter ? s : { chapter })),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setQuality: (quality, reducedMotion) => set({ quality, reducedMotion }),
  setHoveredProject: (hoveredProject) => set({ hoveredProject }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
