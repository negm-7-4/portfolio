import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { celebrate } from "../../lib/confetti";
import { profile } from "../../data/content";
import Signature from "../ui/Signature";
import StarSignature from "../ui/StarSignature";

export default function Footer() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  // Mask reveal for the giant word — bottom edge wipes up as you scroll into the footer
  const clip = useTransform(scrollYProgress, [0.0, 0.6], ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]);
  const titleY = useTransform(scrollYProgress, [0, 1], [120, -40]);

  const goTop = () => {
    if (window.__goto) return window.__goto("hero");
    window.__lenis?.scrollTo(0, { duration: 1.6 });
  };

  const links = [
    { label: "About",    id: "about"    },
    { label: "Services", id: "services" },
    { label: "Projects", id: "projects" },
    { label: "Socials",  id: "socials"  },
    { label: "Contact",  id: "contact"  },
  ];

  const go = (id) => {
    if (window.__goto) return window.__goto(id);
    const el = document.getElementById(id);
    window.__lenis?.scrollTo(el, { offset: -40 });
  };

  return (
    <footer
      ref={ref}
      className="relative w-full overflow-hidden border-t border-white/5 pt-28 md:pt-40"
    >
      {/* ambient bottom glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-40 mx-auto h-[420px] w-[120%] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, #aab4c4 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto w-[90%] max-w-7xl">
        {/* ── Giant "LET'S BUILD" CTA ──────────────────────────── */}
        <div className="mb-16 md:mb-28">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center gap-4"
          >
            <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/65">
              ( 10 )
            </span>
            <span className="h-px w-14 bg-gradient-to-r from-white/40 to-white/0" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
              Until next time
            </span>
          </motion.div>

          {/* Two-line headline with clip-path reveal driven by scroll */}
          <motion.h2
            style={{ y: titleY }}
            className="font-display font-bold leading-[0.88] tracking-[-0.02em] text-white"
          >
            <span
              className="block"
              style={{ fontSize: "clamp(3rem, 11vw, 11rem)" }}
            >
              Let&apos;s build
            </span>
            <motion.span
              style={{ clipPath: clip, fontSize: "clamp(3rem, 11vw, 11rem)" }}
              className="block italic font-light text-gradient"
            >
              something great.
            </motion.span>
          </motion.h2>

          {/* Email button — also enormous */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-baseline gap-4"
          >
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-white/60">
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="block h-1 w-1 rounded-full bg-[#aab4c4]"
              />
              Drop me a line
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >→</motion.span>
            </span>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="hover"
              data-cursor-text="Mail"
              onClick={(e) => celebrate(e.clientX, e.clientY, "#aab4c4")}
              className="text-sheen group relative font-display text-2xl font-semibold text-white transition-colors md:text-4xl"
            >
              {profile.email}
              <span
                className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-100 transition-all duration-500 group-hover:bg-white"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.7), rgba(170,180,196,0.4), rgba(255,255,255,0.7))" }}
              />
            </a>
          </motion.div>
        </div>

        {/* ── Mid divider with scroll-to-top button ────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="my-12 flex items-center gap-6 border-t border-white/[0.08] pt-8"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            Index
          </span>
          <span className="shimmer-line h-px flex-1 bg-white/5" />
          <button
            onClick={goTop}
            data-cursor="hover"
            data-cursor-text="Top"
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="block"
            >
              ↑
            </motion.span>
            Back to top
          </button>
        </motion.div>

        {/* ── Three-column meta row ───────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 pb-10 md:grid-cols-3 md:gap-12">
          {/* navigation */}
          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/55">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => go(l.id)}
                    data-cursor="hover"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    <span className="block h-px w-0 origin-left bg-gradient-to-r from-white/60 to-transparent transition-all duration-300 group-hover:w-5" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/55">
              Connect
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  data-cursor="hover"
                  className="text-sm text-white/55 transition-colors hover:text-white"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  data-cursor="hover"
                  className="text-sm text-white/55 transition-colors hover:text-white"
                >
                  {profile.phone}
                </a>
              </li>
              <li className="text-sm text-white/60">{profile.location}</li>
            </ul>
          </div>

          {/* socials */}
          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/55">
              Elsewhere
            </h4>
            <ul className="space-y-2.5">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
                  >
                    {s.label}
                    <span className="text-[10px] text-white/50 transition-transform duration-300 group-hover:translate-x-1">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Signature row ───────────────────────────────────── */}
        <div className="flex flex-col items-center gap-8 border-t border-white/[0.07] pt-12 pb-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
              With my own hand
            </p>
            <Signature />
          </div>
          {/* creative bilingual star signature — نجم / Najm */}
          <StarSignature />
        </div>

        {/* ── Bottom signature row ────────────────────────────── */}
        <div className="flex flex-col-reverse items-start gap-4 py-8 text-[11px] uppercase tracking-[0.25em] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {profile.name} · All rights reserved
          </span>
          <span className="flex items-center gap-3">
            <span>Crafted with</span>
            <span className="text-white/60">React · Three.js · Motion</span>
          </span>
        </div>

        {/* ── Brand wordmark — last impression ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 0.04, y: 0 }}
          viewport={{ once: false, margin: "-20%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
          className="select-none pb-2 text-center font-display font-bold leading-none tracking-[-0.04em] text-white"
          style={{ fontSize: "clamp(5rem, 22vw, 22rem)" }}
        >
          NEGM
        </motion.div>
      </div>
    </footer>
  );
}
