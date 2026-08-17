import { motion } from "motion/react";
import { useLanguage } from "../../store/language";

/**
 * ── Language toggle ───────────────────────────────────────────────────
 * A two-state segmented control rather than a single "AR/EN" button: the
 * visitor can see which language is active without having to work out
 * whether the label names the current state or the action it performs.
 *
 * Each label is set in its own script — "EN" stays Latin, "ع" is Arabic —
 * so it reads correctly whichever direction the page is running in, and
 * needs no translation itself.
 */
export default function LanguageToggle({ className = "" }) {
  const lang = useLanguage((s) => s.lang);
  const setLang = useLanguage((s) => s.setLang);

  const options = [
    { code: "en", label: "EN", aria: "Switch to English" },
    { code: "ar", label: "ع", aria: "التبديل إلى العربية" },
  ];

  return (
    <div
      role="group"
      aria-label="Language / اللغة"
      // `dir=ltr` pins EN on the left in BOTH directions. Letting the group
      // mirror in RTL made the control appear to change meaning on toggle —
      // the highlight stayed put while the labels swapped underneath it.
      dir="ltr"
      // h-12 on touch, not h-11: the 2px of padding on each side would
      // otherwise leave the actual buttons at 40px, under the 44px minimum.
      className={`relative flex h-12 items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5 md:h-8 ${className}`}
    >
      {options.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            aria-label={o.aria}
            aria-pressed={active}
            data-cursor="hover"
            className={`relative flex h-11 min-w-11 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide transition-colors md:h-7 md:min-w-7 ${
              active ? "text-[#0b0d11]" : "text-white/60 hover:text-white/90"
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-white/90"
              />
            )}
            <span
              className="relative z-10"
              // The Arabic glyph needs the Arabic face to render properly at
              // this size; the Latin one must not inherit it.
              style={o.code === "ar" ? { fontFamily: "var(--font-arabic)" } : undefined}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
