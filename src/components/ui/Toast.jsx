import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { registerToast } from "../../lib/toast";

const ToastCtx = createContext(null);

const DEFAULT_DURATION = 2500;

/**
 * Tiny toast system. Wrap the app, then call useToast().show("text") from
 * anywhere inside it, or `toast()` from lib/toast for non-React callers.
 * Stacks at the top-right; toasts auto-dismiss after 2.5s by default.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Timers are tracked so unmounting mid-flight cannot leave a setState
  // pointed at a dead component.
  const timers = useRef(new Set());

  const show = useCallback((message, opts = {}) => {
    const id = `${Date.now()}-${Math.random()}`;
    const duration = opts.duration ?? DEFAULT_DURATION;
    setToasts((t) => [...t, { id, message, kind: opts.kind ?? "info", icon: opts.icon, duration }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
    timers.current.add(timer);
  }, []);

  // Non-React callers (lib/*, event handlers outside the tree) reach the
  // toast queue through lib/toast rather than a global on `window`.
  useEffect(() => registerToast(show), [show]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 top-20 z-[9990] flex flex-col gap-2 md:right-6 md:top-24"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const tint =
              t.kind === "success" ? "rgba(74,222,128,0.45)" :
              t.kind === "warn"    ? "rgba(251,191,36,0.45)" :
                                     "rgba(170,180,196,0.45)";
            const dot =
              t.kind === "success" ? "rgb(74,222,128)" :
              t.kind === "warn"    ? "rgb(251,191,36)" :
                                     "rgb(170,180,196)";
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.92, transition: { duration: 0.25 } }}
                transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
                className="pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-[rgba(15,18,24,0.92)] px-4 py-3 backdrop-blur-md"
                style={{
                  borderColor: tint,
                  boxShadow: `0 18px 40px -10px rgba(0,0,0,0.55), 0 0 24px ${tint}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                {/* left color rail */}
                <span
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full"
                  style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
                />

                {/* type indicator dot with pulsing halo */}
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span
                    className="absolute inset-0 animate-ping rounded-full opacity-60"
                    style={{ background: dot }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: dot, boxShadow: `0 0 6px ${dot}` }}
                  />
                </span>

                {t.icon && <span className="text-base leading-none">{t.icon}</span>}

                <span className="text-[13px] font-medium tracking-tight text-white">
                  {t.message}
                </span>

                {/* tiny progress bar showing time remaining — tracks this
                    toast's own duration, not a hardcoded 2.5s */}
                <motion.span
                  className="absolute bottom-0 left-0 h-[1.5px]"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: t.duration / 1000, ease: "linear" }}
                  style={{ background: dot, opacity: 0.35 }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx) ?? { show: () => {} };
}
