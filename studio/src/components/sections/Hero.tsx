"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Act from "@/components/overlay/Act";
import MagneticButton from "@/components/overlay/MagneticButton";
import { profile, heroTags } from "@/lib/content";
import { useScrollTo } from "@/lib/scroll";

const EASE = [0.16, 1, 0.3, 1] as const;

function Typewriter() {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "erasing" | "wait">("typing");
  const [idx, setIdx] = useState(0);
  const word = profile.roles[idx];

  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < word.length) t = setTimeout(() => setText(word.slice(0, text.length + 1)), 80);
      else t = setTimeout(() => setPhase("erasing"), 1500);
    } else if (phase === "erasing") {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 40);
      else {
        setIdx((i) => (i + 1) % profile.roles.length);
        setPhase("wait");
      }
    } else {
      t = setTimeout(() => setPhase("typing"), 350);
    }
    return () => clearTimeout(t);
  }, [text, phase, word, reduce]);

  return (
    <span className="inline-flex items-baseline font-display font-semibold text-fg">
      <span className="mr-2 text-steel">✦</span>
      {reduce ? profile.roles[0] : text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.04em] bg-steel"
      />
    </span>
  );
}

function NameLine({ children, delay, italic }: { children: string; delay: number; italic?: boolean }) {
  return (
    <span className="block overflow-hidden" style={{ perspective: 800 }}>
      <motion.span
        className={`block ${italic ? "font-light italic text-gradient" : "font-bold text-fg"}`}
        style={{ transformOrigin: "0% 100%" }}
        initial={{ y: "115%", rotateX: 42, filter: "blur(10px)" }}
        animate={{ y: 0, rotateX: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const { to } = useScrollTo();

  return (
    <Act id="intro" align="left">
      <div className="max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
          className="glass gradient-border mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-emerald-400/90">Available</span>
          <span className="text-white/20">·</span>
          <span>For New Projects</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
          className="mb-3 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-gradient-to-r from-white/40 to-transparent" />
          <span className="kicker">Hi there, I&apos;m</span>
        </motion.div>

        <h1
          className="font-display leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)" }}
        >
          <NameLine delay={0.6}>{profile.firstName}</NameLine>
          <NameLine delay={0.74} italic>
            {profile.lastName}
          </NameLine>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: EASE }}
          className="mt-6 text-2xl md:text-3xl"
        >
          <Typewriter />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.12, duration: 0.65, ease: EASE }}
          className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.24, duration: 0.6 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <MagneticButton
            onClick={() => to("work")}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-white px-7 py-4 text-sm font-semibold text-black shadow-[0_18px_40px_-12px_rgba(255,255,255,0.3)]"
          >
            <span className="relative">View My Work</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              →
            </motion.span>
          </MagneticButton>
          <MagneticButton
            onClick={() => to("contact")}
            className="glass gradient-border inline-flex items-center gap-3 rounded-xl px-7 py-4 text-sm font-semibold text-fg"
          >
            Get In Touch <span className="text-muted">↗</span>
          </MagneticButton>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-10 flex flex-wrap gap-2"
        >
          {heroTags.map((t, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, scale: 0.7, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.06, type: "spring", stiffness: 200, damping: 15 }}
              data-cursor="hover"
              className="glass gradient-border rounded-lg px-3 py-1.5 text-xs text-muted"
            >
              {t}
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-faint"
      >
        <span className="text-[10px] uppercase tracking-[0.32em]">Scroll</span>
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-white/25 p-1">
          <motion.span
            className="h-2 w-[3px] rounded-full bg-white/60"
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </Act>
  );
}
