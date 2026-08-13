// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import useReturnFocus from "./useReturnFocus";

/**
 * The interesting behaviour here is entirely in the failure path.
 *
 * Restoring focus to a live button is the easy case and both modals already
 * did it. What neither did was notice when the opener had gone — an unmounted
 * lazy section, a collapsed menu — at which point `focus()` succeeds, does
 * nothing, and focus lands on `<body>`. Nothing throws and nothing is logged;
 * the only symptom is a keyboard visitor being silently teleported to the top
 * of the document. These tests pin that down.
 *
 * jsdom reports `offsetParent === null` and no client rects for every element,
 * so `canTakeFocus`'s visibility checks would reject everything. The harness
 * therefore stubs `getClientRects` on the nodes that are meant to be visible,
 * which is also a fair description of what the browser reports for them.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RECT = [{ width: 10, height: 10 }] as any;

function makeVisible(el: HTMLElement) {
  el.getClientRects = () => RECT;
  return el;
}

function Harness({ active }: { active: boolean }) {
  useReturnFocus(active);
  return null;
}

let container: HTMLDivElement;
let root: Root;

function render(active: boolean) {
  act(() => {
    root.render(<Harness active={active} />);
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.innerHTML = "";
});

describe("useReturnFocus", () => {
  it("returns focus to whatever was focused when it activated", () => {
    const opener = makeVisible(document.createElement("button"));
    document.body.appendChild(opener);
    opener.focus();
    expect(document.activeElement).toBe(opener);

    render(true);

    // The overlay takes focus while open.
    const inside = makeVisible(document.createElement("button"));
    document.body.appendChild(inside);
    inside.focus();
    expect(document.activeElement).toBe(inside);

    render(false);
    expect(document.activeElement).toBe(opener);
  });

  it("falls back to the main landmark when the opener has been removed", () => {
    // The regression: a lazy section unmounts while the overlay is open. The
    // old code called focus() on the detached node, which silently did
    // nothing, and the visitor resumed tabbing from the top of the document.
    const main = makeVisible(document.createElement("main"));
    main.id = "main-content";
    main.tabIndex = -1;
    document.body.appendChild(main);

    const opener = makeVisible(document.createElement("button"));
    document.body.appendChild(opener);
    opener.focus();

    render(true);
    opener.remove();
    render(false);

    expect(document.activeElement).toBe(main);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("falls back when the opener is still attached but no longer visible", () => {
    // Same silent no-op, different cause: the opener is display:none now
    // (a menu that closed behind the overlay).
    const main = makeVisible(document.createElement("main"));
    main.id = "main-content";
    main.tabIndex = -1;
    document.body.appendChild(main);

    const opener = document.createElement("button");
    makeVisible(opener);
    document.body.appendChild(opener);
    opener.focus();

    render(true);
    opener.getClientRects = () => [] as unknown as DOMRectList;
    render(false);

    expect(document.activeElement).toBe(main);
  });

  it("does not move focus at all while it stays active", () => {
    const opener = makeVisible(document.createElement("button"));
    document.body.appendChild(opener);
    opener.focus();

    render(true);
    render(true);

    expect(document.activeElement).toBe(opener);
  });

  it("restores on unmount, not only on deactivation", () => {
    // Overlays here live inside AnimatePresence and can be torn down while
    // still nominally open.
    const opener = makeVisible(document.createElement("button"));
    document.body.appendChild(opener);
    opener.focus();

    render(true);

    const inside = makeVisible(document.createElement("button"));
    document.body.appendChild(inside);
    inside.focus();

    act(() => root.unmount());
    expect(document.activeElement).toBe(opener);

    // Keep afterEach's unmount harmless.
    act(() => {
      root = createRoot(container);
    });
  });

  it("leaves focus alone when there is no opener and no landmark", () => {
    // Nothing to restore to is not a crash.
    render(true);
    expect(() => render(false)).not.toThrow();
  });
});
