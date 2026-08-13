/**
 * Last-resort screen if the whole app throws.
 *
 * Deliberately dependency-free (inline styles, no motion, no Tailwind class
 * reliance) — if the app broke badly enough to land here, the safest thing to
 * render is plain markup that cannot itself fail. It still gives the visitor
 * the two things they came for: a way to retry, and a way to reach me.
 */
import { profile } from "../data/content";

export default function AppCrashScreen() {
  return (
    <div
      role="alert"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        background: "#0b0d11",
        color: "#dfe3ea",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <span aria-hidden style={{ fontSize: "2rem", color: "#aab4c4" }}>
        ✦
      </span>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
        Something broke on this page
      </h1>
      <p style={{ maxWidth: "34rem", lineHeight: 1.7, color: "#8a93a6", margin: 0 }}>
        Sorry — that is on me, not on you. Reloading usually fixes it. If it does not, I would
        genuinely like to know.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            border: 0,
            borderRadius: "0.6rem",
            background: "#ffffff",
            color: "#000000",
            padding: "0.75rem 1.5rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
        <a
          href={`mailto:${profile.email}?subject=${encodeURIComponent("Portfolio broke for me")}`}
          style={{
            borderRadius: "0.6rem",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#dfe3ea",
            padding: "0.75rem 1.5rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Tell me
        </a>
      </div>
    </div>
  );
}
