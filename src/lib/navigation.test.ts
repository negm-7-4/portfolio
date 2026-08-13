// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ScrollDriver } from "./navigation";
import {
  NAV_OFFSET,
  getLenis,
  goToSection,
  registerLenis,
  registerSectionTransition,
  scrollTo,
  scrollToTop,
} from "./navigation";

/**
 * These cover the fallback ladder that used to be copy-pasted into seven
 * components: cinematic transition → Lenis → native scroll. Getting the order
 * wrong is invisible in code review and very visible on the page.
 */

let cleanups: Array<() => void> = [];

function useLenis() {
  const lenis = { scrollTo: vi.fn() } satisfies ScrollDriver;
  cleanups.push(registerLenis(lenis));
  return lenis;
}

function useTransition() {
  const travel = vi.fn();
  cleanups.push(registerSectionTransition(travel));
  return travel;
}

function addSection(id: string) {
  const el = document.createElement("section");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
  window.scrollTo = vi.fn();
  window.scrollY = 0;
});

afterEach(() => {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  vi.restoreAllMocks();
});

describe("registration", () => {
  it("exposes the registered Lenis instance and drops it on unregister", () => {
    const lenis = { scrollTo: vi.fn() };
    const unregister = registerLenis(lenis);

    expect(getLenis()).toBe(lenis);
    unregister();
    expect(getLenis()).toBeNull();
  });

  it("does not let a stale unregister clear a newer instance", () => {
    const first = { scrollTo: vi.fn() };
    const unregisterFirst = registerLenis(first);
    const second = { scrollTo: vi.fn() };
    cleanups.push(registerLenis(second));

    // The old component unmounting after the new one mounted must not wipe
    // the live instance — that used to leave `window.__lenis` null mid-page.
    unregisterFirst();
    expect(getLenis()).toBe(second);
  });
});

describe("scrollTo", () => {
  it("routes through Lenis when it is running", () => {
    const lenis = useLenis();
    const el = addSection("about");

    scrollTo(el, { offset: -40, duration: 1.2 });

    expect(lenis.scrollTo).toHaveBeenCalledWith(el, {
      offset: -40,
      duration: 1.2,
      immediate: false,
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("falls back to native scrolling with the offset applied by hand", () => {
    const el = addSection("about");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ ...new DOMRect(), top: 500 });
    window.scrollY = 100;

    scrollTo(el, { offset: -40 });

    // Native scrollIntoView has no offset parameter, so the target has to be
    // computed: 500 (viewport-relative) + 100 (scrolled) - 40 (header).
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 560, behavior: "smooth" });
  });

  it("accepts a numeric target", () => {
    scrollTo(420);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 420, behavior: "smooth" });
  });

  it("accepts a selector string", () => {
    const lenis = useLenis();
    addSection("contact");

    scrollTo("#contact", { offset: -24 });

    expect(lenis.scrollTo).toHaveBeenCalledWith(
      document.getElementById("contact"),
      expect.objectContaining({ offset: -24 })
    );
  });

  it("does nothing for a selector that matches nothing", () => {
    expect(() => scrollTo("#nope")).not.toThrow();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("uses instant behaviour when asked", () => {
    scrollTo(0, { immediate: true });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});

describe("scrollToTop", () => {
  it("goes to 0 through Lenis", () => {
    const lenis = useLenis();
    scrollToTop();
    expect(lenis.scrollTo).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 1.6 }));
  });
});

describe("goToSection", () => {
  it("prefers the cinematic transition when one is mounted", () => {
    const travel = useTransition();
    const lenis = useLenis();
    addSection("projects");

    expect(goToSection("projects")).toBe(true);
    expect(travel).toHaveBeenCalledWith("projects");
    expect(lenis.scrollTo).not.toHaveBeenCalled();
  });

  it("skips the transition when the caller asks for a plain jump", () => {
    const travel = useTransition();
    const lenis = useLenis();
    const el = addSection("contact");

    goToSection("contact", { cinematic: false, offset: -24 });

    expect(travel).not.toHaveBeenCalled();
    expect(lenis.scrollTo).toHaveBeenCalledWith(el, expect.objectContaining({ offset: -24 }));
  });

  it("falls back to Lenis when no transition is registered", () => {
    const lenis = useLenis();
    const el = addSection("skills");

    goToSection("skills");

    expect(lenis.scrollTo).toHaveBeenCalledWith(
      el,
      expect.objectContaining({ offset: NAV_OFFSET })
    );
  });

  it("reports failure for an unknown section instead of scrolling somewhere wrong", () => {
    const travel = useTransition();

    expect(goToSection("does-not-exist")).toBe(false);
    expect(travel).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("still works with nothing registered at all", () => {
    const el = addSection("hero");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ ...new DOMRect(), top: 0 });

    expect(goToSection("hero")).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: NAV_OFFSET, behavior: "smooth" });
  });
});
