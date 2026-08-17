import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import MagneticButton from "./ui/MagneticButton";
import LanguageToggle from "./ui/LanguageToggle";
import { useContent } from "../i18n/useContent";
import ScrambleText from "./ui/ScrambleText";
import { useActiveSection } from "../hooks/useActiveSection";
import { goToSection } from "../lib/navigation";
import { openCv, openCommandPalette } from "../lib/appEvents";

// `id` is the scroll target and never changes; only the label is translated,
// so deep links and the active-section tracker keep working in both languages.
const LINK_IDS = ["about", "services", "process", "projects", "socials", "contact"];

/* ─── A star on the constellation trail ───────────────────────────────
   Each section is a star. The node sits ON the hairline that runs through
   the whole nav; the label hangs beneath it and stays permanently visible
   (a nav that hides its labels is a puzzle, not a menu). Visited stars are
   lit, the current one blooms into the site's four-point glyph, and the
   button still leans toward the cursor. */
function NavLink({ link, isActive, isPassed, onClick }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 280, damping: 18, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 280, damping: 18, mass: 0.5 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    mx.set((e.clientX - cx) * 0.28);
    my.set((e.clientY - cy) * 0.28);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <li className="relative">
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ x: sx, y: sy }}
        data-cursor="hover"
        aria-current={isActive ? "true" : undefined}
        className={`group relative flex flex-col items-center gap-2 px-3 pb-1 pt-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em] transition-colors ${
          isActive
            ? "text-white"
            : isPassed
              ? "text-white/70 hover:text-white"
              : "text-white/55 hover:text-white"
        }`}
      >
        {/* the star node, sitting on the trail (the nav measures the lit
            trail to this element's centre) */}
        <span
          data-nav-active={isActive ? "true" : undefined}
          className="relative flex h-3 w-3 items-center justify-center"
        >
          {isActive && (
            <motion.span
              layoutId="nav-star-halo"
              className="absolute h-3.5 w-3.5 rounded-full bg-[#aab4c4]/30 blur-[3px]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {isActive ? (
            /* the current star blooms into the site's own glyph */
            <svg
              viewBox="0 0 24 24"
              className="relative h-3 w-3 drop-shadow-[0_0_5px_rgba(170,180,196,0.9)]"
              aria-hidden
            >
              <path
                d="M12 0 C12.7 7.3 16.7 11.3 24 12 C16.7 12.7 12.7 16.7 12 24 C11.3 16.7 7.3 12.7 0 12 C7.3 11.3 11.3 7.3 12 0 Z"
                fill="#ffffff"
              />
            </svg>
          ) : (
            <span
              className={`relative block rounded-full transition-all duration-300 ${
                isPassed
                  ? "h-[5px] w-[5px] bg-[#aab4c4] group-hover:h-2 group-hover:w-2"
                  : "h-[4px] w-[4px] bg-white/30 group-hover:h-2 group-hover:w-2 group-hover:bg-[#aab4c4]"
              }`}
            />
          )}
        </span>

        <span className="relative z-10 leading-none">
          <ScrambleText text={link.label} />
        </span>
      </motion.button>
    </li>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { active } = useActiveSection();
  const { t } = useContent();
  const links = useMemo(() => LINK_IDS.map((id) => ({ id, label: t.nav[id] })), [t]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    goToSection(id);
  };

  // Detect mac for showing the right keycap (⌘ vs Ctrl)
  // `navigator.platform` is deprecated; userAgentData is the supported
  // replacement, with the UA string as the fallback for browsers without it.
  const isMac =
    typeof navigator !== "undefined" &&
    /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform || navigator.userAgent || "");

  /* How far along the constellation the visitor has travelled.
     The stars are not evenly spaced (labels differ in width), so the lit
     trail is MEASURED to the active star's real centre rather than derived
     from its index — an index-based percentage would drift off the nodes. */
  const listRef = useRef(null);
  const [trailW, setTrailW] = useState(0);

  // Sections the nav doesn't list (Hero, Skills, Journey…) keep the last
  // resolved star so the trail never snaps back to zero mid-journey.
  const navIndexRef = useRef(0);
  const exactIndex = links.findIndex((l) => l.id === active.id);
  if (exactIndex !== -1) navIndexRef.current = exactIndex;
  const activeIndex = navIndexRef.current;

  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return undefined;
    const measure = () => {
      const star = ul.querySelector('[data-nav-active="true"]');
      if (!star) return; // not a listed section — hold the current trail
      const u = ul.getBoundingClientRect();
      const s = star.getBoundingClientRect();
      setTrailW(Math.max(0, s.left + s.width / 2 - u.left));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [active.id]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 z-[9000] flex w-full justify-center px-4 py-4"
    >
      <nav
        className={`flex w-[92%] max-w-7xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
          scrolled ? "glass shadow-lg shadow-black/40" : "bg-transparent"
        }`}
      >
        {/* logo */}
        <motion.button
          onClick={() => go("hero")}
          data-cursor="hover"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          // min-h-11 on touch: the mark alone is only ~28px tall, under the 44px
          // minimum, and this is the control that takes you back to the top.
          className="group flex min-h-11 items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white md:min-h-0"
          aria-label="Negm — back to top"
        >
          {/* ── The mark: NEGM means "star" (نجم) in Arabic, so the logo IS a
                star — the same four-point glyph the particle field resolves
                into at the end of the journey. Drawn as SVG (not a font
                glyph) so it stays razor-sharp and can animate its stroke. */}
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <span
              aria-hidden
              className="glow-pulse absolute inset-0 rounded-full bg-[#aab4c4]/25 blur-md transition-all duration-500 group-hover:bg-[#aab4c4]/40"
            />
            <svg
              viewBox="0 0 24 24"
              className="spin-slow relative h-5 w-5 overflow-visible"
              aria-hidden
            >
              {/* sharp four-point star: peaks on the axes, pinched diagonals */}
              <path
                d="M12 0 C12.7 7.3 16.7 11.3 24 12 C16.7 12.7 12.7 16.7 12 24 C11.3 16.7 7.3 12.7 0 12 C7.3 11.3 11.3 7.3 12 0 Z"
                className="fill-[#aab4c4] transition-colors duration-300 group-hover:fill-white"
              />
              {/* orbit ring that draws itself on hover (dash offset is
                  animated via the .logo-orbit rule in index.css) */}
              <circle
                cx="12"
                cy="12"
                r="10.5"
                fill="none"
                stroke="rgba(170,180,196,0.55)"
                strokeWidth="0.8"
                className="logo-orbit"
              />
            </svg>
          </span>

          {/* Wordmark — the name itself, with the Arabic reading revealed on
              hover so the meaning behind the star lands. */}
          <span className="flex items-baseline gap-1.5">
            <span
              className="bar-shimmer tracking-[0.08em]"
              style={{
                backgroundImage: "linear-gradient(110deg, #ffffff 0%, #aab4c4 50%, #ffffff 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                color: "#eef1f6", // fallback so the word is never invisible
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NEGM
            </span>
            <span
              dir="rtl"
              lang="ar"
              aria-hidden
              className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold text-[#aab4c4]/0 transition-all duration-500 ease-out group-hover:max-w-[3rem] group-hover:text-[#aab4c4]/90"
            >
              نجم
            </span>
          </span>
        </motion.button>

        {/* ── The constellation trail ────────────────────────────────
            The sections are stars on one continuous line, and the line
            LIGHTS UP behind you as you travel the page — so the nav
            doubles as a progress map: where you are, how far you've come,
            and what's still ahead, without adding a single new control. */}
        <ul ref={listRef} className="relative hidden items-center gap-2 md:flex lg:gap-3">
          {/* the unlit trail */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[7px] h-px bg-white/12"
          />
          {/* the travelled portion, lit up to the current star */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-0 top-[7px] h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(170,180,196,0.15), rgba(170,180,196,0.85) 65%, #ffffff)",
            }}
            initial={false}
            animate={{ width: trailW }}
            transition={{ type: "spring", stiffness: 120, damping: 26, mass: 0.7 }}
          />
          {links.map((l, i) => (
            <NavLink
              key={l.id}
              link={l}
              isActive={active.id === l.id}
              isPassed={i < activeIndex}
              onClick={() => go(l.id)}
            />
          ))}
        </ul>

        {/* right actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          {/* Cmd+K hint */}
          <button
            onClick={openCommandPalette}
            data-cursor="hover"
            data-cursor-text="Search"
            // 44px tall on phones (thumb-friendly minimum); compact from md up.
            className="gradient-border flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white md:h-9 md:min-w-0"
            aria-label="Open command palette"
          >
            {/* Narrow screens keep the control — it just drops to the icon
                instead of disappearing (it used to vanish under `sm`). */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4 lg:hidden"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="hidden lg:inline">{t.cta.search}</span>
            <span className="hidden items-center gap-1 lg:flex">
              <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-display">
                {isMac ? "⌘" : "Ctrl"}
              </kbd>
              <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-display">
                K
              </kbd>
            </span>
          </button>

          <MagneticButton
            as="button"
            onClick={openCv}
            data-cursor="hover"
            data-cursor-text="View CV"
            aria-label="View my CV"
            className="group/cv relative flex h-11 min-w-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-3 py-2 text-xs font-semibold uppercase tracking-widest text-black transition-all duration-300 hover:bg-white/95 md:h-9 md:min-w-0 md:px-4"
            style={{ boxShadow: "0 4px 12px -2px rgba(255,255,255,0.2)" }}
          >
            {/* hover shimmer sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/8 to-transparent transition-transform duration-500 ease-out group-hover/cv:translate-x-full"
            />
            {/* little document glyph so it reads unmistakably as a CV */}
            <span aria-hidden className="relative text-[13px] leading-none">
              ▤
            </span>
            {/* label collapses on narrow screens, but the button stays */}
            <span className="relative hidden lg:inline">{t.cta.viewCv}</span>
            <motion.span
              className="relative hidden text-[10px] lg:inline-block"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >
              ↓
            </motion.span>
          </MagneticButton>

          {/* mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            data-cursor="hover"
            className="flex h-11 w-11 items-center justify-center rounded-xl glass md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <div className="flex flex-col gap-1.5">
              <motion.span
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-5 bg-white"
              />
              <motion.span
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 w-5 bg-white"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-5 bg-white"
              />
            </div>
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            id="mobile-menu"
            className="absolute top-20 w-[92%] max-w-5xl overflow-hidden rounded-2xl glass p-4 md:hidden"
          >
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-3 top-3 h-2 w-2 border-l border-t border-white/30" />
            <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 border-r border-t border-white/30" />
            <span className="pointer-events-none absolute left-3 bottom-3 h-2 w-2 border-l border-b border-white/30" />
            <span className="pointer-events-none absolute right-3 bottom-3 h-2 w-2 border-r border-b border-white/30" />

            {/* tiny header */}
            <p className="mb-3 px-4 text-[9px] uppercase tracking-[0.35em] text-white/50">
              ◆ Navigate
            </p>

            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => go(l.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm uppercase tracking-widest transition-colors ${
                      active.id === l.id
                        ? "bg-white/[0.06] text-white"
                        : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[10px] font-bold tracking-widest text-white/50 transition-colors group-hover:text-white/60">
                        0{i + 1}
                      </span>
                      {l.label}
                    </span>
                    {active.id === l.id && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[#aab4c4]"
                        style={{ filter: "drop-shadow(0 0 4px rgba(170,180,196,0.6))" }}
                      >
                        ●
                      </motion.span>
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>

            {/* mobile CV button */}
            <motion.button
              onClick={() => {
                setOpen(false);
                openCv();
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + links.length * 0.05,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-semibold uppercase tracking-widest text-black"
            >
              <span aria-hidden>▤</span>
              View / Download CV
              <span aria-hidden className="text-[10px]">
                ↓
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
