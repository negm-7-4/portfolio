/**
 * Error reporting.
 *
 * The site now degrades gracefully when a WebGL layer throws — but graceful
 * degradation without reporting means the failure is invisible. A visitor on
 * some Android driver silently gets the 2D fallback forever and nobody ever
 * learns the shader does not compile there.
 *
 * `@vercel/analytics` is already loaded for pageviews, so its custom events
 * are a free channel: no extra dependency, no extra request, no cookie. What
 * is sent is deliberately minimal — which boundary caught it and the error
 * name/message. No stack traces (they can carry file paths and user data), no
 * user identifiers.
 */

export interface ErrorReport {
  /** Which ErrorBoundary caught this, e.g. "CinematicWorld". */
  boundary: string;
  error: unknown;
  /** React's componentStack, used only to derive the failing component name. */
  componentStack?: string;
}

/** First component name out of React's component stack, if it is parseable. */
function topComponent(componentStack?: string): string | undefined {
  const first = componentStack?.trim().split("\n")[0]?.trim();
  return first?.replace(/^(in|at)\s+/, "").split(" ")[0] || undefined;
}

/**
 * Catch what React cannot.
 *
 * An ErrorBoundary only sees errors thrown during render, lifecycle or
 * effects. Anything async — a rejected `import()`, a failed fetch inside an
 * event handler, a throw from a rAF callback — bypasses it completely and
 * lands as an uncaught error. Those are exactly the failures a WebGL-heavy
 * site produces, so they are worth the same channel.
 *
 * Returns a teardown function.
 */
export function installGlobalErrorReporting(): () => void {
  const onError = (event: ErrorEvent) => {
    reportError({ boundary: "window.onerror", error: event.error ?? event.message });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    reportError({ boundary: "unhandledrejection", error: event.reason });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}

export function reportError({ boundary, error, componentStack }: ErrorReport): void {
  const err = error instanceof Error ? error : new Error(String(error));

  if (import.meta.env.DEV) {
    console.warn(`[report] ${boundary}:`, err);
    return;
  }

  // Fire-and-forget. A reporting failure must never surface to the visitor,
  // who is already looking at a fallback.
  void import("@vercel/analytics")
    .then(({ track }) => {
      track("client_error", {
        boundary,
        name: err.name,
        // Bounded: an unbounded message could carry a whole serialized object.
        message: err.message.slice(0, 200),
        component: topComponent(componentStack) ?? "unknown",
      });
    })
    .catch(() => {
      /* analytics blocked or offline — nothing useful to do */
    });
}
