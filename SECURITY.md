# Security

This is a personal portfolio, not a product — but it does run a serverless
endpoint that accepts untrusted input and sends email, so reports are welcome.

## Reporting

Email **mohammednegm11234@gmail.com** with "Security" in the subject. Please do
not open a public issue for anything exploitable.

Include what you did, what happened, and what you expected. A proof of concept
helps. I will acknowledge within a few days.

## Scope

In scope:

- `api/contact.js` — the contact endpoint (injection, rate-limit bypass, abuse
  of the mail relay, resource exhaustion)
- The deployed site's headers and CSP
- Anything that lets a third party send mail through this domain

Out of scope:

- Missing headers with no demonstrated impact
- Findings from automated scanners with no working exploit
- Denial of service through sheer volume
- Social engineering

## What is already in place

The contact endpoint is POST-only, caps payloads at 20 kB, HTML-escapes every
visitor-supplied field before it reaches an email body, answers its honeypot
with a fake success, rate-limits per IP (durably when Upstash is configured),
and uses an idempotency key so a double submit cannot double-send. Provider
errors are mapped to generic messages so nothing about the mail infrastructure
leaks to the client.

The site sets `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
`Permissions-Policy`. `connect-src` is restricted to this origin plus the
Vercel vitals endpoint.

No secret is ever exposed through a `VITE_` variable — those are compiled into
the browser bundle by design. Server credentials are read from `process.env`
inside `api/` only.
