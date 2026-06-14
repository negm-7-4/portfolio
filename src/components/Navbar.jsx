import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import MagneticButton from "./ui/MagneticButton";
import { useActiveSection } from "../hooks/useActiveSection";
import { profile } from "../data/content";

const links = [
  { label: "About",    id: "about"    },
  { label: "Services", id: "services" },
  { label: "Process",  id: "process"  },
  { label: "Projects", id: "projects" },
  { label: "Socials",  id: "socials"  },
  { label: "Contact",  id: "contact"  },
];

/* ─── Magnetic nav link — gently leans toward the cursor ─── */
function NavLink({ link, isActive, onClick }) {
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
    mx.set((e.clientX - cx) * 0.35);
    my.set((e.clientY - cy) * 0.35);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <li className="relative">
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ x: sx, y: sy }}
        data-cursor="hover"
        className={`group relative rounded-lg px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors ${
          isActive ? "text-white" : "text-white/55 hover:text-white"
        }`}
      >
        {link.label}
        {/* underline */}
        <span
          className={`absolute bottom-1 left-3.5 h-px bg-gradient-to-r from-[#aab4c4] to-white/40 transition-all duration-300 ${
            isActive ? "w-[calc(100%-1.75rem)]" : "w-0 group-hover:w-[calc(100%-1.75rem)]"
          }`}
        />
        {/* active dot */}
        {isActive && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#aab4c4]"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </motion.button>
    </li>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { active } = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    if (window.__goto) return window.__goto(id);
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -40 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  // Detect mac for showing the right keycap (⌘ vs Ctrl)
  const isMac = typeof navigator !== "undefined" && /Mac|iP(hone|ad)/.test(navigator.platform);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
          className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white"
          aria-label="Back to top"
        >
          {/* Two-layer asterisk — outer slow, inner fast, with a pulsing glow */}
          <span className="relative inline-flex h-5 w-5 items-center justify-center">
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-[#aab4c4]/20 blur-md"
            />
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="relative inline-block text-[#aab4c4] transition-colors duration-300 group-hover:text-white"
            >
              ✦
            </motion.span>
          </span>

          <span className="transition-colors duration-300">
            <span className="text-white/40 transition-colors duration-300 group-hover:text-white/70">&lt;</span>
            <span className="bar-shimmer"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, #ffffff 0%, #aab4c4 50%, #ffffff 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >ME</span>
            <span className="text-white/40 transition-colors duration-300 group-hover:text-white/70"> /&gt;</span>
          </span>
        </motion.button>

        {/* desktop links */}
        <ul className="hidden items-center gap-2 md:flex lg:gap-3">
          {links.map((l) => (
            <NavLink
              key={l.id}
              link={l}
              isActive={active.id === l.id}
              onClick={() => go(l.id)}
            />
          ))}
        </ul>

        {/* right actions */}
        <div className="flex items-center gap-2">
          {/* Cmd+K hint */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: !isMac ? false : true, ctrlKey: !isMac }))}
            data-cursor="hover"
            data-cursor-text="Search"
            className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white sm:flex"
            aria-label="Open command palette"
          >
            <span>Search</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-display">
                {isMac ? "⌘" : "Ctrl"}
              </kbd>
              <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-display">K</kbd>
            </span>
          </button>

          <MagneticButton
            as="a"
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cv relative hidden items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-black transition-all duration-300 hover:bg-white/95 sm:flex"
            style={{ boxShadow: "0 4px 12px -2px rgba(255,255,255,0.2)" }}
          >
            {/* hover shimmer sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/8 to-transparent transition-transform duration-500 ease-out group-hover/cv:translate-x-full"
            />
            <span className="relative">Resume</span>
            <motion.span
              className="relative inline-block"
              animate={{ x: [0, 2, 0], y: [0, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >↗</motion.span>
          </MagneticButton>

          {/* mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            data-cursor="hover"
            className="flex h-10 w-10 items-center justify-center rounded-xl glass md:hidden"
            aria-label="Toggle menu"
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-20 w-[92%] max-w-5xl overflow-hidden rounded-2xl glass p-4 md:hidden"
          >
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-3 top-3 h-2 w-2 border-l border-t border-white/30" />
            <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 border-r border-t border-white/30" />
            <span className="pointer-events-none absolute left-3 bottom-3 h-2 w-2 border-l border-b border-white/30" />
            <span className="pointer-events-none absolute right-3 bottom-3 h-2 w-2 border-r border-b border-white/30" />

            {/* tiny header */}
            <p className="mb-3 px-4 text-[9px] uppercase tracking-[0.35em] text-white/30">
              ◆ Navigate
            </p>

            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                      <span className="text-[10px] font-bold tracking-widest text-white/30 transition-colors group-hover:text-white/60">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
