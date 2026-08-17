import { create } from "zustand";

/**
 * ── The Language Store ────────────────────────────────────────────────
 * One flag, `lang`, and everything downstream reads from it: the content
 * overlay (`useContent`), the document direction, and the font stack.
 *
 * Direction lives on <html>, not on a wrapper div, because `dir` has to be
 * set on an ancestor of EVERY portal target. Modals, the lightbox and the
 * command palette all render into document.body, so a wrapper inside #root
 * would leave them stranded in LTR while the page around them flipped.
 *
 * The choice is written to localStorage synchronously on toggle and replayed
 * before first paint by the inline script in index.html, so an Arabic visitor
 * never sees a frame of English or a flash of the wrong direction.
 */

const KEY = "negm.lang";
const SUPPORTED = ["en", "ar"];

/** Read the persisted choice, else infer from the browser, else English. */
function initialLang() {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch {
    // Private mode / storage disabled — fall through to detection.
  }
  const nav = window.navigator?.language || "";
  return nav.toLowerCase().startsWith("ar") ? "ar" : "en";
}

/** Mirror the language onto <html> so CSS and assistive tech both see it. */
export function applyLangToDocument(lang) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === "ar" ? "rtl" : "ltr";
}

export const useLanguage = create((set, get) => ({
  lang: initialLang(),

  setLang: (lang) => {
    if (!SUPPORTED.includes(lang) || lang === get().lang) return;
    try {
      window.localStorage.setItem(KEY, lang);
    } catch {
      // Not fatal — the toggle still works for this session.
    }
    applyLangToDocument(lang);
    set({ lang });
  },

  toggle: () => get().setLang(get().lang === "ar" ? "en" : "ar"),
}));

export const isRTL = (lang) => lang === "ar";
