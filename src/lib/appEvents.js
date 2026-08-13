/**
 * Cross-component app events.
 *
 * A handful of overlays (the CV modal, the command palette) are mounted far
 * from the buttons that open them, and prop-drilling through fifteen layers of
 * cinematic chrome to reach them would be worse than the problem. They listen
 * for a named event instead.
 *
 * The names live here rather than as inline string literals so a typo is a
 * missing import instead of a button that silently does nothing, and so the
 * full list of "things the app can be told to do" is one file.
 */

export const APP_EVENTS = {
  openCv: "app:open-cv",
  openCommandPalette: "app:open-command-palette",
};

/** Fire an app event. */
export function emitAppEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Subscribe to an app event. Returns an unsubscribe function. */
export function onAppEvent(name, handler) {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}

/* Convenience wrappers for the two overlays the whole site can summon. */
export const openCv = () => emitAppEvent(APP_EVENTS.openCv);
export const openCommandPalette = () => emitAppEvent(APP_EVENTS.openCommandPalette);
