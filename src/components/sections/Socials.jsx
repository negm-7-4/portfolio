import { useState } from "react";
import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import { celebrate } from "../../lib/confetti";
import { profile } from "../../data/content";

/* ───────────────── Brand-accurate SVG icons ───────────────── */
function GithubIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function LinkedinIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}
function FacebookIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
    </svg>
  );
}
function InstagramIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const ICONS = {
  GitHub:    GithubIcon,
  LinkedIn:  LinkedinIcon,
  Facebook:  FacebookIcon,
  Instagram: InstagramIcon,
};

const BRAND = {
  GitHub:    { color: "#ffffff", glow: "rgba(255,255,255,0.40)", grad: "linear-gradient(135deg,#2b3038 0%,#0d1117 100%)" },
  LinkedIn:  { color: "#0a66c2", glow: "rgba(10,102,194,0.55)",  grad: "linear-gradient(135deg,#0a66c2 0%,#003a7a 100%)" },
  Facebook:  { color: "#1877f2", glow: "rgba(24,119,242,0.55)",  grad: "linear-gradient(135deg,#1877f2 0%,#0a4dad 100%)" },
  Instagram: { color: "#e1306c", glow: "rgba(225,48,108,0.55)",  grad: "linear-gradient(135deg,#f58529 0%,#dd2a7b 50%,#8134af 100%)" },
};

/* ───────────────── Individual social orb ───────────────── */
function SocialOrb({ s, i }) {
  const [bursts, setBursts] = useState([]);
  const Icon = ICONS[s.label];
  const { color, glow, grad } = BRAND[s.label] || BRAND.GitHub;

  const handleClick = (e) => {
    const id = Date.now() + Math.random();
    setBursts((arr) => [...arr, id]);
    setTimeout(() => setBursts((arr) => arr.filter((b) => b !== id)), 900);
    celebrate(e.clientX, e.clientY, color);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating wrapper — continuous bob, different per icon */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 3.2 + i * 0.45,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.35,
        }}
      >
        <motion.a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          onClick={handleClick}
          aria-label={s.label}
          initial={{ opacity: 0, y: 60, scale: 0.4, rotate: -180 }}
          whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          viewport={{ once: false, margin: "-15%" }}
          transition={{
            delay: i * 0.12,
            type: "spring",
            stiffness: 160,
            damping: 14,
            mass: 0.7,
          }}
          whileHover={{ scale: 1.2, y: -12, transition: { type: "spring", stiffness: 380, damping: 20 } }}
          whileTap={{ scale: 0.88, rotate: -8 }}
          className="group relative flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          {/* Brand gradient fill — fades in on hover */}
          <span
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: grad }}
          />

          {/* Glow halo on hover */}
          <span
            className="pointer-events-none absolute -inset-3 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
          />

          {/* Spinning ring with orbiting dot — visible on hover */}
          <motion.span
            className="pointer-events-none absolute -inset-3 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ border: `1px solid ${color}55` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          >
            <span
              className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            />
          </motion.span>

          {/* Counter-spinning outer ring */}
          <motion.span
            className="pointer-events-none absolute -inset-6 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-80"
            style={{ border: `1px dashed ${color}30` }}
            animate={{ rotate: -360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />

          {/* Icon with hover wiggle */}
          <motion.span
            whileHover={{ rotate: [0, -12, 12, -8, 0] }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-white/75 transition-colors duration-300 group-hover:text-white"
          >
            <Icon size={36} />
          </motion.span>

          {/* Click burst ripples */}
          {bursts.map((id) => (
            <motion.span
              key={id}
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}` }}
              initial={{ scale: 1, opacity: 0.85 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
          {/* Second wave burst */}
          {bursts.map((id) => (
            <motion.span
              key={`${id}-w2`}
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 60%)` }}
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
            />
          ))}
        </motion.a>
      </motion.div>

      {/* Label — slides in below */}
      <motion.span
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-15%" }}
        transition={{ delay: i * 0.14 + 0.45, duration: 0.5 }}
        className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/45 transition-colors duration-300 group-hover:text-white"
      >
        {s.label}
      </motion.span>
    </div>
  );
}

/* ───────────────── Section ───────────────── */
export default function Socials() {
  return (
    <section
      id="socials"
      className="relative w-full py-28 md:py-40 overflow-hidden"
    >
      {/* Ambient orbs that float behind */}
      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #8a93a6 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.25, 1], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #6f7c8c 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="mx-auto w-[85%] sm:w-[80%] max-w-4xl">
        <SectionHeading num="08" eyebrow="Connect" title="Find Me" accent="Online" />

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-xl text-center text-base text-white/55"
        >
          Tap any platform — let&apos;s build something together. I reply fast.
        </motion.p>

        {/* Orbs row */}
        <div className="flex flex-wrap items-end justify-center gap-10 md:gap-16">
          {profile.socials.map((s, i) => (
            <SocialOrb key={s.label} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
