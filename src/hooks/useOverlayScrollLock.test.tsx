// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import useOverlayScrollLock from "./useOverlayScrollLock";
import { registerLenis } from "../lib/navigation";

/**
 * The lock keeps module-level state — a counter shared by every overlay on the
 * page — because two overlays can be open at once (the command palette can open
 * the CV modal). That shared state is exactly where this kind of hook goes
 * wrong: the first overlay to close restores the page while the second is
 * still up, or a double-release leaves the body permanently unscrollable.
 *
 * These drive the hook through a real React root so the effect ordering is the
 * ordering that actually ships.
 */

let roots: Array<{ unmount: () => void }> = [];

/** Mount a component that holds the lock while `active`. Returns a releaser. */
function mountLock(active = true) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  function Overlay() {
    useOverlayScrollLock(active);
    return null;
  }

  act(() => {
    root.render(<Overlay />);
  });

  const handle = {
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
  roots.push(handle);
  return handle;
}

beforeEach(() => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  roots = [];
});

afterEach(() => {
  roots.forEach((r) => {
    try {
      r.unmount();
    } catch {
      /* already unmounted by the test */
    }
  });
  vi.restoreAllMocks();
});

describe("useOverlayScrollLock", () => {
  it("locks the body while an overlay is open and restores it on close", () => {
    const overlay = mountLock();
    expect(document.body.style.overflow).toBe("hidden");

    overlay.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not lock when inactive", () => {
    mountLock(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps the page locked until the LAST overlay closes", () => {
    // The command palette can open the CV modal on top of itself. If the
    // palette's cleanup released the page, the modal would be left over a
    // scrolling document.
    const first = mountLock();
    const second = mountLock();

    expect(document.body.style.overflow).toBe("hidden");

    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");

    second.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores whatever overflow the page already had, not a hardcoded value", () => {
    document.body.style.overflow = "clip";

    const overlay = mountLock();
    expect(document.body.style.overflow).toBe("hidden");

    overlay.unmount();
    expect(document.body.style.overflow).toBe("clip");
  });

  it("stops the scroll driver while locked and restarts it after", () => {
    const lenis = { scrollTo: vi.fn(), stop: vi.fn(), start: vi.fn(), isStopped: false };
    const unregister = registerLenis(lenis);

    const overlay = mountLock();
    expect(lenis.stop).toHaveBeenCalledTimes(1);
    expect(lenis.start).not.toHaveBeenCalled();

    overlay.unmount();
    expect(lenis.start).toHaveBeenCalledTimes(1);
    unregister();
  });

  it("does not restart a driver that was already stopped before the lock", () => {
    // Restarting here would switch smooth scrolling back on for a page that
    // had deliberately turned it off.
    const lenis = { scrollTo: vi.fn(), stop: vi.fn(), start: vi.fn(), isStopped: true };
    const unregister = registerLenis(lenis);

    const overlay = mountLock();
    expect(lenis.stop).not.toHaveBeenCalled();

    overlay.unmount();
    expect(lenis.start).not.toHaveBeenCalled();
    unregister();
  });

  it("works with no scroll driver registered at all", () => {
    expect(() => {
      const overlay = mountLock();
      overlay.unmount();
    }).not.toThrow();
    expect(document.body.style.overflow).toBe("");
  });
});
