import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import TiltCard from "./TiltCard";
import { profile } from "../../data/content";

/**
 * Portrait — an animated, dynamic profile photo card.
 *
 * Layers (bottom → top):
 *   1. Pulsing radial glows + a slowly-rotating conic "aura" ring behind.
 *   2. A 3D TiltCard holding the photo (webp + jpg fallback).
 *   3. Gradient overlays, a looping diagonal light sweep and fine grain.
 *   4. Corner brackets, a floating tech chip and a glass name-plate.
 *
 * Everything heavy (infinite loops, parallax) is disabled under
 * prefers-reduced-motion so it degrades to a clean static card.
 */
export default function Portrait({ className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-12%" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      style={reduce ? undefined : { y }}
      className={`relative mx-auto w-full max-w-[360px] ${className}`}
    >
      {/* ── Ambient glows behind the card ───────────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] opacity-60"
        style={{ background: "radial-gradient(circle at 50% 35%, rgba(170,180,196,0.22), transparent 65%)" }}
        animate={reduce ? undefined : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating conic aura ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] opacity-50 blur-xl"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(170,180,196,0.0), rgba(170,180,196,0.45), rgba(111,124,140,0.0), rgba(156,149,140,0.4), rgba(170,180,196,0.0))",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      {/* Dashed orbit ring decoration */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full border border-dashed border-white/15"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#aab4c4]"
          style={{ boxShadow: "0 0 8px rgba(170,180,196,0.7)" }}
        />
      </motion.div>

      {/* ── The card ─────────────────────────────────────────────── */}
      <TiltCard
        max={11}
        spotColor="170,180,196"
        data-cursor="hover"
        className="group/portrait relative overflow-hidden rounded-[1.7rem] glass p-2"
      >
        <div className="relative overflow-hidden rounded-[1.3rem]">
          {/* Photo */}
          <picture>
            <source srcSet="/mohamed.webp" type="image/webp" />
            <img
              src="/mohamed.jpg"
              alt="Mohamed Negm — Front-End Developer"
              width="820"
              height="1024"
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full select-none object-cover object-[center_22%] saturate-[1.05] contrast-[1.04] transition-[transform,filter] duration-[900ms] ease-out will-change-transform group-hover/portrait:scale-[1.06] group-hover/portrait:brightness-110"
              draggable="false"
            />
          </picture>

          {/* Cohesion tint — pulls the photo toward the cool palette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-40"
            style={{ background: "linear-gradient(150deg, rgba(170,180,196,0.55), transparent 55%, rgba(111,124,140,0.45))" }}
          />

          {/* Top + bottom legibility gradients */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#0b0d11]/60 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0b0d11]/85 via-[#0b0d11]/25 to-transparent" />

          {/* Looping diagonal light sweep */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-y-10 -left-1/3 w-1/3 -skew-x-12"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }}
              animate={{ x: ["0%", "420%"] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3.5 }}
            />
          )}

          {/* Fine grain texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-dots" aria-hidden />

          {/* Corner brackets */}
          {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"].map((c) => (
            <span key={c} aria-hidden className={`pointer-events-none absolute h-6 w-6 rounded-[3px] border-white/30 transition-colors duration-500 group-hover/portrait:border-[#aab4c4]/80 ${c}`} />
          ))}

          {/* Name plate */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-xl glass px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-white">
                {profile.name}
              </p>
              <p className="truncate text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
                {profile.role}
              </p>
            </div>
            <span className="relative flex h-2 w-2 shrink-0" title="Available">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
            </span>
          </div>
        </div>
      </TiltCard>

      {/* Floating tech chip */}
      <motion.div
        aria-hidden
        className="absolute -left-4 top-8 z-20 rounded-xl glass px-3 py-2 font-display text-xs font-semibold text-white/80"
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-12%" }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.span className="block" animate={reduce ? undefined : { y: [0, -9, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <span className="text-[#aab4c4]">{"</>"}</span> React
        </motion.span>
      </motion.div>

      {/* Floating experience chip */}
      <motion.div
        aria-hidden
        className="absolute -right-3 bottom-16 z-20 rounded-xl glass px-3 py-2 text-center"
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-12%" }}
        transition={{ delay: 0.65, duration: 0.6 }}
      >
        <motion.div animate={reduce ? undefined : { y: [0, 9, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <p className="font-display text-base font-bold leading-none text-white">CS &amp; AI</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-white/45">Student</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
