// Master section index — drives the ChapterRail, ChapterIntro, ChapterBackdrop.
// A cinematic colour journey: each chapter owns a distinct jewel hue that the
// background gradient, chapter rail and cursor tint pick up, so scrolling feels
// like moving through different lighting states of one connected 3D world.

export const sections = [
  { id: "hero",         num: "00", label: "Intro",      color: "#6c7bff", accent: "#9fb0ff", hue: 232 },
  { id: "about",        num: "01", label: "About",      color: "#8a6cff", accent: "#b39cff", hue: 256 },
  { id: "services",     num: "02", label: "Services",   color: "#5b8dff", accent: "#9cc0ff", hue: 218 },
  { id: "skills",       num: "03", label: "Skills",     color: "#33c9d6", accent: "#8ce8f0", hue: 187 },
  { id: "experience",   num: "04", label: "Journey",    color: "#4fb3e8", accent: "#a0d8f5", hue: 202 },
  { id: "process",      num: "05", label: "Process",    color: "#9a7bff", accent: "#c3b0ff", hue: 256 },
  { id: "projects",     num: "06", label: "Projects",   color: "#ff8a5b", accent: "#ffb89a", hue: 18  },
  { id: "testimonials", num: "07", label: "Reviews",    color: "#ff6f9c", accent: "#ffaac6", hue: 338 },
  { id: "socials",      num: "08", label: "Socials",    color: "#6db0ff", accent: "#a9d2ff", hue: 210 },
  { id: "contact",      num: "09", label: "Contact",    color: "#3fd6c2", accent: "#92ecdd", hue: 168 },
];
