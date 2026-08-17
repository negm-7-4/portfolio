import { useMemo } from "react";
import { useLanguage } from "../store/language";
import ar from "./ar";
import { translate } from "./strings";
import * as en from "../data/content";

/**
 * ── Content resolution ────────────────────────────────────────────────
 * English content.js is the single source of structure. The Arabic file
 * supplies prose only, and is merged positionally on top of it.
 *
 * Merging (rather than keeping two full copies) means a project added to
 * content.js still appears in Arabic — untranslated, but present, with its
 * links, images and colours intact. The alternative, two parallel files,
 * fails silently the first time someone edits only one of them.
 */

/** Shallow-merge `overlay` onto `base`, ignoring undefined overlay values. */
function merge(base, overlay) {
  if (!overlay) return base;
  const out = { ...base };
  for (const k of Object.keys(overlay)) {
    if (overlay[k] !== undefined && overlay[k] !== null) out[k] = overlay[k];
  }
  return out;
}

/** Merge two arrays element-wise; extra base entries pass through untouched. */
function mergeList(base, overlay) {
  if (!overlay) return base;
  return base.map((item, i) => merge(item, overlay[i]));
}

const EN_UI = {
  nav: {
    home: "Home",
    about: "About",
    services: "Services",
    skills: "Skills",
    experience: "Experience",
    process: "Process",
    projects: "Projects",
    socials: "Socials",
    contact: "Contact",
  },
  cta: {
    viewWork: "View Work",
    hireMe: "Let's work together",
    downloadCv: "Download CV",
    viewCv: "View CV",
    liveSite: "Live Site",
    sourceCode: "Source",
    caseStudy: "Case Study",
    backToTop: "Back to top",
    send: "Send Message",
    sending: "Sending…",
    sent: "Got it — I'll reply shortly.",
    copy: "Copy",
    copied: "Copied",
    close: "Close",
    search: "Search",
    scroll: "Scroll",
    enter: "Enter",
    loading: "Loading",
    viewMyWork: "View My Work",
    getInTouch: "Get In Touch",
    pulseTheField: "Pulse the field",
  },
  form: {
    name: "Name",
    email: "Email",
    message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "email@example.com",
    messagePlaceholder: "Tell me about the project…",
    required: "This field is required",
    invalidEmail: "That email doesn't look right",
    error: "Something went wrong. Try again, or email me directly.",
  },
  labels: {
    availableForWork: "Available for new projects",
    available: "Available",
    forNewProjects: "For New Projects",
    hiThereIm: "Hi there, I'm",
    byTheNumbers: "By the numbers",
    everyFrameEarns: "Every frame earns its place",
    basedIn: "Based in",
    selectedWork: "Selected Work",
    getInTouch: "Get in touch",
    language: "Language",
    switchToArabic: "التبديل إلى العربية",
    switchToEnglish: "Switch to English",
    all: "All",
    viewMode: "View mode",
  },
  headings: {
    about: { eyebrow: "About Me", title: "Who", accent: "I Am" },
    services: { eyebrow: "Services", title: "What I", accent: "Do" },
    experience: { eyebrow: "Journey", title: "Experience &", accent: "Education" },
    process: { eyebrow: "Workflow", title: "My", accent: "Process" },
    projects: { eyebrow: "Selected Work", title: "Featured", accent: "Projects" },
    sams: { eyebrow: "Flagship case study", title: "Inside", accent: "SAMS" },
    socials: { eyebrow: "Connect", title: "Find Me", accent: "Online" },
    contact: { eyebrow: "Contact", title: "Let's", accent: "Talk" },
    skills: { eyebrow: "Skills", title: "The", accent: "Stack" },
  },
};

export function useContent() {
  const lang = useLanguage((s) => s.lang);

  return useMemo(() => {
    const rtl = lang === "ar";
    if (!rtl) {
      return {
        lang,
        rtl: false,
        t: EN_UI,
        tr: (x) => x,
        profile: en.profile,
        aboutCards: en.aboutCards,
        services: en.services,
        skillCategories: en.skillCategories,
        experience: en.experience,
        projects: en.projects,
        process: en.process,
        heroTags: en.heroTags,
        resume: en.resume,
        testimonials: en.testimonials,
      };
    }

    return {
      lang,
      rtl: true,
      t: ar.ui,
      tr: (x) => translate("ar", x),
      profile: merge(en.profile, ar.profile),
      aboutCards: mergeList(en.aboutCards, ar.aboutCards),
      services: mergeList(en.services, ar.services),
      skillCategories: mergeList(en.skillCategories, ar.skillCategories),
      experience: mergeList(en.experience, ar.experience),
      projects: mergeList(en.projects, ar.projects),
      process: mergeList(en.process, ar.process),
      // Framework names — never translated.
      heroTags: en.heroTags,
      // The CV modal mirrors the English PDF that is actually downloadable,
      // so it stays in English even in Arabic mode. Translating it would
      // describe a document that does not exist.
      resume: en.resume,
      testimonials: en.testimonials,
    };
  }, [lang]);
}

/** Direction-only consumers (canvas, transforms) don't need the whole payload. */
export function useDirection() {
  const lang = useLanguage((s) => s.lang);
  return lang === "ar" ? "rtl" : "ltr";
}
