/**
 * Toast transport.
 *
 * `ToastProvider` renders the toasts; this module is how anything that is not
 * a React component (or is mounted outside the provider) asks for one. The
 * provider registers its `show` function here on mount, so calling `toast()`
 * before the tree has mounted is a silent no-op rather than a crash.
 */

export type ToastKind = "info" | "success" | "warn";

export interface ToastOptions {
  kind?: ToastKind;
  /** A single glyph shown before the message. */
  icon?: string;
  /** Milliseconds on screen. Drives the progress bar too. */
  duration?: number;
}

export type ShowToast = (message: string, options?: ToastOptions) => void;

let show: ShowToast | null = null;

/** Called by ToastProvider. Returns an unregister function. */
export function registerToast(fn: ShowToast): () => void {
  show = fn;
  return () => {
    // Guarded so a replaced provider's cleanup cannot silence the live one.
    if (show === fn) show = null;
  };
}

/** Show a toast. No-op if no provider is mounted. */
export function toast(message: string, options?: ToastOptions): void {
  show?.(message, options);
}
