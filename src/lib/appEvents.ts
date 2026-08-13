/**
 * Cross-component app events.
 *
 * A handful of overlays (the CV modal, the command palette) are mounted far
 * from the buttons that open them, and prop-drilling through fifteen layers of
 * cinematic chrome to reach them would be worse than the problem. They listen
 * for a named event instead.
 *
 * The names live here rather than as inline string literals so a typo is a
 * type error instead of a button that silently does nothing, and so the full
 * list of "things the app can be told to do" is one file.
 */

export const APP_EVENTS = {
  openCv: "app:open-cv",
  openCommandPalette: "app:open-command-palette",
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

/** Fire an app event. */
export function emitAppEvent(name: AppEventName, detail?: unknown): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Subscribe to an app event. Returns an unsubscribe function. */
export function onAppEvent(name: AppEventName, handler: (event: CustomEvent) => void): () => void {
  const listener = handler as EventListener;
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}

/* Convenience wrappers for the two overlays the whole site can summon. */
export const openCv = (): void => emitAppEvent(APP_EVENTS.openCv);
export const openCommandPalette = (): void => emitAppEvent(APP_EVENTS.openCommandPalette);
