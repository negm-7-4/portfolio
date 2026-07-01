/**
 * Service worker lifecycle.
 *
 * In PRODUCTION: register after load so repeat visits are instant.
 *
 * In DEV: actively TEAR DOWN any service worker + caches. A SW left over from
 * a past `npm run preview` (production) lives on the same `localhost` origin
 * and, with stale-while-revalidate, serves OLD cached JS chunks into the Vite
 * dev server. That mixes two dependency-optimizer runs and surfaces as
 * "more than one copy of React" / "Invalid hook call" / a black screen.
 * Nuking it in dev guarantees a clean module graph.
 */
export function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations?.()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => undefined);
    if (typeof caches !== "undefined" && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => undefined);
    }
    return;
  }

  // Wait for the load event so registration doesn't compete with first paint.
  window.addEventListener("load", () => {
    setTimeout(() => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }, 1500);
  });
}
