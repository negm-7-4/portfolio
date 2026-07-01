"use client";

import { motion } from "motion/react";
import Act from "@/components/overlay/Act";
import Reveal from "@/components/overlay/Reveal";
import SectionHeading from "@/components/overlay/SectionHeading";
import { projects, experience } from "@/lib/content";
import { useExperience } from "@/lib/store";

export default function Work() {
  const setHovered = useExperience((s) => s.setHoveredProject);

  return (
    <Act id="work" align="center" className="!min-h-[240vh]">
      <div className="w-full">
        <SectionHeading
          num="03"
          label="Work"
          align="center"
          title={<>Selected <span className="text-gradient italic font-light">projects</span></>}
        />

        <div className="mx-auto mt-16 max-w-4xl space-y-6">
          {projects.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.live ?? p.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.015 }}
              className="glass gradient-border group relative block overflow-hidden rounded-3xl p-6 md:p-8"
            >
              {/* tint glow from the project's hue */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: p.color }}
              />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
                      style={{ background: `${p.color}1f`, color: p.color }}
                    >
                      {p.category}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">{p.status}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-fg md:text-3xl">{p.title}</h3>
                  <p className="mt-1 text-sm text-steel">{p.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-faint">{p.desc}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <li key={t} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-fg transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/[0.06]">
                  ↗
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Experience timeline */}
        <div className="mx-auto mt-28 max-w-3xl">
          <Reveal className="mb-8 kicker text-center">The journey so far</Reveal>
          <div className="relative border-l border-white/10 pl-8">
            {experience.map((e, i) => (
              <Reveal key={e.role} delay={i * 0.05} className="relative mb-9 last:mb-0">
                <span
                  className="absolute -left-[34px] top-1.5 h-2.5 w-2.5 rounded-full bg-steel"
                  style={{ boxShadow: "0 0 10px rgba(170,180,196,0.8)" }}
                />
                <span className="font-mono text-xs text-faint">{e.period}</span>
                <h4 className="mt-1 font-display text-lg font-semibold text-fg">{e.role}</h4>
                <p className="text-sm text-steel">{e.company}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-faint">{e.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Act>
  );
}
