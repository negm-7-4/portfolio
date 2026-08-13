import { createHash } from "node:crypto";
import { Resend } from "resend";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map();

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);

  if (attempts.size > 500) {
    for (const [key, timestamps] of attempts) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) attempts.delete(key);
    }
  }

  return recent.length > MAX_REQUESTS;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  const contentLength = Number(request.headers["content-length"] || 0);
  if (contentLength > 20_000) {
    return response.status(413).json({ message: "Message is too large." });
  }

  const forwarded = request.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  const ip = clean(forwardedIp || request.socket?.remoteAddress || "unknown", 80);
  if (isRateLimited(ip)) {
    response.setHeader("Retry-After", "600");
    return response
      .status(429)
      .json({ message: "Too many messages. Please try again in a few minutes." });
  }

  const body = request.body && typeof request.body === "object" ? request.body : {};

  // Honeypots should look successful so automated senders do not adapt.
  if (clean(body.company, 200)) return response.status(200).json({ ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const subject = clean(body.subject, 140) || `Portfolio enquiry from ${name}`;
  const message = clean(body.message, 5000);
  const submissionId = clean(body.submissionId, 100);

  if (!name || !email || !message) {
    return response.status(400).json({ message: "Name, email and message are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ message: "Please use a valid email address." });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(503).json({
      code: "CONTACT_NOT_CONFIGURED",
      message: "Email delivery is not configured in this environment.",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const destination = process.env.CONTACT_TO_EMAIL || "mohammednegm11234@gmail.com";
  const from = process.env.RESEND_FROM_EMAIL || "Mohamed Negm Portfolio <onboarding@resend.dev>";
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone || "Not provided"),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, "<br />"),
  };
  const fingerprint = createHash("sha256")
    .update(submissionId || `${email}|${subject}|${message}`)
    .digest("hex")
    .slice(0, 32);

  const { data, error } = await resend.emails.send(
    {
      from,
      to: [destination],
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\n${message}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#17191f">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#687080">New portfolio enquiry</p>
          <h1 style="font-size:24px;margin:8px 0 24px">${safe.subject}</h1>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#687080">Name</td><td style="padding:8px 0">${safe.name}</td></tr>
            <tr><td style="padding:8px 0;color:#687080">Email</td><td style="padding:8px 0">${safe.email}</td></tr>
            <tr><td style="padding:8px 0;color:#687080">Phone</td><td style="padding:8px 0">${safe.phone}</td></tr>
          </table>
          <div style="border-left:3px solid #8a93a6;padding:4px 0 4px 18px;line-height:1.65">${safe.message}</div>
        </div>
      `,
      tags: [{ name: "source", value: "portfolio_contact" }],
    },
    { idempotencyKey: `portfolio-contact/${fingerprint}` }
  );

  if (error) {
    console.error("Resend contact error", { name: error.name, message: error.message });
    const retryable = error.name === "rate_limit_exceeded" || error.name === "api_error";
    return response.status(retryable ? 503 : 502).json({ message: "Email delivery failed." });
  }

  return response.status(200).json({ ok: true, id: data.id });
}
