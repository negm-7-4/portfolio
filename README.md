# Mohamed Negm — Portfolio

React/Vite portfolio with motion design, WebGL scenes, project case studies,
Vercel Analytics, Speed Insights and a server-side contact endpoint.

## Local development

```bash
npm install
npm run dev
```

Use `vercel dev` when testing the `/api/contact` function locally.

## Contact delivery

The contact form uses Resend from `api/contact.js`. Configure these server-side
environment variables in Vercel; never expose them through a `VITE_` prefix.

- `RESEND_API_KEY` — required for inbox delivery.
- `CONTACT_TO_EMAIL` — optional; defaults to the portfolio email.
- `RESEND_FROM_EMAIL` — optional; defaults to Resend's onboarding sender.

Without `RESEND_API_KEY`, the UI clearly falls back to opening the visitor's
email application and does not claim that the message was sent.
