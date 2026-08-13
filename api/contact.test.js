import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for the contact endpoint.
 *
 * This is the one piece of the site that touches the outside world, accepts
 * untrusted input and can cost money, so it is the piece most worth pinning
 * down: the guards (method, size, honeypot, rate limit), the validation, and
 * the fact that visitor-supplied text is HTML-escaped before it is dropped
 * into an email body.
 *
 * `resend` is mocked — no test should ever send mail.
 */

const send = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    constructor() {
      this.emails = { send };
    }
  },
}));

/** Minimal stand-in for the Vercel/Node response object. */
function mockResponse() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

function mockRequest({ method = "POST", body = {}, headers = {}, ip = "203.0.113.1" } = {}) {
  return {
    method,
    body,
    headers: { "content-length": String(JSON.stringify(body).length), ...headers },
    socket: { remoteAddress: ip },
  };
}

const validBody = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to talk about a project.",
};

/** Fresh module per test so the in-memory rate-limit map starts empty. */
async function loadHandler() {
  vi.resetModules();
  return (await import("./contact.js")).default;
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects non-POST methods and advertises what is allowed", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ method: "GET" }), res);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("POST");
    expect(send).not.toHaveBeenCalled();
  });

  it("never lets a response be cached", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: validBody }), res);

    expect(res.headers["Cache-Control"]).toBe("no-store");
  });

  it("refuses oversized payloads before doing any work", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: validBody, headers: { "content-length": "20001" } }), res);

    expect(res.statusCode).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    ["missing name", { ...validBody, name: "" }],
    ["missing email", { ...validBody, email: "" }],
    ["missing message", { ...validBody, message: "" }],
  ])("rejects a submission with a %s", async (_label, body) => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body }), res);

    expect(res.statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a malformed email address", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: { ...validBody, email: "ada@example" } }), res);

    expect(res.statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("answers the honeypot with a fake success and sends nothing", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: { ...validBody, company: "spam-bot ltd" } }), res);

    // A bot must not be able to tell it was caught, or it adapts.
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("reports a typed 503 when Resend is not configured, so the UI can fall back", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: validBody }), res);

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe("CONTACT_NOT_CONFIGURED");
  });

  it("sends a valid submission and replies with the message id", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: validBody }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, id: "msg_123" });
    expect(send).toHaveBeenCalledTimes(1);

    const [payload, options] = send.mock.calls[0];
    expect(payload.replyTo).toBe("ada@example.com");
    expect(payload.subject).toContain("[Portfolio]");
    expect(options.idempotencyKey).toMatch(/^portfolio-contact\//);
  });

  it("escapes HTML from visitor input before putting it in the email body", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(
      mockRequest({
        body: { ...validBody, name: '<img src=x onerror="alert(1)">', message: "a < b & c" },
      }),
      res
    );

    const [payload] = send.mock.calls[0];
    expect(payload.html).not.toContain("<img src=x");
    expect(payload.html).toContain("&lt;img");
    expect(payload.html).toContain("a &lt; b &amp; c");
    // The plain-text part is not HTML, so it keeps the original characters.
    expect(payload.text).toContain("a < b & c");
  });

  it("turns newlines in the message into <br /> for the HTML part", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: { ...validBody, message: "line one\nline two" } }), res);

    expect(send.mock.calls[0][0].html).toContain("line one<br />line two");
  });

  it("truncates absurdly long fields instead of forwarding them whole", async () => {
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(
      mockRequest({
        body: { ...validBody, name: "a".repeat(500), message: "b".repeat(9000) },
      }),
      res
    );

    const [payload] = send.mock.calls[0];
    expect(payload.text).toContain(`Name: ${"a".repeat(100)}\n`);
    expect(payload.text).not.toContain("a".repeat(101));
    expect(payload.text.match(/b+/)[0]).toHaveLength(5000);
  });

  it("rate-limits a single IP after five messages", async () => {
    const handler = await loadHandler();

    for (let i = 0; i < 5; i += 1) {
      const res = mockResponse();
      await handler(mockRequest({ body: validBody }), res);
      expect(res.statusCode).toBe(200);
    }

    const blocked = mockResponse();
    await handler(mockRequest({ body: validBody }), blocked);

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers["Retry-After"]).toBe("600");
    expect(send).toHaveBeenCalledTimes(5);
  });

  it("counts each IP separately", async () => {
    const handler = await loadHandler();

    for (let i = 0; i < 6; i += 1) {
      await handler(mockRequest({ body: validBody, ip: "203.0.113.1" }), mockResponse());
    }

    const other = mockResponse();
    await handler(mockRequest({ body: validBody, ip: "198.51.100.7" }), other);

    expect(other.statusCode).toBe(200);
  });

  it("reads the client IP from the first x-forwarded-for entry", async () => {
    const handler = await loadHandler();
    const proxied = { "x-forwarded-for": "198.51.100.9, 10.0.0.1" };

    for (let i = 0; i < 5; i += 1) {
      await handler(mockRequest({ body: validBody, headers: proxied }), mockResponse());
    }
    const blocked = mockResponse();
    await handler(mockRequest({ body: validBody, headers: proxied }), blocked);

    // Blocked despite a different socket address — the forwarded IP is what counts.
    expect(blocked.statusCode).toBe(429);
  });

  it("maps a retryable provider failure to 503 and a permanent one to 502", async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: "rate_limit_exceeded", message: "slow down" },
    });
    let handler = await loadHandler();
    let res = mockResponse();
    await handler(mockRequest({ body: validBody }), res);
    expect(res.statusCode).toBe(503);

    send.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "bad sender" },
    });
    handler = await loadHandler();
    res = mockResponse();
    await handler(mockRequest({ body: validBody }), res);
    expect(res.statusCode).toBe(502);
  });

  it("does not leak provider error details to the client", async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: "api_error", message: "internal key rotation failed for acct_9931" },
    });
    const handler = await loadHandler();
    const res = mockResponse();
    await handler(mockRequest({ body: validBody }), res);

    expect(JSON.stringify(res.body)).not.toContain("acct_9931");
  });

  it("derives a stable idempotency key from the submission id", async () => {
    const handler = await loadHandler();
    const body = { ...validBody, submissionId: "abc-123" };

    await handler(mockRequest({ body }), mockResponse());
    await handler(mockRequest({ body }), mockResponse());

    const [first, second] = send.mock.calls.map(([, options]) => options.idempotencyKey);
    expect(first).toBe(second);
  });
});
