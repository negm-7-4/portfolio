"use client";

import Act from "@/components/overlay/Act";
import Reveal from "@/components/overlay/Reveal";
import SectionHeading from "@/components/overlay/SectionHeading";
import { aboutCards, profile } from "@/lib/content";

const facts = [
  { k: "Education", v: profile.education },
  { k: "Year", v: profile.year },
  { k: "University", v: profile.university },
  { k: "Based in", v: profile.location },
];

export default function About() {
  return (
    <Act id="about" align="right" tall>
      <div className="ml-auto max-w-xl">
        <SectionHeading num="01" label="About" align="right" title={<>Who&apos;s behind <span className="text-gradient italic font-light">the work</span></>} />

        <Reveal delay={0.1} className="mt-6 text-right text-base leading-relaxed text-muted">
          I&apos;m a Computer Science &amp; AI student and front-end developer obsessed with the
          place where engineering meets emotion. I build interfaces that don&apos;t just function —
          they move, breathe and leave an impression.
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3">
          {aboutCards.map((c, i) => (
            <Reveal
              key={c.title}
              delay={0.12 + i * 0.07}
              className="glass gradient-border rounded-xl p-4 text-left"
            >
              <h3 className="font-display text-sm font-semibold text-fg">{c.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-faint">{c.desc}</p>
            </Reveal>
          ))}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-right">
          {facts.map((f, i) => (
            <Reveal key={f.k} delay={0.2 + i * 0.05}>
              <dt className="kicker mb-1">{f.k}</dt>
              <dd className="text-sm text-fg">{f.v}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </Act>
  );
}
