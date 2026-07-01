import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>";

/**
 * Terminal-style "decode" text. On hover (or `auto`) the characters cycle
 * through random glyphs and resolve left-to-right into the real text.
 *
 * - Pure React + a single interval — no extra deps.
 * - Honours `prefers-reduced-motion` (renders static text, no scramble).
 * - Accessible: the real text is always exposed to screen readers; only an
 *   `aria-hidden` layer scrambles visually.
 */
export default function ScrambleText({
  text,
  className = "",
  speed = 30,        // ms per frame
  revealRate = 0.5,  // characters resolved per frame
  auto = false,      // scramble once on mount instead of on hover
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef(null);

  const run = () => {
    if (reduce) return;
    let pos = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const out = text
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (i < pos) return text[i];
          return GLYPHS[(Math.random() * GLYPHS.length) | 0];
        })
        .join("");
      setDisplay(out);
      pos += revealRate;
      if (pos >= text.length) {
        clearInterval(intervalRef.current);
        setDisplay(text);
      }
    }, speed);
  };

  // keep label in sync if the text prop changes
  useEffect(() => setDisplay(text), [text]);

  // auto mode: decode once when it mounts
  useEffect(() => {
    if (auto) run();
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  return (
    <span
      className={className}
      onMouseEnter={auto ? undefined : run}
      style={{ fontVariantLigatures: "none" }}
    >
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
