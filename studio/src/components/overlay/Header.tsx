"use client";

import { motion } from "motion/react";
import { profile } from "@/lib/content";
import { useScrollTo } from "@/lib/scroll";

/** Minimal fixed header: monogram brand + availability + contact CTA. */
export default function Header() {
  const { to } = useScrollTo();
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-10"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={() => to("intro")}
        data-cursor="hover"
        className="group flex items-center gap-2.5"
        aria-label="Back to top"
      >
        <span className="font-display text-lg font-bold tracking-tight text-fg">MN</span>
        <span className="hidden text-[11px] uppercase tracking-[0.3em] text-faint transition-colors group-hover:text-muted sm:inline">
          {profile.name}
        </span>
      </button>

      <div className="flex items-center gap-5">
        <span className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Available
        </span>
        <button
          onClick={() => to("contact")}
          data-cursor="hover"
          className="glass gradient-border rounded-full px-4 py-2 text-xs font-semibold text-fg transition-colors hover:bg-white/[0.07]"
        >
          Let&apos;s talk
        </button>
      </div>
    </motion.header>
  );
}
