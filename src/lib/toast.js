/**
 * Toast transport.
 *
 * `ToastProvider` renders the toasts; this module is how anything that is not
 * a React component (or is mounted outside the provider) asks for one. The
 * provider registers its `show` function here on mount, so calling `toast()`
 * before the tree has mounted is a silent no-op rather than a crash.
 */

let show = null;

/** Called by ToastProvider. Returns an unregister function. */
export function registerToast(fn) {
  show = fn;
  return () => {
    if (show === fn) show = null;
  };
}

/**
 * Show a toast.
 * @param {string} message
 * @param {{kind?: "info"|"success"|"warn", icon?: string, duration?: number}} [options]
 */
export function toast(message, options) {
  show?.(message, options);
}
