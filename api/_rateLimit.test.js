import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_REQUESTS, WINDOW_MS, hasDurableStore, rateLimit, _resetMemory } from "./_rateLimit.js";

/**
 * The limiter has two backends and a failure path between them, and the
 * failure path is the one that matters: if Redis is down, the contact form
 * must still work. These pin all three.
 */

describe("rate limit — in-memory fallback", () => {
  beforeEach(() => {
    _resetMemory();
    vi.unstubAllEnvs();
  });

  it("reports that it is not durable when no store is configured", async () => {
    expect(hasDurableStore()).toBe(false);
    const result = await rateLimit("1.2.3.4");
    expect(result.durable).toBe(false);
  });

  it(`allows exactly ${MAX_REQUESTS} then blocks`, async () => {
    for (let i = 1; i <= MAX_REQUESTS; i += 1) {
      const r = await rateLimit("1.2.3.4");
      expect(r.limited).toBe(false);
      expect(r.count).toBe(i);
    }
    expect((await rateLimit("1.2.3.4")).limited).toBe(true);
  });

  it("counts each key separately", async () => {
    for (let i = 0; i < MAX_REQUESTS + 1; i += 1) await rateLimit("1.1.1.1");
    expect((await rateLimit("2.2.2.2")).limited).toBe(false);
  });

  it("forgets attempts once the window has passed", async () => {
    const t0 = 1_000_000;
    for (let i = 0; i < MAX_REQUESTS + 1; i += 1) await rateLimit("3.3.3.3", t0);
    expect((await rateLimit("3.3.3.3", t0)).limited).toBe(true);

    const later = t0 + WINDOW_MS + 1;
    expect((await rateLimit("3.3.3.3", later)).limited).toBe(false);
  });

  it("evicts stale keys instead of growing without bound", async () => {
    const t0 = 5_000_000;
    for (let i = 0; i < 600; i += 1) await rateLimit(`ip-${i}`, t0);
    // Well past the window, one more call triggers the sweep.
    const result = await rateLimit("fresh", t0 + WINDOW_MS + 1);
    expect(result.limited).toBe(false);
  });
});

describe("rate limit — durable store", () => {
  beforeEach(() => {
    _resetMemory();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses Redis when configured, and sets the TTL only when the window opens", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: 1 }, { result: 1 }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await rateLimit("9.9.9.9");

    expect(result).toEqual({ limited: false, count: 1, durable: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.upstash.io/pipeline");
    expect(init.headers.Authorization).toBe("Bearer token");

    const commands = JSON.parse(init.body);
    expect(commands[0]).toEqual(["INCR", "contact:rl:9.9.9.9"]);
    // NX matters: without it a burst keeps pushing the expiry out and the
    // sender is locked out far longer than the window.
    expect(commands[1]).toEqual(["EXPIRE", "contact:rl:9.9.9.9", "600", "NX"]);
  });

  it("blocks once the Redis counter passes the limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [{ result: MAX_REQUESTS + 1 }, {}] })
    );

    const result = await rateLimit("9.9.9.9");
    expect(result.limited).toBe(true);
    expect(result.durable).toBe(true);
  });

  it("falls back to memory when Redis errors, rather than failing the request", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await rateLimit("8.8.8.8");

    expect(result.limited).toBe(false);
    expect(result.durable).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it("falls back when Redis answers with a non-OK status", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    expect((await rateLimit("7.7.7.7")).durable).toBe(false);
  });

  it("falls back when Redis returns a shape it does not understand", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    expect((await rateLimit("6.6.6.6")).durable).toBe(false);
  });
});
