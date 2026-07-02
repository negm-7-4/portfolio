// Central content — edit here to update the whole site.

export const profile = {
  name:       "Mohamed Negm",
  firstName:  "Mohamed",
  lastName:   "Negm",
  role:       "Front-End Developer",
  tagline:
    "CS & AI student crafting fast, immersive web experiences with React, Three.js and cutting-edge motion design.",
  location:   "Sadat City, Monufia, Egypt",
  email:      "mohammednegm11234@gmail.com",
  phone:      "+20 10 1227 9297",
  education:  "B.Sc Computer Science & AI",
  year:       "2nd Year",
  university: "Al-Ryada University (RST)",
  status:     "Open to opportunities",
  resumeUrl:  "/resume.pdf",
  socials: [
    { label: "GitHub",    url: "https://github.com/negm-7-4" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/mohammed-e-negm-a45624335?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    },
    { label: "Facebook",  url: "https://www.facebook.com/share/1HwyZgZLtQ/" },
    { label: "Instagram", url: "https://www.instagram.com/mohamednegm_74?igsh=N2hodW1zcGtuOHk4" },
  ],
};

export const heroTags = ["React", "Next.js", "Framer Motion", "Three.js", "Tailwind CSS"];

export const aboutCards = [
  {
    title: "Clean Code",
    desc: "Readable, maintainable code with a focus on structure, best practices and long-term scalability.",
    icon: "code",
  },
  {
    title: "Eye for Design",
    desc: "Every pixel and interaction matters — spacing, motion, contrast and emotional resonance.",
    icon: "design",
  },
  {
    title: "Fast Learner",
    desc: "Quick to adapt to new tools, frameworks and domains — from AI algorithms to 3D shaders.",
    icon: "bolt",
  },
  {
    title: "Problem Solver",
    desc: "Breaking down complex challenges into elegant, practical solutions through systematic thinking.",
    icon: "puzzle",
  },
];

export const services = [
  {
    num: "01",
    title: "Web Development",
    desc: "Building fast, accessible and responsive websites & web apps with React and Next.js.",
    points: ["React / Next.js", "Responsive layouts", "Clean architecture"],
  },
  {
    num: "02",
    title: "UI / Motion Design",
    desc: "Designing interfaces that feel alive — micro-interactions, 3D transitions and scroll storytelling.",
    points: ["Framer Motion", "GSAP", "Three.js"],
  },
  {
    num: "03",
    title: "Landing Pages",
    desc: "Award-style landing pages with scroll storytelling, WebGL and conversion-focused polish.",
    points: ["Marketing sites", "Animations", "SEO basics"],
  },
  {
    num: "04",
    title: "Performance & Care",
    desc: "Optimising load time, smooth 60fps interactions and pixel-perfect details on every device.",
    points: ["Optimisation", "Best practices", "Maintenance"],
  },
];

// Categorised toolkit — used by the big Skills layout.
export const skillCategories = [
  {
    label: "Frontend",
    items: [
      { name: "React",        icon: "react",      color: "#61dafb" },
      { name: "JavaScript",   icon: "javascript", color: "#f7df1e" },
      { name: "TypeScript",   icon: "typescript", color: "#3178c6" },
      { name: "Next.js",      icon: "nextjs",     color: "#ffffff" },
      { name: "Tailwind CSS", icon: "tailwind",   color: "#38bdf8" },
      { name: "HTML & CSS",   icon: "html",       color: "#e34f26" },
      { name: "Vite",         icon: "vite",       color: "#646cff" },
    ],
  },
  {
    // Animation & transition libraries — the toolkit behind award-style,
    // motion-heavy landing pages and product-marketing sites.
    label: "Animation & Motion",
    items: [
      { name: "Framer Motion", icon: "framer",      color: "#bb44ff" },
      { name: "GSAP",          icon: "gsap",        color: "#88ce02" },
      { name: "Motion One",    icon: "motionone",   color: "#ffb800" },
      { name: "Anime.js",      icon: "anime",       color: "#f43e5c" },
      { name: "Lottie",        icon: "lottie",      color: "#00ddb3" },
      { name: "Rive",          icon: "rive",        color: "#ff5447" },
      { name: "React Spring",  icon: "spring",      color: "#ff6d6d" },
      { name: "Theatre.js",    icon: "theatre",     color: "#8b5cf6" },
      { name: "AOS",           icon: "aos",         color: "#5b8def" },
      { name: "Auto-Animate",  icon: "autoanimate", color: "#a78bfa" },
    ],
  },
  {
    // 3D / WebGL — the engines behind immersive 3D websites.
    label: "3D & WebGL",
    items: [
      { name: "Three.js",            icon: "three",   color: "#dddddd" },
      { name: "React Three Fiber",   icon: "r3f",     color: "#ffffff" },
      { name: "Drei",                icon: "drei",    color: "#ffce3a" },
      { name: "WebGPU / TSL",        icon: "webgpu",  color: "#1a73e8" },
      { name: "Spline",              icon: "spline",  color: "#e879f9" },
      { name: "Babylon.js",          icon: "babylon", color: "#bb464b" },
    ],
  },
  {
    // 2D rendering / canvas engines for motion graphics & interactive art.
    label: "2D & Canvas",
    items: [
      { name: "PixiJS",       icon: "pixi",        color: "#ff43a0" },
      { name: "Two.js",       icon: "twojs",       color: "#c0c0c0" },
      { name: "Konva",        icon: "konva",       color: "#0d83cd" },
      { name: "Fabric.js",    icon: "fabric",      color: "#ff9f1c" },
      { name: "Matter.js",    icon: "matter",      color: "#4caf50" },
      { name: "tsParticles",  icon: "tsparticles", color: "#2a9df4" },
      { name: "p5.js",        icon: "p5",          color: "#ed225d" },
    ],
  },
  {
    // Scroll-driven motion & page transitions — smooth scroll, pinned
    // scenes, scroll-triggered video and seamless route transitions.
    label: "Scroll & Transitions",
    items: [
      { name: "Lenis",             icon: "lenis",         color: "#c0f000" },
      { name: "Locomotive Scroll", icon: "locomotive",    color: "#b6ff00" },
      { name: "ScrollTrigger",     icon: "scrolltrigger", color: "#88ce02" },
      { name: "Scrollama",         icon: "scrollama",     color: "#20c997" },
      { name: "Barba.js",          icon: "barba",         color: "#ff8c42" },
      { name: "Swiper",            icon: "swiper",        color: "#0080ff" },
    ],
  },
  {
    // Data visualisation & charts — for dashboards and product analytics.
    label: "Charts & Data Viz",
    items: [
      { name: "D3.js",      icon: "d3",       color: "#f9a03c" },
      { name: "Chart.js",   icon: "chartjs",  color: "#ff6384" },
      { name: "Recharts",   icon: "recharts", color: "#22b5bf" },
      { name: "visx",       icon: "visx",     color: "#ff1231" },
      { name: "Nivo",       icon: "nivo",     color: "#e8584c" },
      { name: "ECharts",    icon: "echarts",  color: "#c1232b" },
      { name: "ApexCharts", icon: "apex",     color: "#008ffb" },
      { name: "Tremor",     icon: "tremor",   color: "#3b82f6" },
      { name: "deck.gl",    icon: "deckgl",   color: "#00bcd4" },
    ],
  },
  {
    // Modern animated UI component libraries used on marketing/landing pages.
    label: "UI & Components",
    items: [
      { name: "shadcn/ui",    icon: "shadcn",     color: "#ffffff" },
      { name: "Aceternity UI", icon: "aceternity", color: "#a855f7" },
      { name: "Magic UI",     icon: "magicui",    color: "#ffffff" },
      { name: "Vanta.js",     icon: "vanta",      color: "#38bdf8" },
    ],
  },
  {
    // Immersive web — AR / VR / WebXR.
    label: "Immersive · XR",
    items: [
      { name: "A-Frame",      icon: "aframe",      color: "#ef2d5e" },
      { name: "WebXR",        icon: "webxr",       color: "#ff6b00" },
      { name: "model-viewer", icon: "modelviewer", color: "#4285f4" },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js", icon: "node",   color: "#3c873a" },
      { name: "Python",  icon: "python", color: "#3572A5" },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Git",    icon: "git",    color: "#f05032" },
      { name: "GitHub", icon: "github", color: "#ffffff" },
      { name: "Figma",  icon: "figma",  color: "#a259ff" },
    ],
  },
];

export const experience = [
  {
    period: "2024 — Present",
    role: "Freelance Front-End Developer",
    company: "Self-employed",
    desc: "Delivering high-quality animated React experiences for clients — from product dashboards to award-style landing pages.",
  },
  {
    period: "2024",
    role: "Nexora ERP — Lead Developer",
    company: "Academic Project · Al-Ryada University",
    desc: "Designed and built a complete full-stack ERP & accounting system from scratch — data modelling, React UI, financial modules and dashboard analytics.",
  },
  {
    period: "2023 — 2024",
    role: "Networking Fundamentals",
    company: "Cisco · Academic Coursework",
    desc: "Studied TCP/IP, subnetting, routing protocols, network security and infrastructure design as part of the CS & AI curriculum.",
  },
  {
    period: "2023 — Present",
    role: "B.Sc Computer Science & AI",
    company: "Al-Ryada University (RST)",
    desc: "2nd year — specialising in AI algorithms, data structures, software engineering and full-stack development.",
  },
];

export const projects = [
  {
    title:    "Nexora ERP",
    category: "Full-Stack App",
    tagline:  "Complete Accounting & ERP System",
    desc:     "A comprehensive enterprise resource planning platform. Handles invoicing, inventory management, financial reporting and multi-user access — built for real businesses.",
    tech:     ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    color:    "#8a93a6",
    github:   "https://github.com/negm-7-4",
    live:     null,
    image:    "/projects/nexora.jpg",
    status:   "Completed",
  },
  {
    title:    "Social Network Analyzer",
    category: "Data Visualisation",
    tagline:  "Graph-Based Network Intelligence",
    desc:     "Maps and visualises social network connections, identifies key influencers and detects community clusters using graph theory and network analysis algorithms.",
    tech:     ["Python", "NetworkX", "React", "D3.js"],
    color:    "#7e93a8",
    github:   "https://github.com/negm-7-4",
    live:     null,
    image:    "/projects/social.jpg",
    status:   "Completed",
  },
  {
    title:    "BASCALSCALAR",
    category: "Utility App",
    tagline:  "Advanced Mathematical Computation",
    desc:     "Scalar and matrix computation engine with expression parsing, complex mathematical operations and real-time visualisation of scalar transformations.",
    tech:     ["React", "Math.js", "Canvas API", "Tailwind CSS"],
    color:    "#a8978c",
    github:   "https://github.com/negm-7-4",
    live:     null,
    image:    "/projects/bascalscalar.png",
    status:   "Completed",
  },
  {
    title:    "To Do List App",
    category: "Productivity",
    tagline:  "Focus Without Friction",
    desc:     "Feature-rich task manager with categories, priorities, due dates, drag-and-drop reordering and local persistence — designed for clarity and speed.",
    tech:     ["React", "Framer Motion", "LocalStorage", "Tailwind CSS"],
    color:    "#8fa394",
    github:   "https://github.com/negm-7-4",
    live:     null,
    image:    "/projects/todo.jpg",
    status:   "Completed",
  },
  {
    title:    "Acoustic Room Mapper",
    category: "DSP / Signal Processing",
    tagline:  "Real-Time Acoustic Floorplan Mapping",
    desc:     "Professional acoustic analysis system that builds 2D floorplans of lecture halls and auditoriums from real-time audio, achieving sub-meter precision through FFT cross-correlation at 48 kHz. Heatmap, wireframe & hybrid visualisation modes with bilingual RTL support.",
    tech:     ["Flutter", "Python / Flask", "C++17 DSP", "FFT", "Material 3"],
    color:    "#7ea8b8",
    github:   "https://github.com/negm-7-4/Acoustic-Room-Mapper",
    live:     null,
    image:    null,
    status:   "Production-Ready",
  },
];

export const process = [
  {
    num:    "01",
    icon:   "search",
    title:  "Discover",
    desc:   "Deep dive into your vision, goals and audience. Understanding the why before the how — strategy that drives every decision.",
    accent: "#8a93a6",
  },
  {
    num:    "02",
    icon:   "pencil",
    title:  "Design",
    desc:   "Wireframes become living prototypes. Every layout, spacing and colour choice is intentional — beauty and function as one.",
    accent: "#9aa4b6",
  },
  {
    num:    "03",
    icon:   "code2",
    title:  "Build",
    desc:   "Clean, maintainable React code with buttery-smooth animations. Accessible, fast, pixel-perfect from day one.",
    accent: "#b0baca",
  },
  {
    num:    "04",
    icon:   "rocket",
    title:  "Launch",
    desc:   "Deploy with confidence. Cross-device testing, performance tuning and ongoing care so the product stays sharp.",
    accent: "#c5cedb",
  },
];

export const testimonials = [
  {
    quote:    "Mohamed delivered a landing page that made our investors stop scrolling. The animations felt like nothing I'd seen from a freelancer before.",
    name:     "Sarah K.",
    role:     "Startup Founder",
    initials: "SK",
    rating:   5,
  },
  {
    quote:    "Clean code, razor-sharp design instincts and always ahead of deadline. He's the rare developer who actually understands both craft and UX.",
    name:     "Ahmed R.",
    role:     "Product Manager",
    initials: "AR",
    rating:   5,
  },
  {
    quote:    "The 3D interactions he built for our product demo tripled our session duration. Rare to find someone who lives at the intersection of code and art.",
    name:     "Lena M.",
    role:     "UX Lead",
    initials: "LM",
    rating:   5,
  },
];
