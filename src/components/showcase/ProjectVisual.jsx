import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Project artwork with two upgrades over a plain <img>:
 *
 *  1. Multi-shot carousel — a project can carry `images: [...]`; this
 *     crossfades through them on a timer with a slow Ken-Burns drift, and
 *     exposes dots + a live counter so several screenshots per project all
 *     get seen. Single-image projects render exactly one static shot.
 *  2. Designed fallback — no artwork yet → the monogram over a brand-tinted
 *     gradient, so the slot still reads as intentional.
 *
 * Cycling pauses while off-screen (IntersectionObserver) and on hover, and
 * is disabled entirely under prefers-reduced-motion (shows the first shot).
 */
export default function ProjectVisual({
  project,
  className = "",
  imgClassName = "",
  interval = 3200,
  showControls = true,
}) {
  const shots = project.images?.length ? project.images : project.image ? [project.image] : [];
  const multi = shots.length > 1;

  const rootRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();

  // Reset when the project changes (keyed remounts also cover this, but this
  // keeps it correct if the same instance is reused).
  useEffect(() => setIdx(0), [project.title]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !multi) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "0px",
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [multi]);

  useEffect(() => {
    if (!multi || reduce || !inView || hover) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % shots.length), interval);
    return () => clearInterval(id);
  }, [multi, reduce, inView, hover, shots.length, interval]);

  if (shots.length === 0) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${className}`}
        style={{ background: `linear-gradient(135deg, ${project.color}26 0%, rgba(10,12,16,0.6) 100%)` }}
      >
        <div className="text-center">
          <p
            className="font-display text-6xl font-bold tracking-tight md:text-7xl"
            style={{ color: `${project.color}66` }}
          >
            {project.title.split(" ").map((w) => w[0]).join("")}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/55">preview · soon</p>
        </div>
      </div>
    );
  }

  const active = shots[Math.min(idx, shots.length - 1)];

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.img
          key={active}
          src={active}
          alt={`${project.title} — ${project.tagline}`}
          loading="lazy"
          decoding="async"
          initial={multi ? { opacity: 0, scale: 1.06 } : false}
          animate={{ opacity: 1, scale: reduce ? 1 : 1.04 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{
            opacity: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: reduce ? 0 : interval / 1000 + 1, ease: "linear" },
          }}
          className={`absolute inset-0 h-full w-full object-cover object-top ${imgClassName}`}
        />
      </AnimatePresence>

      {/* Shot counter + dots — only when there's more than one to see. */}
      {multi && showControls && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <div className="flex gap-1.5">
            {shots.map((_, i) => (
              <span
                key={i}
                className="block h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === idx ? 16 : 5,
                  background: i === idx ? project.color : "rgba(255,255,255,0.35)",
                  boxShadow: i === idx ? `0 0 8px ${project.color}` : "none",
                }}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/65">
            {String(idx + 1).padStart(2, "0")}/{String(shots.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
