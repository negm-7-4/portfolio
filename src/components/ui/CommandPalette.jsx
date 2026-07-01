import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { sections } from "../../data/sections";
import { profile } from "../../data/content";

/**
 * Cmd/Ctrl-K command palette. Searchable list of sections + quick
 * actions (email, GitHub, LinkedIn). Arrow keys to navigate, Enter
 * to fire, Esc to dismiss. Closes on outside click.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const lastFocused = useRef(null);

  // build the searchable command list
  const commands = useMemo(() => {
    const navCmds = sections.map((s) => ({
      type: "nav",
      id: s.id,
      label: s.label,
      hint: `Jump to ${s.label} section`,
      num: s.num,
      color: s.color,
      run: () => {
        if (window.__goto) return window.__goto(s.id);
        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
      },
    }));

    const actionCmds = [
      {
        type: "action",
        id: "email",
        label: "Send Email",
        hint: profile.email,
        run: () => window.open(`mailto:${profile.email}`),
      },
      {
        type: "action",
        id: "github",
        label: "Open GitHub",
        hint: "github.com/negm-7-4",
        run: () => window.open(profile.socials.find((s) => s.label === "GitHub")?.url, "_blank"),
      },
      {
        type: "action",
        id: "linkedin",
        label: "Open LinkedIn",
        hint: "linkedin profile",
        run: () => window.open(profile.socials.find((s) => s.label === "LinkedIn")?.url, "_blank"),
      },
      {
        type: "action",
        id: "top",
        label: "Scroll to Top",
        hint: "Hero section",
        run: () => window.__lenis?.scrollTo(0, { duration: 1.4 }) ?? window.scrollTo({ top: 0, behavior: "smooth" }),
      },
    ];

    return [...navCmds, ...actionCmds];
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(term) ||
        c.hint?.toLowerCase().includes(term)
    );
  }, [q, commands]);

  // open / close on Cmd+K
  useEffect(() => {
    const onKey = (e) => {
      // Cmd+K (mac) or Ctrl+K (win/linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[idx];
        if (cmd) {
          cmd.run();
          setOpen(false);
          setQ("");
        }
      } else if (e.key === "Tab") {
        // Trap focus inside the palette — keep it on the search input
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, idx]);

  // focus the input when opened (restoring focus on close), reset index
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      // return focus to whatever was focused before opening
      lastFocused.current?.focus?.();
    }
  }, [open]);

  // keep selected item in view
  useEffect(() => {
    const el = listRef.current?.children[idx];
    if (el?.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [idx]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/60 backdrop-blur-md pt-[18vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative mx-4 w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-[rgba(15,18,24,0.88)] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7),0_0_60px_rgba(170,180,196,0.06),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
          >
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-3 top-3 h-2.5 w-2.5 border-l border-t border-white/30" />
            <span className="pointer-events-none absolute right-3 top-3 h-2.5 w-2.5 border-r border-t border-white/30" />
            <span className="pointer-events-none absolute left-3 bottom-3 h-2.5 w-2.5 border-l border-b border-white/30" />
            <span className="pointer-events-none absolute right-3 bottom-3 h-2.5 w-2.5 border-r border-b border-white/30" />

            {/* top input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-[#aab4c4]"
              >
                ⌕
              </motion.span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                placeholder="Search sections, actions…"
                aria-label="Search sections and actions"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-listbox"
                aria-activedescendant={filtered[idx] ? `cmd-opt-${filtered[idx].id}` : undefined}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <kbd className="rounded-md border border-white/15 bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/45">
                Esc
              </kbd>
            </div>

            {/* list */}
            <div
              ref={listRef}
              id="cmd-listbox"
              role="listbox"
              aria-label="Commands"
              className="max-h-[55vh] overflow-y-auto py-2"
            >
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-white/40">
                  No matches. Try a different word.
                </div>
              ) : (
                filtered.map((c, i) => {
                  const active = i === idx;
                  return (
                    <button
                      key={c.id}
                      id={`cmd-opt-${c.id}`}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => { c.run(); setOpen(false); }}
                      className={`group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${
                        active ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* type marker */}
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-widest"
                        style={{
                          background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
                          color: c.color || "rgba(255,255,255,0.5)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {c.type === "nav" ? c.num : c.label[0]}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-display text-sm font-semibold ${active ? "text-white" : "text-white/75"}`}>
                          {c.label}
                        </p>
                        <p className="truncate text-[10px] uppercase tracking-[0.25em] text-white/35">
                          {c.hint}
                        </p>
                      </div>

                      <span
                        className={`text-xs transition-opacity ${active ? "opacity-70" : "opacity-0 group-hover:opacity-30"}`}
                      >
                        ↵
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* footer hint row */}
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5">↑</kbd>
                <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5">↵</kbd>
                select
              </span>
              <span className="hidden sm:inline">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
