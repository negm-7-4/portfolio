import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "../../lib/motion";

/**
 * Line-by-line masked description reveal.
 *
 * Words are laid out invisibly first, grouped into visual lines by their
 * measured offsetTop, then each line rises out of an overflow mask with a
 * blur→focus settle — the "keynote paragraph" reveal. Re-measures on
 * resize so wrapping never desyncs the masks.
 *
 * Animates on mount (pair with a keyed AnimatePresence to replay per
 * project). Transform + opacity + one-shot blur only — compositor-friendly.
 */
export default function DescriptionLines({
  text,
  className = "",
  delay = 0,
  stagger = 0.085,
  duration = 0.7,
}) {
  const probeRef = useRef(null);
  const [lines, setLines] = useState(null);

  useLayoutEffect(() => {
    const el = probeRef.current;
    if (!el) return;

    const measure = () => {
      const words = Array.from(el.querySelectorAll("[data-w]"));
      const rows = [];
      let top = null;
      for (const w of words) {
        if (top === null || Math.abs(w.offsetTop - top) > 4) {
          top = w.offsetTop;
          rows.push([]);
        }
        rows[rows.length - 1].push(w.textContent);
      }
      setLines(rows.map((r) => r.join(" ")));
    };

    measure();
    const ro = new ResizeObserver(() => {
      // Re-split on width changes; the reveal has already played by then,
      // so we only need correct line grouping, not a replay.
      measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <span className={`relative block ${className}`}>
      {/* Invisible probe — owns the layout, defines the box height. */}
      <span ref={probeRef} className="invisible block" aria-hidden>
        {text.split(" ").map((w, i) => (
          <span key={i} data-w className="inline-block mr-[0.3em]">
            {w}
          </span>
        ))}
      </span>

      {/* Screen-reader text — one clean string, no per-word noise. */}
      <span className="sr-only">{text}</span>

      {/* The visible, masked lines — absolutely stacked over the probe. */}
      {lines && (
        <span className="absolute inset-0 block" aria-hidden>
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                initial={{ y: "115%", opacity: 0, filter: "blur(7px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration,
                  ease: EASE_OUT,
                  delay: delay + i * stagger,
                }}
                className="block"
              >
                {line}
              </motion.span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
