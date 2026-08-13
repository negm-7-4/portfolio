/// <reference types="vite/client" />

/**
 * Typed environment variables.
 *
 * Only `VITE_`-prefixed values reach the browser bundle, so anything declared
 * here is by definition public. Server-only secrets (RESEND_API_KEY and
 * friends) are read in api/ from process.env and deliberately never appear.
 */
interface ImportMetaEnv {
  /** Public origin, e.g. https://mohamed-negm.vercel.app — no trailing slash. */
  readonly VITE_SITE_URL?: string;
  /** Public contact address shown in the UI and structured data. */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** The image manifest emitted by `npm run images`. */
declare module "*.json" {
  const value: Record<string, { width: number; height: number; widths: number[] }>;
  export default value;
}
