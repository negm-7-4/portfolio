// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { APP_EVENTS, emitAppEvent, onAppEvent, openCommandPalette, openCv } from "./appEvents";
import { registerToast, toast } from "./toast";

describe("app events", () => {
  it("delivers an event to a subscriber", () => {
    const handler = vi.fn();
    const off = onAppEvent(APP_EVENTS.openCv, handler);

    openCv();

    expect(handler).toHaveBeenCalledTimes(1);
    off();
  });

  it("stops delivering after unsubscribe", () => {
    const handler = vi.fn();
    onAppEvent(APP_EVENTS.openCommandPalette, handler)();

    openCommandPalette();

    expect(handler).not.toHaveBeenCalled();
  });

  it("carries a detail payload", () => {
    const handler = vi.fn();
    const off = onAppEvent(APP_EVENTS.openCv, handler);

    emitAppEvent(APP_EVENTS.openCv, { from: "navbar" });

    expect(handler.mock.calls[0]?.[0]?.detail).toEqual({ from: "navbar" });
    off();
  });

  it("keeps the two overlay events distinct", () => {
    const cv = vi.fn();
    const palette = vi.fn();
    const offCv = onAppEvent(APP_EVENTS.openCv, cv);
    const offPalette = onAppEvent(APP_EVENTS.openCommandPalette, palette);

    openCv();

    expect(cv).toHaveBeenCalledTimes(1);
    expect(palette).not.toHaveBeenCalled();
    offCv();
    offPalette();
  });
});

describe("toast transport", () => {
  it("is a silent no-op before a provider registers", () => {
    // The alternative — the old `window.__toast?.()` — was the same behaviour
    // but reachable and overwritable by anything on the page.
    expect(() => toast("nobody is listening")).not.toThrow();
  });

  it("forwards message and options to the registered provider", () => {
    const show = vi.fn();
    const unregister = registerToast(show);

    toast("Email copied", { kind: "success", icon: "✓" });

    expect(show).toHaveBeenCalledWith("Email copied", { kind: "success", icon: "✓" });
    unregister();
  });

  it("goes quiet again once the provider unmounts", () => {
    const show = vi.fn();
    registerToast(show)();

    toast("gone");

    expect(show).not.toHaveBeenCalled();
  });

  it("ignores a stale unregister from a replaced provider", () => {
    const first = vi.fn();
    const second = vi.fn();
    const unregisterFirst = registerToast(first);
    const unregisterSecond = registerToast(second);

    unregisterFirst();
    toast("still delivered");

    expect(second).toHaveBeenCalledTimes(1);
    unregisterSecond();
  });
});
