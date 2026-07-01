"use client";

import Act from "@/components/overlay/Act";
import Reveal from "@/components/overlay/Reveal";
import SectionHeading from "@/components/overlay/SectionHeading";
import { skillCategories, services } from "@/lib/content";

export default function Skills() {
  return (
    <Act id="skills" align="left" tall>
      <div className="max-w-2xl">
        <SectionHeading
          num="02"
          label="Skills"
          title={<>An ecosystem of <span className="text-gradient italic font-light">tools</span></>}
        />

        <div className="mt-10 space-y-6">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.06}>
              <h3 className="kicker mb-3">{cat.label}</h3>
              <ul className="flex flex-wrap gap-2">
                {cat.items.map((it) => (
                  <li
                    key={it.name}
                    data-cursor="hover"
                    className="glass gradient-border group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
                  >
                    <span
                      className="h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                      style={{ background: it.color, boxShadow: `0 0 8px ${it.color}` }}
                    />
                    {it.name}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 mb-4 kicker">What I do</Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s, i) => (
            <Reveal
              key={s.num}
              delay={i * 0.06}
              className="glass gradient-border group rounded-2xl p-5"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold text-fg">{s.title}</h3>
                <span className="font-mono text-xs text-faint">{s.num}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-faint">{s.desc}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {s.points.map((p) => (
                  <li key={p} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted">
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Act>
  );
}
