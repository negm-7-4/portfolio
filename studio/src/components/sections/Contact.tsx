"use client";

import Act from "@/components/overlay/Act";
import Reveal from "@/components/overlay/Reveal";
import MagneticButton from "@/components/overlay/MagneticButton";
import { profile, testimonials } from "@/lib/content";

export default function Contact() {
  return (
    <Act id="contact" align="center" tall>
      <div className="w-full text-center">
        {/* testimonials */}
        <div className="mx-auto mb-24 grid max-w-5xl gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="glass gradient-border rounded-2xl p-5 text-left">
              <p className="text-sm leading-relaxed text-muted">“{t.quote}”</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-fg">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">{t.name}</p>
                  <p className="text-xs text-faint">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="kicker mb-6">04 · Contact</Reveal>
        <Reveal
          as="h2"
          delay={0.05}
          className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-fg sm:text-6xl md:text-7xl"
        >
          Let&apos;s build something <span className="text-gradient italic font-light">unforgettable</span>
        </Reveal>

        <Reveal delay={0.12} className="mx-auto mt-6 max-w-md text-base text-muted">
          Have a project, a role, or just an idea worth chasing? My inbox is open.
        </Reveal>

        <Reveal delay={0.18} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton
            onClick={() => {
              window.location.href = `mailto:${profile.email}`;
            }}
            className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_18px_40px_-12px_rgba(255,255,255,0.3)]"
          >
            {profile.email} <span>→</span>
          </MagneticButton>
        </Reveal>

        <Reveal delay={0.24} className="mt-10 flex flex-wrap items-center justify-center gap-5">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="text-sm uppercase tracking-[0.2em] text-faint transition-colors hover:text-fg"
            >
              {s.label}
            </a>
          ))}
        </Reveal>

        <footer className="mt-24 flex flex-col items-center gap-2 text-xs text-faint">
          <span>{profile.location}</span>
          <span>© {new Date().getFullYear()} {profile.name} · Crafted with React, Three.js &amp; obsession</span>
        </footer>
      </div>
    </Act>
  );
}
