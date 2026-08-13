/**
 * Console easter egg for anyone who opens devtools.
 *
 * This lived as an inline <script> in index.html, which forced the site's
 * Content-Security-Policy to allow inline scripts for its own sake. As a
 * module it ships inside the hashed entry bundle and the CSP only has to
 * trust this origin.
 */
/* eslint-disable no-console -- the whole point of this module */
export function printConsoleSignature(): void {
  if (import.meta.env.DEV) return; // dev consoles have enough noise already

  console.log(
    "%c\n  ✦  Mohamed Negm — Software Engineer  ✦\n",
    "color:#aab4c4;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.18em;"
  );
  console.log(
    "%cCurious about how this was built?\n%cReact · Three.js · React-Three-Fiber · GSAP · Framer Motion\n\n→ github.com/negm-7-4",
    "color:#dfe3ea;font-family:sans-serif;font-size:12px;",
    "color:#8a93a6;font-family:sans-serif;font-size:11px;letter-spacing:0.05em;"
  );
}
