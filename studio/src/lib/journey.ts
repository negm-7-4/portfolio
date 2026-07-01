// ============================================================
// THE JOURNEY — a 5-act film structure.
// Each chapter owns: a DOM band of content, a camera keyframe
// (position + look-at target), and a color grade (fog/accent).
// The CameraRig samples between these stops by global scroll
// progress, so the whole site is ONE continuous camera move.
// ============================================================

export type Vec3 = [number, number, number];

export interface Chapter {
  id: string;
  num: string;
  label: string;
  /** Camera world position at this act's center. */
  camPos: Vec3;
  /** Where the camera looks at this act's center. */
  camTarget: Vec3;
  /** Cool accent for grading / lights / UI. */
  accent: string;
  /** Fog + ambient base color for this act. */
  fog: string;
}

export const chapters: Chapter[] = [
  {
    id: "intro",
    num: "00",
    label: "Intro",
    camPos: [0, 0.15, 7.2],
    camTarget: [0, 0, 0],
    accent: "#aab4c4",
    fog: "#06070b",
  },
  {
    id: "about",
    num: "01",
    label: "About",
    camPos: [3.4, -0.7, 5.4],
    camTarget: [0.4, -0.2, 0],
    accent: "#b8c1d0",
    fog: "#070910",
  },
  {
    id: "skills",
    num: "02",
    label: "Skills",
    camPos: [-3.0, 1.5, 5.0],
    camTarget: [-0.2, 0.7, -0.6],
    accent: "#c8d2dd",
    fog: "#080b14",
  },
  {
    id: "work",
    num: "03",
    label: "Work",
    camPos: [0.2, 0.5, 3.6],
    camTarget: [0, 0.1, -5.5],
    accent: "#b4c4d6",
    fog: "#070a12",
  },
  {
    id: "contact",
    num: "04",
    label: "Contact",
    camPos: [0, 1.3, 9.8],
    camTarget: [0, 0.2, -1.2],
    accent: "#ccd6e4",
    fog: "#05070d",
  },
];

export const CHAPTER_COUNT = chapters.length;

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smootherstep — C2-continuous ease for buttery camera moves. */
export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/**
 * Sample a camera keyframe (position + target) at global progress p∈[0,1].
 * Walks the chapter stops and eases between the bracketing pair.
 */
export function sampleCamera(p: number): { pos: Vec3; target: Vec3 } {
  const n = chapters.length - 1;
  const x = Math.min(0.9999, Math.max(0, p)) * n;
  const i = Math.floor(x);
  const f = smooth(x - i);
  const a = chapters[i];
  const b = chapters[Math.min(n, i + 1)];
  return {
    pos: [
      lerp(a.camPos[0], b.camPos[0], f),
      lerp(a.camPos[1], b.camPos[1], f),
      lerp(a.camPos[2], b.camPos[2], f),
    ],
    target: [
      lerp(a.camTarget[0], b.camTarget[0], f),
      lerp(a.camTarget[1], b.camTarget[1], f),
      lerp(a.camTarget[2], b.camTarget[2], f),
    ],
  };
}
