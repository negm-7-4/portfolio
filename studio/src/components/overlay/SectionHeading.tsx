"use client";

import Reveal from "./Reveal";

/** Consistent act heading: kicker (num · label) + large display title. */
export default function SectionHeading({
  num,
  label,
  title,
  align = "left",
}: {
  num: string;
  label: string;
  title: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  const a =
    align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
  return (
    <div className={`flex flex-col ${a}`}>
      <Reveal className="mb-4 flex items-center gap-3">
        <span className="font-mono text-xs text-steel">{num}</span>
        <span className="h-px w-8 bg-white/20" />
        <span className="kicker">{label}</span>
      </Reveal>
      <Reveal
        as="h2"
        delay={0.05}
        className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-fg sm:text-5xl md:text-6xl"
      >
        {title}
      </Reveal>
    </div>
  );
}
