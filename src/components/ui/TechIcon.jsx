/**
 * Brand-accurate SVG icons for tech badges. Single file, no external deps.
 * Each icon ships with its real brand color via the `color` prop.
 * Add new ones to ICONS map.
 */

/* Small brand-colored text badge — used for libraries without a simple
   recognisable glyph. Mirrors the JS / TS / GSAP style above. */
const txt = (label, { size = 7.5, fg = "#000" } = {}) => (
  <g>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
    <text
      x="12"
      y="12"
      dominantBaseline="central"
      textAnchor="middle"
      fontFamily="system-ui"
      fontSize={size}
      fontWeight="900"
      fill={fg}
    >
      {label}
    </text>
  </g>
);

const ICONS = {
  react: (
    <g>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </g>
  ),
  javascript: (
    <g>
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
      <text x="12" y="17" textAnchor="middle" fontFamily="system-ui" fontSize="9" fontWeight="900" fill="#000">JS</text>
    </g>
  ),
  typescript: (
    <g>
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
      <text x="12" y="17" textAnchor="middle" fontFamily="system-ui" fontSize="8" fontWeight="900" fill="#fff">TS</text>
    </g>
  ),
  nextjs: (
    <g>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M8 7 v10 M8 7 L16 17" stroke="#000" strokeWidth="1.4" fill="none" />
      <path d="M15 7 v6" stroke="#000" strokeWidth="1.4" fill="none" />
    </g>
  ),
  tailwind: (
    <path
      d="M12 6c-2.6 0-4.3 1.3-5 4 1-1.3 2.3-1.8 3.7-1.5.8.2 1.4.8 2 1.5 1 1 2.1 2 4.4 2 2.6 0 4.3-1.3 5-4-1 1.3-2.3 1.8-3.7 1.5-.8-.2-1.4-.8-2-1.5-1-1-2.1-2-4.4-2zM6.7 12c-2.6 0-4.3 1.3-5 4 1-1.3 2.3-1.8 3.7-1.5.8.2 1.4.8 2 1.5 1 1 2.1 2 4.4 2 2.6 0 4.3-1.3 5-4-1 1.3-2.3 1.8-3.7 1.5-.8-.2-1.4-.8-2-1.5-1-1-2.1-2-4.4-2z"
      fill="currentColor"
    />
  ),
  framer: (
    <path
      d="M5 3h14v6h-7L19 15h-7v6L5 15v-6h7L5 3z"
      fill="currentColor"
    />
  ),
  gsap: (
    <g>
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
      <text x="12" y="16" textAnchor="middle" fontFamily="system-ui" fontSize="6.5" fontWeight="900" fill="#000">GSAP</text>
    </g>
  ),
  three: (
    <g>
      <path d="M12 3 L21 8 V16 L12 21 L3 16 V8 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3 L12 21 M3 8 L12 12 L21 8 M3 16 L12 12 L21 16" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
    </g>
  ),
  python: (
    <g>
      <path d="M9 3c-2 0-3 1-3 3v3h6v1H4c-2 0-3 1.5-3 4s1 4 3 4h2v-3c0-1.5 1-2.5 2.5-2.5h5C15 12.5 16 11.5 16 10V6c0-2-1-3-3-3zM9 5a1 1 0 110 2 1 1 0 010-2z" fill="currentColor" />
      <path d="M15 21c2 0 3-1 3-3v-3h-6v-1h8c2 0 3-1.5 3-4s-1-4-3-4h-2v3c0 1.5-1 2.5-2.5 2.5h-5C9 11.5 8 12.5 8 14v4c0 2 1 3 3 3zM15 19a1 1 0 110-2 1 1 0 010 2z" fill="#FFD43B" />
    </g>
  ),
  html: (
    <g>
      <path d="M3 3l1.5 17L12 22l7.5-2L21 3H3z" fill="currentColor" />
      <path d="M12 5v15l6-1.5L19.2 5H12z" fill="rgba(0,0,0,0.2)" />
      <path d="M7 8h10l-.3 3H7.7l.2 2h8.5l-.5 4.5L12 18.5l-3.5-1L8.3 14h2l.2 2 1.5.5 1.5-.5.2-3H8L7 8z" fill="#fff" />
    </g>
  ),
  git: (
    <g>
      <path
        d="M22 11.5L12.5 2c-.5-.5-1.4-.5-2 0L8.5 4l3 3c.7-.3 1.5-.1 2 .4.6.6.7 1.4.4 2l3 3c.7-.3 1.5-.1 2 .4.7.7.7 1.8 0 2.5-.7.7-1.8.7-2.5 0-.6-.6-.7-1.4-.4-2.1L13.2 10.5v6.6c.2.1.3.2.5.3.7.7.7 1.8 0 2.5-.7.7-1.8.7-2.5 0-.7-.7-.7-1.8 0-2.5.2-.2.4-.4.7-.5V10.4c-.3-.1-.5-.3-.7-.5-.6-.6-.7-1.4-.4-2L7.9 5 2 11c-.5.5-.5 1.4 0 2l9.5 9.5c.5.5 1.4.5 2 0L22 13.5c.5-.6.5-1.5 0-2z"
        fill="currentColor"
      />
    </g>
  ),
  github: (
    <path
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      fill="currentColor"
    />
  ),
  figma: (
    <g>
      <path d="M8 22a4 4 0 0 0 4-4v-4H8a4 4 0 0 0 0 8z" fill="#0acf83" />
      <path d="M4 14a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" fill="#a259ff" />
      <path d="M4 6a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" fill="#f24e1e" />
      <path d="M12 2h4a4 4 0 0 1 0 8h-4z" fill="#ff7262" />
      <circle cx="16" cy="14" r="4" fill="#1abcfe" />
    </g>
  ),
  node: (
    <path
      d="M12 1.85c-.27 0-.55.07-.78.2L4.4 5.96c-.5.29-.78.83-.78 1.4v9.27c0 .57.29 1.11.78 1.4l1.84 1.07c.92.45 1.24.45 1.66.45 1.36 0 2.13-.82 2.13-2.24V8.16c0-.11-.09-.21-.2-.21h-.96c-.12 0-.21.1-.21.21v8.15c0 .63-.65 1.26-1.71.74L5.18 16c-.07-.04-.11-.11-.11-.18V6.55c0-.07.04-.15.11-.18l6.8-3.92c.06-.04.15-.04.21 0l6.81 3.93c.06.04.11.11.11.18v9.28c0 .07-.04.14-.11.18l-6.81 3.92c-.06.04-.15.04-.21 0l-1.74-1.04c-.05-.03-.12-.04-.16-.01-.48.28-.57.31-1.03.47-.11.04-.28.1.06.29l2.27 1.34c.23.13.49.21.78.21s.55-.08.78-.21l6.81-3.93c.5-.29.78-.83.78-1.4V7.36c0-.57-.29-1.11-.78-1.4l-6.81-3.92c-.23-.13-.51-.2-.79-.2zm1.86 6.46c-1.94 0-3.1.82-3.1 2.19 0 1.49 1.15 1.9 3.01 2.09 2.23.22 2.4.55 2.4 1 0 .77-.62 1.1-2.07 1.1-1.83 0-2.23-.46-2.36-1.36 0-.1-.09-.18-.2-.18h-1c-.12 0-.21.1-.21.21 0 1.16.63 2.54 3.77 2.54 2.15 0 3.39-.85 3.39-2.33 0-1.47-.99-1.86-3.07-2.13-2.1-.28-2.31-.42-2.31-.92 0-.41.18-.96 1.73-.96 1.39 0 1.9.3 2.11 1.24.02.09.1.16.2.16h1c.05 0 .11-.02.15-.06.04-.04.06-.1.06-.16-.16-1.86-1.39-2.72-3.5-2.72z"
      fill="currentColor"
    />
  ),
  threejs: (
    <g>
      <path d="M12 3 L21 8 V16 L12 21 L3 16 V8 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3 L12 21 M3 8 L12 12 L21 8 M3 16 L12 12 L21 16" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
    </g>
  ),

  /* ── Animation & Motion ─────────────────────────────────────── */
  anime: txt("ANI", { size: 6 }),
  lottie: (
    <g>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M9.5 8 L16 12 L9.5 16 Z" fill="#000" />
    </g>
  ),
  spring: txt("RS"),
  aos: txt("AOS", { size: 6 }),
  autoanimate: txt("AA"),

  /* ── 3D & WebGL ─────────────────────────────────────────────── */
  r3f: (
    <g>
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(120 12 12)" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 18 L9 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  drei: txt("drei", { size: 6 }),
  spline: (
    <g>
      <circle cx="7" cy="7" r="3" fill="currentColor" />
      <circle cx="17" cy="17" r="3" fill="currentColor" />
      <path d="M9 9 C13 9 11 15 15 15" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  babylon: txt("BJS", { size: 6 }),

  /* ── 2D & Canvas ────────────────────────────────────────────── */
  pixi: txt("pixi", { size: 6 }),
  konva: txt("K"),
  fabric: txt("fab", { size: 6 }),
  p5: txt("p5"),

  /* ── Scroll & Transitions ───────────────────────────────────── */
  lenis: txt("lenis", { size: 5 }),
  locomotive: txt("LOCO", { size: 5 }),
  scrolltrigger: txt("ST"),
  barba: txt("B"),
  swiper: txt("SW", { size: 7 }),

  /* ── Charts & Data Viz ──────────────────────────────────────── */
  d3: txt("D3"),
  chartjs: (
    <g>
      <path d="M12 3 a9 9 0 1 0 9 9 h-9 Z" fill="currentColor" />
      <path d="M12 3 v9 h9 a9 9 0 0 0 -9 -9 Z" fill="currentColor" opacity="0.55" />
    </g>
  ),
  recharts: (
    <g>
      <path d="M3 17 L9 11 L13 14 L21 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="3" cy="17" r="1.5" fill="currentColor" />
      <circle cx="9" cy="11" r="1.5" fill="currentColor" />
      <circle cx="13" cy="14" r="1.5" fill="currentColor" />
      <circle cx="21" cy="5" r="1.5" fill="currentColor" />
    </g>
  ),
  echarts: txt("EC"),
  apex: (
    <g>
      <rect x="3" y="12" width="3.5" height="9" rx="1" fill="currentColor" />
      <rect x="10.25" y="7" width="3.5" height="14" rx="1" fill="currentColor" />
      <rect x="17.5" y="3" width="3.5" height="18" rx="1" fill="currentColor" />
    </g>
  ),

  /* ── Tooling ────────────────────────────────────────────────── */
  vite: (
    <g>
      <path d="M21 5 L12.5 22 L11 13 L3 9 Z" fill="currentColor" />
      <path d="M13 4 L9 12 L12 12.5 L11 18 L16 9 L13 8.5 Z" fill="#FFD028" />
    </g>
  ),
};

export default function TechIcon({ name, color = "currentColor", size = 22 }) {
  const inner = ICONS[name];
  if (!inner) {
    return (
      <span
        className="inline-block rounded-md text-[10px] font-bold uppercase"
        style={{ background: color, color: "#000", padding: "1px 6px" }}
      >
        ?
      </span>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ color, display: "inline-block", flexShrink: 0 }}
      aria-hidden
    >
      {inner}
    </svg>
  );
}
