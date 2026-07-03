import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

import { projects } from "../../../data/content";
import { EASE_OUT } from "../../../lib/motion";
import useWorldDye from "../useWorldDye";
import TechBadges from "../TechBadges";
import ShowcaseCta from "../ShowcaseCta";
import ProjectVisual from "../ProjectVisual";

/**
 * ── FLIP CARDS SHOWCASE — the physical deck ───────────────────────────
 * A grid of glass cards. Each one tilts toward the cursor like a real
 * object, and flips with a lift → anticipation → rotation → settle
 * choreography (never a flat 180° swivel). Front is the artwork; back is
 * the full dossier — description, stack, links.
 *
 * Fully keyboard-operable: cards are buttons, Enter/Space flips, links on
 * the back are reachable while flipped.
 */

const TILT_MAX = 9; // degrees
const SPRING_TILT = { stiffness: 220, damping: 22, mass: 0.6 };

/* Flip choreography: lift + a small counter-wind before committing. */
const FLIP_TRANSITION = {
  rotateY: { type: "spring", stiffness: 160, damping: 19, mass: 0.9 },
  scale: { duration: 0.55, ease: EASE_OUT },
};

function Card({ p, i, onFocus }) {
  const [flipped, setFlipped] = useState(false);
  const shellRef = useRef(null);
  const num = String(i + 1).padStart(2, "0");

  // Pointer tilt — springs so the card settles like a physical object.
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotateX = useSpring(tx, SPRING_TILT);
  const rotateY = useSpring(ty, SPRING_TILT);

  const onMove = (e) => {
    if (flipped) return;
    const r = shellRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tx.set(-py * TILT_MAX * 2);
    ty.set(px * TILT_MAX * 2);
  };

  const onLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  const flip = () => {
    onLeave();
    setFlipped((f) => !f);
    onFocus(i);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: EASE_OUT }}
      className="relative"
      style={{ perspective: 1400 }}
    >
      {/* tilt shell */}
      <motion.div
        ref={shellRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={() => onFocus(i)}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* flip shell */}
        <motion.div
          animate={{
            rotateY: flipped ? 180 : 0,
            scale: flipped ? [1, 1.045, 1] : [1, 1.045, 1],
          }}
          transition={FLIP_TRANSITION}
          style={{ transformStyle: "preserve-3d" }}
          className="relative aspect-[4/5] w-full sm:aspect-[3/4]"
        >
          {/* ══ FRONT ══ */}
          <button
            type="button"
            onClick={flip}
            data-cursor="hover"
            data-cursor-text="Flip"
            aria-label={`Flip to details of ${p.title}`}
            aria-pressed={flipped}
            tabIndex={flipped ? -1 : 0}
            className="group absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-0">
              <ProjectVisual project={p} imgClassName="transition-transform duration-700 group-hover:scale-[1.05]" />
            </div>
            {/* glass grade + readability scrim */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, transparent 30%, rgba(6,8,12,0.55) 72%, rgba(6,8,12,0.92) 100%)`,
              }}
            />
            {/* light sweep on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />

            <div className="absolute inset-x-0 bottom-0 p-6">
              <span
                className="block font-display text-[10px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: `${p.color}cc` }}
              >
                ( {num} ) · {p.category}
              </span>
              <span className="mt-2 block font-display text-2xl font-bold leading-[1.0] tracking-tight text-white md:text-3xl">
                {p.title}
              </span>
              <span className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/40">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                />
                Tap to flip
              </span>
            </div>
          </button>

          {/* ══ BACK ══ */}
          <div
            aria-hidden={!flipped}
            className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-[#0a0d13]/95 p-6 backdrop-blur-md"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 60px -20px ${p.color}66`,
            }}
          >
            {/* accent corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
              style={{ background: `radial-gradient(circle, ${p.color}, transparent 70%)` }}
            />

            <span
              className="font-display text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: `${p.color}cc` }}
            >
              ( {num} ) · {p.tagline}
            </span>
            <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-white md:text-2xl">
              {p.title}
            </h3>
            <p className="mt-3 flex-1 overflow-y-auto text-[13px] leading-[1.7] text-white/55">
              {p.desc}
            </p>

            {flipped && (
              <>
                <div className="mt-4">
                  <TechBadges tech={p.tech} accent={p.color} delay={0.15} />
                </div>
                <div className="mt-5">
                  <ShowcaseCta project={p} delay={0.3} />
                </div>
              </>
            )}

            <button
              type="button"
              onClick={flip}
              data-cursor="hover"
              tabIndex={flipped ? 0 : -1}
              aria-label={`Flip ${p.title} back to artwork`}
              className="mt-5 self-start text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              ← Flip back
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function FlipCardsShowcase() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "-15% 0px -15% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useWorldDye(active, inView);

  return (
    <div ref={ref} className="mx-auto w-[90%] max-w-7xl">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p, i) => (
          <Card key={p.title} p={p} i={i} onFocus={setActive} />
        ))}
      </div>
    </div>
  );
}
