// Master section index — drives the ChapterRail, ChapterIntro, ChapterBackdrop.
// Each entry has its own hue (within the cool silver-steel palette) so the
// background gradient shifts subtly as you scroll between sections.

export const sections = [
  { id: "hero",         num: "00", label: "Intro",      color: "#8a93a6", accent: "#aab4c4", hue: 218 },
  { id: "about",        num: "01", label: "About",      color: "#9aa4b6", accent: "#b8c1d0", hue: 216 },
  { id: "services",     num: "02", label: "Services",   color: "#a8b0c0", accent: "#c2cad7", hue: 212 },
  { id: "skills",       num: "03", label: "Skills",     color: "#aab8cc", accent: "#c8d2dd", hue: 210 },
  { id: "experience",   num: "04", label: "Journey",    color: "#a4b6c8", accent: "#c0cbd6", hue: 208 },
  { id: "process",      num: "05", label: "Process",    color: "#9ab0c4", accent: "#bccad6", hue: 205 },
  { id: "projects",     num: "06", label: "Projects",   color: "#90a8c0", accent: "#b4c4d6", hue: 205 },
  { id: "testimonials", num: "07", label: "Reviews",    color: "#9ab0c8", accent: "#bac8da", hue: 212 },
  { id: "socials",      num: "08", label: "Socials",    color: "#a8b8d0", accent: "#c4d0e0", hue: 220 },
  { id: "contact",      num: "09", label: "Contact",    color: "#b0c0d8", accent: "#ccd6e4", hue: 225 },
];
