"use client";

import { motion } from "motion/react";
import { chapters } from "@/lib/journey";
import { useExperience } from "@/lib/store";
import { useScrollTo } from "@/lib/scroll";

/** Fixed vertical act-navigator on the right edge. */
export default function ChapterRail() {
  const active = useExperience((s) => s.chapter);
  const { to } = useScrollTo();

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex"
    >
      {chapters.map((c, i) => {
        const on = i === active;
        return (
          <button
            key={c.id}
            onClick={() => to(c.id, { offset: 0 })}
            data-cursor="hover"
            className="group flex items-center gap-3"
            aria-current={on ? "true" : undefined}
          >
            <span
              className={`font-mono text-[10px] tracking-widest transition-all duration-300 ${
                on ? "text-fg opacity-100" : "text-faint opacity-0 group-hover:opacity-100"
              }`}
            >
              {c.num} · {c.label}
            </span>
            <span className="relative flex h-3 w-3 items-center justify-center">
              <motion.span
                className="rounded-full"
                animate={{
                  width: on ? 11 : 5,
                  height: on ? 11 : 5,
                  backgroundColor: on ? c.accent : "rgba(139,148,168,0.5)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              />
              {on && (
                <motion.span
                  layoutId="rail-glow"
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 12px ${c.accent}` }}
                />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
