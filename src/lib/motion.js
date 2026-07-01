/**
 * Motion engine — the single source of truth for the site's animation feel.
 *
 * Everything here is tuned for a 60fps budget: the easings and springs are
 * shaped to settle quickly, and the variant factories below only ever animate
 * `transform` + `opacity` (and a brief one-shot `filter` blur on small text),
 * which the compositor can run on the GPU without touching layout.
 *
 * Import these instead of hand-rolling magic numbers so a global change to the
 * "house feel" happens in exactly one place.
 */

/* ─────────────────────────  EASINGS  ───────────────────────── */

// Master cinematic ease — strong expo-out. Front-loads the movement then
// glides to a stop. This is the Apple / Awwwards "premium" entrance curve.
export const EASE_OUT = [0.16, 1, 0.3, 1];

// The previous house ease — kept for places that want a gentler settle.
export const EASE_SOFT = [0.22, 1, 0.36, 1];

// Snappy UI feedback (buttons, toggles, toasts) — quick with a clean stop.
export const EASE_SNAP = [0.32, 0.94, 0.32, 1];

// Playful overshoot (badges, pills popping in). Tasteful back-out.
export const EASE_BACK = [0.34, 1.4, 0.5, 1];

// Symmetric in-out expo — curtains, overlay panels, page transitions.
export const EASE_CURTAIN = [0.83, 0, 0.17, 1];

/* ─────────────────────────  DURATIONS  ─────────────────────── */

export const DUR_INTRO   = 1.0;   // page-load hero entrances — long, generous
export const DUR_REVEAL  = 0.6;   // standard scroll reveals — snappy but cinematic
export const DUR_MICRO   = 0.24;  // hover / focus / toggles
export const DUR_CURTAIN = 0.6;   // heavy curtain transitions

/* ─────────────────────────  SPRINGS  ───────────────────────── */

// Magnetic pulls / cursor-followers — light + responsive, near-critically damped.
export const SPRING_MAGNET = { type: "spring", stiffness: 260, damping: 20, mass: 0.5 };
// UI snap — buttons springing back, tap release.
export const SPRING_SNAP   = { type: "spring", stiffness: 420, damping: 30, mass: 0.6 };
// Soft settle — cards, panels easing into place with a whisper of life.
export const SPRING_SOFT   = { type: "spring", stiffness: 200, damping: 26, mass: 0.9 };
// Text fold-up — slight overshoot so words "land" with character.
export const SPRING_TEXT   = { type: "spring", stiffness: 180, damping: 20, mass: 1 };
// Lenis-paired scroll smoothing — slow, heavy, silky parallax.
export const SPRING_SCROLL = { stiffness: 90, damping: 26, mass: 0.7 };

/* shared in-view trigger — fires every time, just before the element lands */
export const VIEWPORT = { once: false, margin: "-12% 0px -12% 0px" };

/* ─────────────────────  VARIANT FACTORIES  ─────────────────── */

const OFFSETS = {
  up:    { y: 56,  x: 0  },
  down:  { y: -56, x: 0  },
  left:  { x: 56,  y: 0  },
  right: { x: -56, y: 0  },
  none:  { x: 0,   y: 0  },
};

/**
 * Cinematic reveal variants — slide + fade + a hair of scale/perspective for
 * depth. Transform + opacity only (plus an optional one-shot blur on text).
 */
export function revealVariants({ dir = "up", distance, blur = false, depth = false } = {}) {
  const base = OFFSETS[dir] || OFFSETS.up;
  const off = distance != null
    ? { x: base.x === 0 ? 0 : Math.sign(base.x) * distance, y: base.y === 0 ? 0 : Math.sign(base.y) * distance }
    : base;

  return {
    hidden: {
      opacity: 0,
      ...off,
      scale: depth ? 0.96 : 1,
      rotateX: depth ? 7 : 0,
      filter: blur ? "blur(8px)" : undefined,
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: blur ? "blur(0px)" : undefined,
    },
  };
}

/** Stagger container — drives a cascade of children. */
export function staggerContainer(stagger = 0.07, delayChildren = 0) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/** Per-word / per-char fold-up child for split text. */
export function foldChild({ blur = true, rotate = 32 } = {}) {
  return {
    hidden: {
      y: "115%",
      opacity: 0,
      rotateX: rotate,
      filter: blur ? "blur(6px)" : undefined,
    },
    show: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
      filter: blur ? "blur(0px)" : undefined,
      transition: { ...SPRING_TEXT, opacity: { duration: 0.4 }, filter: { duration: 0.4 } },
    },
  };
}
