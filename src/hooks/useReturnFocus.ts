import { useEffect, useRef } from "react";

/**
 * Where focus lands when the element that opened an overlay is no longer
 * focusable. `<main>` carries `tabIndex={-1}` for exactly this (the same
 * technique a skip link uses), so the visitor resumes at the top of the
 * content rather than nowhere.
 */
const FALLBACK_SELECTOR = "#main-content";

/**
 * An element can be present in the DOM and still be a dead focus target:
 * removed from the tree, hidden, or disabled. `HTMLElement.focus()` is silent
 * in every one of those cases — the call succeeds, focus moves to `<body>`,
 * and nothing tells you it happened.
 */
function canTakeFocus(node: Element | null): node is HTMLElement {
  if (!(node instanceof HTMLElement)) return false;
  if (!node.isConnected) return false;
  if (node.hasAttribute("disabled") || node.getAttribute("aria-hidden") === "true") return false;
  // offsetParent is null for display:none (and for position:fixed, hence the
  // rect check as a second opinion — fixed chrome is exactly what opens these).
  if (node.offsetParent === null && node.getClientRects().length === 0) return false;
  return true;
}

/**
 * Remembers what had focus when an overlay opened, and puts it back when the
 * overlay closes.
 *
 * The subtlety worth having a hook for is the failure path. Both modals here
 * used to call `opener.focus()` unconditionally on close; if that element had
 * since unmounted — a lazy section that scrolled away, a menu that collapsed —
 * the call did nothing at all and focus silently fell to `<body>`. For a
 * keyboard visitor that means the next Tab starts from the top of the
 * document, having lost their place entirely, with no visible cue that it
 * happened. Falling back to the main landmark keeps them inside the content.
 *
 * Pair it with whatever focus *trap* the overlay needs — the two modals here
 * want different trapping (a full cycle vs. pinned to a search input), so that
 * part deliberately stays with each component.
 */
export default function useReturnFocus(active: boolean): void {
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return undefined;

    opener.current = document.activeElement;

    return () => {
      const previous = opener.current;
      opener.current = null;

      if (canTakeFocus(previous)) {
        previous.focus();
        return;
      }

      const fallback = document.querySelector(FALLBACK_SELECTOR);
      if (canTakeFocus(fallback)) fallback.focus({ preventScroll: true });
    };
  }, [active]);
}
