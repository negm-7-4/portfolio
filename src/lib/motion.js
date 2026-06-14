/**
 * Shared motion constants — keeps animation feel cohesive across the app.
 * Use these instead of magic numbers so a global tweak only changes here.
 */

// Cinematic ease — most-used. Matches the editorial / Awwwards house style.
export const EASE_OUT = [0.22, 1, 0.36, 1];

// Tighter ease for snappy UI feedback (buttons, hover lifts, toasts).
export const EASE_SNAP = [0.18, 1, 0.32, 1];

// Symmetric ease for curtain reveals / overlay panels.
export const EASE_CURTAIN = [0.76, 0, 0.24, 1];

// Page-load entrances — long, generous.
export const DUR_INTRO = 0.85;
// Standard reveals (text + cards into view).
export const DUR_REVEAL = 0.6;
// Quick micro-interactions (hover, focus, toggles).
export const DUR_MICRO = 0.28;
// Heavy curtain transitions.
export const DUR_CURTAIN = 0.55;

// Springs
export const SPRING_SNAP = { type: "spring", stiffness: 360, damping: 28, mass: 0.5 };
export const SPRING_SOFT = { type: "spring", stiffness: 220, damping: 22, mass: 0.6 };
export const SPRING_BOUNCE = { type: "spring", stiffness: 280, damping: 16, mass: 0.5 };
