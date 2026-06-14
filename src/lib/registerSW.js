/**
 * Register the service worker AFTER the page is fully loaded so it never
 * blocks paint. Auto-disabled in dev to keep HMR clean.
 */
export function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  // Wait for the load event so the SW registration doesn't compete with
  // the critical initial render
  window.addEventListener("load", () => {
    // Give the browser a beat before registering
    setTimeout(() => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => undefined);
    }, 1500);
  });
}
