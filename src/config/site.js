/**
 * Site-wide constants.
 *
 * The public origin used to be typed out eight times in index.html, twice in
 * the sitemap and once in robots.txt. Moving to a custom domain meant finding
 * and editing every one of them. Now it is one env var with a safe default,
 * consumed by the app, by the index.html transform and by the sitemap
 * generator (see vite.config.js).
 */

export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL || "https://mohamed-negm.vercel.app"
).replace(/\/+$/, "");

export const CONTACT_EMAIL = import.meta.env?.VITE_CONTACT_EMAIL || "mohammednegm11234@gmail.com";

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
