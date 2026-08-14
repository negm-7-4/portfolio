import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import useOverlayScrollLock from "../../hooks/useOverlayScrollLock";
import { experience } from "../../store/experience";
import { sfxTheme } from "../../lib/ambientAudio";

/**
 * LIGHTBOX — click any project image and it opens.
 *
 * Not a fade-in overlay. The image travels: the frame you clicked is measured,
 * and the full-screen view starts life mapped exactly onto that rectangle,
 * then releases into place. Because it is one continuous object the eye never
 * loses it, which is the whole difference between "a dialog appeared" and
 * "the thing I clicked grew".
 *
 * It is wired by DELEGATION rather than by touching every section: any
 * `img[data-zoomable]` on the page is openable, and the gallery it belongs to
 * is simply the other zoomable images inside its own `<section>`. Adding an
 * image anywhere on the site gets this for free, and no layout is wrapped in
 * an extra element to make it work.
 *
 * The world answers too — opening fires the same shockwave through the
 * particle field that the hero's pulse control does.
 */

const EASE = [0.16, 1, 0.3, 1];

/* How much of the viewport the opened image may occupy. Leaves room for the
   caption bar and stops a tall screenshot from touching the edges. */
const FIT_W = 0.92;
const FIT_H = 0.82;

/** Is this image wrapped in something that already handles clicks? */
function isInsideControl(img) {
  return Boolean(img.parentElement?.closest("a, button, [role='button']"));
}

/** Width ÷ height of the real image, preferring the declared intrinsic size. */
function intrinsicRatio(el) {
  const w = Number(el.getAttribute("width")) || el.naturalWidth;
  const h = Number(el.getAttribute("height")) || el.naturalHeight;
  return w > 0 && h > 0 ? w / h : 16 / 9;
}

/**
 * The biggest centred box of this aspect ratio that fits the viewport.
 *
 * Driven by the ratio rather than by pixel dimensions: the opened image
 * should always fill the screen it is being viewed on, and sizing it from
 * the source file's pixels made a small image open small.
 */
function targetRect(ratio, vw, vh) {
  const availW = vw * FIT_W;
  const availH = vh * FIT_H;
  let width = availW;
  let height = width / ratio;
  if (height > availH) {
    height = availH;
    width = height * ratio;
  }
  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
    left: (vw - width) / 2,
    top: (vh - height) / 2,
  };
}

/**
 * The FLIP transform: where the opened image must START so that it sits
 * exactly on top of the thumbnail that was clicked. Animating this back to
 * identity is the travel, and it is transform-only — no layout in the loop.
 */
function flipFrom(source, target) {
  if (!source) return { opacity: 0, scale: 0.92 };
  return {
    x: source.left + source.width / 2 - (target.left + target.width / 2),
    y: source.top + source.height / 2 - (target.top + target.height / 2),
    scaleX: source.width / target.width,
    scaleY: source.height / target.height,
    opacity: 1,
  };
}

export default function Lightbox() {
  const reduce = useReducedMotion();
  const [state, setState] = useState(null); // { items, index, source, origin }
  const open = state !== null;

  const dialogRef = useRef(null);
  const lastFocused = useRef(null);
  // Bumped on every navigation so the entry choreography re-runs per image.
  const [pulse, setPulse] = useState(0);
  /* Tracked rather than read at open time: rotating a phone or resizing the
     window while the viewer is open must re-fit the image, and reading
     `window.innerWidth` during render would never re-run. */
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  }));

  useOverlayScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [open]);

  /* ── Opening: delegated, so no section has to know this exists ── */
  useEffect(() => {
    const onClick = (event) => {
      // Let modified clicks and non-primary buttons behave normally.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const img = event.target.closest?.("img[data-zoomable]");
      if (!img) return;
      // An image wrapped in a link or a control keeps its own job. Note the
      // walk starts at the PARENT: the image itself carries role="button" so
      // that it is keyboard-operable, and `closest` matches the element it is
      // called on — checking the image would reject every image on the page.
      if (isInsideControl(img)) return;

      const scope = img.closest("section") ?? document.body;
      const items = Array.from(scope.querySelectorAll("img[data-zoomable]")).filter(
        (el) => !isInsideControl(el)
      );
      const index = Math.max(0, items.indexOf(img));

      event.preventDefault();
      lastFocused.current = img;
      setState({
        items: items.map((el) => ({
          // `src`, not `currentSrc`: the thumbnail may have loaded a 640px
          // derivative, and "open the image" should show the full one rather
          // than blow a small file up.
          src: el.getAttribute("src") || el.currentSrc,
          alt: el.alt || "",
          // The width/height ATTRIBUTES carry the real intrinsic size (they
          // come from the image manifest). `naturalWidth` would describe
          // whichever derivative the browser happened to pick, so the opened
          // image would be sized from the thumbnail it came from.
          ratio: intrinsicRatio(el),
          el,
        })),
        index,
        source: img.getBoundingClientRect(),
        origin: { x: event.clientX, y: event.clientY },
      });
      setPulse((n) => n + 1);

      // The world reacts to the same press — the field pulses, and the cue
      // plays if the visitor has opted into sound.
      experience.getState().setShock(1);
      sfxTheme("short");
    };

    // Keyboard parity: the images carry role="button" + tabIndex, so Enter and
    // Space must do what a click does.
    const onKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const img = event.target?.closest?.("img[data-zoomable]");
      if (!img) return;
      event.preventDefault();
      const rect = img.getBoundingClientRect();
      img.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        })
      );
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const close = useCallback(() => setState(null), []);

  const step = useCallback((delta) => {
    setState((current) => {
      if (!current || current.items.length < 2) return current;
      const next = (current.index + delta + current.items.length) % current.items.length;
      // Re-source from the thumbnail we are moving TO, so closing returns the
      // image to wherever it actually lives on the page.
      const el = current.items[next].el;
      return {
        ...current,
        index: next,
        source: el?.isConnected ? el.getBoundingClientRect() : current.source,
      };
    });
    setPulse((n) => n + 1);
  }, []);

  /* ── While open: escape, arrows, focus trap ── */
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== "Tab") return;

      // Trap: the dialog is modal, so Tab must not wander back into the page.
      const focusables = dialogRef.current?.querySelectorAll(
        "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    // Move focus in without stealing it mid-animation.
    const raf = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [open, close, step]);

  /* Restore focus to the thumbnail the visitor came from. */
  useEffect(() => {
    if (open) return undefined;
    const previous = lastFocused.current;
    lastFocused.current = null;
    if (previous?.isConnected) previous.focus?.({ preventScroll: true });
    return undefined;
  }, [open]);

  const item = state ? state.items[state.index] : null;
  const target = item ? targetRect(item.ratio, viewport.width, viewport.height) : null;
  const multiple = state ? state.items.length > 1 : false;

  return (
    <AnimatePresence>
      {open && item && target ? (
        <motion.div
          key="lightbox"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={item.alt || "Image viewer"}
          tabIndex={-1}
          className="fixed inset-0 z-[9600] outline-none"
          initial={{ opacity: reduce ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {/* Backdrop — irises open from the exact point that was clicked
              rather than fading uniformly, so the reveal has a source. */}
          <motion.button
            type="button"
            aria-label="Close image viewer"
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-zoom-out bg-[#05070b]/88 backdrop-blur-xl"
            initial={
              reduce
                ? { opacity: 0 }
                : { clipPath: `circle(0px at ${state.origin.x}px ${state.origin.y}px)` }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { clipPath: `circle(160% at ${state.origin.x}px ${state.origin.y}px)` }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : 0.72, ease: EASE }}
          />

          {/* The travelling image. */}
          <motion.div
            key={`frame-${pulse}`}
            className="pointer-events-none absolute"
            style={{
              left: target.left,
              top: target.top,
              width: target.width,
              height: target.height,
            }}
            initial={reduce ? { opacity: 0 } : flipFrom(state.source, target)}
            animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { ...flipFrom(state.source, target), opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : 0.62, ease: EASE }}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="h-full w-full rounded-lg object-contain shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)]"
              draggable={false}
            />

            {/* A single bright band sweeps the image once as it lands — the
                site's "this is a live render" language, borrowed. */}
            {reduce ? null : (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-1/3 rounded-lg"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(190,205,235,0.16), transparent)",
                  mixBlendMode: "screen",
                }}
                initial={{ top: "-34%", opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.16 }}
              />
            )}

            {/* Corner brackets draw in — the hero lens's crosshair grammar. */}
            {reduce
              ? null
              : [
                  "left-0 top-0 border-l-2 border-t-2",
                  "right-0 top-0 border-r-2 border-t-2",
                  "left-0 bottom-0 border-l-2 border-b-2",
                  "right-0 bottom-0 border-r-2 border-b-2",
                ].map((corner, index) => (
                  <motion.span
                    key={corner}
                    aria-hidden
                    className={`absolute h-7 w-7 border-[#aab4c4]/70 ${corner}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.42 + index * 0.05 }}
                  />
                ))}
          </motion.div>

          {/* Caption + counter. */}
          <motion.div
            key={`caption-${pulse}`}
            className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.4 }}
          >
            <p className="max-w-2xl rounded-full border border-white/10 bg-black/55 px-5 py-2.5 text-center text-xs leading-relaxed text-white/70 backdrop-blur-md">
              {multiple ? (
                <span className="mr-2 font-display text-[10px] tracking-[0.2em] text-[#aab4c4]">
                  {String(state.index + 1).padStart(2, "0")} /{" "}
                  {String(state.items.length).padStart(2, "0")}
                </span>
              ) : null}
              <span>{item.alt}</span>
            </p>
          </motion.div>

          {/* Controls. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close image viewer"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/50 text-lg text-white/70 backdrop-blur-md transition-colors hover:text-white"
          >
            ✕
          </button>

          {multiple ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/50 text-white/70 backdrop-blur-md transition-colors hover:text-white md:left-8"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/50 text-white/70 backdrop-blur-md transition-colors hover:text-white md:right-8"
              >
                →
              </button>
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
