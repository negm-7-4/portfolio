import { Component } from "react";

import { reportError } from "../lib/reportError";

/**
 * Renders `fallback` if its subtree throws.
 *
 * This matters more here than on a typical React site: most of the page is
 * WebGL, and GPU/driver reality is not uniform. A shader that fails to compile
 * on one Android driver, a lost context, a GLB that 404s — any of those throw
 * during render, and without a boundary React unmounts the *entire* tree. The
 * visitor gets a black page instead of a portfolio.
 *
 * So the 3D layers are each wrapped in one of these with a cheap 2D fallback,
 * and the whole app sits inside a final one.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode|((error: Error) => React.ReactNode)} props.fallback
 *   What to render instead. A function receives the error.
 * @param {string} [props.label] Name used in the dev-console warning.
 * @param {(error: Error, info: object) => void} [props.onError] Reporting hook.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    const label = this.props.label || "component";
    if (import.meta.env.DEV) {
      // Only in dev: a production console full of stack traces is noise for
      // the visitor and tells an attacker about the internals.
      console.warn(`[ErrorBoundary] ${label} failed, showing fallback:`, error, info);
    }

    /* Degrading gracefully without reporting means the failure is invisible:
       a visitor whose driver cannot compile a shader would silently get the
       2D fallback forever and nobody would ever learn. */
    reportError({ boundary: label, error, componentStack: info?.componentStack });

    this.props.onError?.(error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { fallback } = this.props;
    return typeof fallback === "function" ? fallback(error) : (fallback ?? null);
  }
}
