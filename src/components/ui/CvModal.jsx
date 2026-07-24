import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { profile, resume } from "../../data/content";

/**
 * CV MODAL — a cinematic, in-page résumé.
 *
 * Opened from anywhere by dispatching `window.dispatchEvent(new Event("open-cv"))`
 * (the Navbar / Contact / command palette all use this), so it stays fully
 * decoupled — no prop drilling, no shared store. It renders the résumé live
 * from `resume` in content.js (the same data the downloadable PDF was built
 * from), with a curtain entrance and staggered section reveals.
 *
 * Give-them-the-file affordances: a primary "Download PDF" (native download)
 * and "Open in new tab" (view/print). ESC and backdrop click close it; body
 * scroll is locked while open; reduced-motion collapses the choreography.
 */

const EASE = [0.16, 1, 0.3, 1];

/* A titled block whose children fade+rise in a stagger. */
function Block({ label, index, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.18 + index * 0.07 }}
      className="border-t border-white/10 pt-5"
    >
      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
        <span className="text-[#aab4c4]">◆</span>
        {label}
      </h3>
      {children}
    </motion.section>
  );
}

export default function CvModal() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-cv", onOpen);
    return () => window.removeEventListener("open-cv", onOpen);
  }, []);

  // ESC to close + lock the page scroll (and freeze Lenis) while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.__lenis?.start?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9800] flex items-start justify-center overflow-y-auto p-4 py-10 sm:py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Curriculum Vitae"
        >
          {/* Backdrop — blurred, dimmed */}
          <div
            aria-hidden
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96, clipPath: "inset(0 0 100% 0 round 24px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, clipPath: "inset(0 0 0% 0 round 24px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/12 bg-[rgba(13,16,22,0.92)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* accent glow bleed at the top */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(170,180,196,0.5), transparent 70%)" }}
            />

            {/* corner brackets */}
            {[
              "left-4 top-4 border-l border-t",
              "right-4 top-4 border-r border-t",
              "left-4 bottom-4 border-l border-b",
              "right-4 bottom-4 border-r border-b",
            ].map((c, i) => (
              <span key={i} className={`pointer-events-none absolute ${c} h-4 w-4 border-white/15`} aria-hidden />
            ))}

            <div className="relative max-h-[82vh] overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
              {/* ── Header ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.4em] text-white/55">Curriculum Vitae</p>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {profile.name}
                  </h2>
                  <p className="mt-1.5 text-sm font-medium text-[#aab4c4]">
                    {resume.headline}
                  </p>
                  <p className="text-xs text-white/65">{resume.subhead}</p>
                </div>

                {/* contact chips */}
                <div className="flex flex-wrap gap-1.5">
                  {resume.contact.map((c) =>
                    c.href ? (
                      <a
                        key={c.label}
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        data-cursor="hover"
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <span
                        key={c.label}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/65"
                      >
                        {c.value}
                      </span>
                    )
                  )}
                </div>
              </motion.div>

              {/* ── Summary ── */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
                className="mt-6 border-t border-white/10 pt-5 text-[13px] leading-relaxed text-white/60"
              >
                {resume.summary}
              </motion.p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* ── Skills ── */}
                <Block label="Technical Skills" index={0}>
                  <div className="flex flex-col gap-3">
                    {resume.skillGroups.map((g) => (
                      <div key={g.label}>
                        <p className="mb-1.5 text-[11px] font-semibold text-white/70">{g.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {g.items.map((it) => (
                            <span
                              key={it}
                              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/55"
                            >
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>

                {/* ── Education + Languages + Soft skills ── */}
                <div className="flex flex-col gap-6">
                  <Block label="Education" index={1}>
                    <p className="text-[12px] font-semibold text-white/80">{resume.education.degree}</p>
                    <p className="mt-1 text-[11px] text-white/50">{resume.education.school}</p>
                    <p className="text-[11px] text-white/60">{resume.education.location}</p>
                    <p className="mt-1 text-[11px] text-[#aab4c4]">{resume.education.detail}</p>
                  </Block>

                  <Block label="Languages" index={2}>
                    <div className="flex flex-col gap-1.5">
                      {resume.languages.map((l) => (
                        <div key={l.name} className="flex items-center justify-between text-[11px]">
                          <span className="text-white/70">{l.name}</span>
                          <span className="text-white/60">{l.level}</span>
                        </div>
                      ))}
                    </div>
                  </Block>
                </div>
              </div>

              {/* ── Projects ── */}
              <div className="mt-6">
                <Block label="Projects" index={3}>
                  <div className="flex flex-col gap-4">
                    {resume.projects.map((p) => (
                      <div key={p.name} className="group/pr rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4 className="font-display text-sm font-bold text-white">{p.name}</h4>
                          <span className="shrink-0 text-[10px] text-white/55">{p.kind}</span>
                        </div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">{p.desc}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#aab4c4]/80">{p.stack}</p>
                      </div>
                    ))}
                  </div>
                </Block>
              </div>

              {/* ── Soft skills ── */}
              <div className="mt-6">
                <Block label="Soft Skills" index={4}>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.softSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </Block>
              </div>
            </div>

            {/* ── Sticky action bar ── */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[rgba(10,12,17,0.85)] px-6 py-4 sm:px-10">
              <button
                onClick={() => setOpen(false)}
                data-cursor="hover"
                className="text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white/80"
              >
                ← Close
              </button>

              <div className="flex items-center gap-2.5">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  data-cursor-text="Open"
                  className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  Open in tab ↗
                </a>
                <a
                  href={profile.resumeUrl}
                  download={profile.resumeFile}
                  data-cursor="hover"
                  data-cursor-text="Save"
                  className="group/dl relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-black"
                  style={{ boxShadow: "0 10px 28px -8px rgba(255,255,255,0.35)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-500 ease-out group-hover/dl:translate-x-full"
                  />
                  <span className="relative">Download CV</span>
                  <motion.span
                    className="relative inline-block"
                    animate={{ y: [0, 2, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    ↓
                  </motion.span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
