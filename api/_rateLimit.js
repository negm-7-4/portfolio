/**
 * Rate limiting for the contact endpoint.
 *
 * The original limiter was a module-level `Map`. On Vercel that is per
 * serverless instance: every cold start begins with an empty map, and
 * concurrent instances never see each other's counts. Against one determined
 * sender it does very little, which is the case it exists for.
 *
 * This keeps the same interface but prefers a durable store when one is
 * configured:
 *
 *   • Upstash Redis over its REST API (no TCP pooling, no client library —
 *     a serverless function's connection lifetime makes both a liability).
 *     Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 *   • Otherwise, the in-memory map, so local development and any deploy
 *     without Redis still work — degraded, and honest about it.
 *
 * The window is a fixed counter with a TTL rather than a sliding log: one
 * INCR plus a conditional EXPIRE, which is a single round trip in the common
 * case and cannot grow unbounded.
 */

export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_REQUESTS = 5;

const memory = new Map();

/** True when a durable backend is configured. */
export function hasDurableStore() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function memoryLimit(key, now) {
  const recent = (memory.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  memory.set(key, recent);

  // Bound the map so a long-lived instance cannot leak entries forever.
  if (memory.size > 500) {
    for (const [k, timestamps] of memory) {
      if (!timestamps.some((t) => now - t < WINDOW_MS)) memory.delete(k);
    }
  }

  return { limited: recent.length > MAX_REQUESTS, count: recent.length, durable: false };
}

async function redisPipeline(commands) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    // A limiter must never be the reason a message fails to send.
    signal: AbortSignal.timeout(2000),
  });

  if (!response.ok) throw new Error(`Upstash responded ${response.status}`);
  return response.json();
}

/**
 * Record an attempt and report whether it should be rejected.
 *
 * @param {string} key Usually the client IP.
 * @returns {Promise<{limited: boolean, count: number, durable: boolean}>}
 */
export async function rateLimit(key, now = Date.now()) {
  if (!hasDurableStore()) return memoryLimit(key, now);

  const redisKey = `contact:rl:${key}`;
  const seconds = Math.ceil(WINDOW_MS / 1000);

  try {
    // INCR then EXPIRE with NX: the TTL is set once, when the window opens,
    // so a burst cannot keep pushing the expiry out and lock someone out
    // indefinitely.
    const result = await redisPipeline([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, String(seconds), "NX"],
    ]);

    const count = Number(result?.[0]?.result ?? 0);
    if (!Number.isFinite(count) || count === 0) throw new Error("Unexpected Upstash reply");

    return { limited: count > MAX_REQUESTS, count, durable: true };
  } catch (error) {
    // Redis being down must not take the contact form down with it. Fall back
    // to the in-memory counter and say so in the logs.
    console.warn("Rate limit store unavailable, falling back to memory:", error.message);
    return memoryLimit(key, now);
  }
}

/** Test seam: drops the in-memory state between cases. */
export function _resetMemory() {
  memory.clear();
}
