// ============================================================
// CONTENT — single source of truth for the whole experience.
// Ported from the live portfolio; real Mohamed Negm data.
// ============================================================

export const profile = {
  name: "Mohamed Negm",
  firstName: "Mohamed",
  lastName: "Negm",
  role: "Creative Front-End Developer",
  roles: ["Front-End Developer", "React Specialist", "Motion Designer", "CS & AI Student"],
  tagline:
    "CS & AI student crafting fast, immersive web experiences with React, Three.js and cutting-edge motion design.",
  location: "Sadat City, Monufia, Egypt",
  email: "mohammednegm11234@gmail.com",
  phone: "+20 10 1227 9297",
  education: "B.Sc Computer Science & AI",
  year: "2nd Year",
  university: "Al-Ryada University (RST)",
  status: "Open to opportunities",
  resumeUrl: "/resume.pdf",
  socials: [
    { label: "GitHub", url: "https://github.com/negm-7-4" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/mohammed-e-negm-a45624335",
    },
    { label: "Facebook", url: "https://www.facebook.com/share/1HwyZgZLtQ/" },
    { label: "Instagram", url: "https://www.instagram.com/mohamednegm_74" },
  ],
} as const;

export const heroTags = ["React", "Next.js", "Framer Motion", "Three.js", "Tailwind CSS"] as const;

export const aboutCards = [
  { title: "Clean Code", desc: "Readable, maintainable code with a focus on structure, best practices and long-term scalability.", icon: "code" },
  { title: "Eye for Design", desc: "Every pixel and interaction matters — spacing, motion, contrast and emotional resonance.", icon: "design" },
  { title: "Fast Learner", desc: "Quick to adapt to new tools, frameworks and domains — from AI algorithms to 3D shaders.", icon: "bolt" },
  { title: "Problem Solver", desc: "Breaking down complex challenges into elegant, practical solutions through systematic thinking.", icon: "puzzle" },
] as const;

export const services = [
  { num: "01", title: "Web Development", desc: "Fast, accessible, responsive web apps with React and Next.js.", points: ["React / Next.js", "Responsive layouts", "Clean architecture"] },
  { num: "02", title: "UI / Motion Design", desc: "Interfaces that feel alive — micro-interactions, 3D transitions, scroll storytelling.", points: ["Framer Motion", "GSAP", "Three.js"] },
  { num: "03", title: "Landing Pages", desc: "Award-style landing pages with scroll storytelling, WebGL and conversion-focused polish.", points: ["Marketing sites", "Animations", "SEO basics"] },
  { num: "04", title: "Performance & Care", desc: "Optimising load time, smooth 60fps interactions and pixel-perfect details on every device.", points: ["Optimisation", "Best practices", "Maintenance"] },
] as const;

export const skillCategories = [
  {
    label: "Frontend",
    items: [
      { name: "React", color: "#61dafb" },
      { name: "JavaScript", color: "#f7df1e" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "Next.js", color: "#ffffff" },
      { name: "Tailwind CSS", color: "#38bdf8" },
      { name: "HTML & CSS", color: "#e34f26" },
    ],
  },
  {
    label: "Motion & 3D",
    items: [
      { name: "Framer Motion", color: "#bb44ff" },
      { name: "GSAP", color: "#88ce02" },
      { name: "Three.js", color: "#dddddd" },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js", color: "#3c873a" },
      { name: "Python", color: "#3572A5" },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Git", color: "#f05032" },
      { name: "GitHub", color: "#ffffff" },
      { name: "Figma", color: "#a259ff" },
    ],
  },
] as const;

export const experience = [
  { period: "2024 — Present", role: "Freelance Front-End Developer", company: "Self-employed", desc: "Delivering high-quality animated React experiences for clients — from product dashboards to award-style landing pages." },
  { period: "2024", role: "Nexora ERP — Lead Developer", company: "Academic Project · Al-Ryada University", desc: "Designed and built a complete full-stack ERP & accounting system from scratch — data modelling, React UI, financial modules and dashboard analytics." },
  { period: "2023 — 2024", role: "Networking Fundamentals", company: "Cisco · Academic Coursework", desc: "Studied TCP/IP, subnetting, routing protocols, network security and infrastructure design." },
  { period: "2023 — Present", role: "B.Sc Computer Science & AI", company: "Al-Ryada University (RST)", desc: "2nd year — specialising in AI algorithms, data structures, software engineering and full-stack development." },
] as const;

export type Project = {
  title: string;
  category: string;
  tagline: string;
  desc: string;
  tech: string[];
  color: string;
  github: string;
  live: string | null;
  status: string;
};

export const projects: Project[] = [
  {
    title: "Nexora ERP",
    category: "Full-Stack App",
    tagline: "Complete Accounting & ERP System",
    desc: "A comprehensive enterprise resource planning platform. Handles invoicing, inventory management, financial reporting and multi-user access — built for real businesses.",
    tech: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    color: "#8a93a6",
    github: "https://github.com/negm-7-4",
    live: null,
    status: "Completed",
  },
  {
    title: "Social Network Analyzer",
    category: "Data Visualisation",
    tagline: "Graph-Based Network Intelligence",
    desc: "Maps and visualises social network connections, identifies key influencers and detects community clusters using graph theory and network analysis algorithms.",
    tech: ["Python", "NetworkX", "React", "D3.js"],
    color: "#7e93a8",
    github: "https://github.com/negm-7-4",
    live: null,
    status: "Completed",
  },
  {
    title: "BASCALSCALAR",
    category: "Utility App",
    tagline: "Advanced Mathematical Computation",
    desc: "Scalar and matrix computation engine with expression parsing, complex mathematical operations and real-time visualisation of scalar transformations.",
    tech: ["React", "Math.js", "Canvas API", "Tailwind CSS"],
    color: "#a8978c",
    github: "https://github.com/negm-7-4",
    live: null,
    status: "Completed",
  },
  {
    title: "To Do List App",
    category: "Productivity",
    tagline: "Focus Without Friction",
    desc: "Feature-rich task manager with categories, priorities, due dates, drag-and-drop reordering and local persistence — designed for clarity and speed.",
    tech: ["React", "Framer Motion", "LocalStorage", "Tailwind CSS"],
    color: "#8fa394",
    github: "https://github.com/negm-7-4",
    live: null,
    status: "Completed",
  },
  {
    title: "Acoustic Room Mapper",
    category: "DSP / Signal Processing",
    tagline: "Real-Time Acoustic Floorplan Mapping",
    desc: "Builds 2D floorplans of lecture halls from real-time audio, achieving sub-meter precision through FFT cross-correlation at 48 kHz. Heatmap, wireframe & hybrid modes with bilingual RTL support.",
    tech: ["Flutter", "Python / Flask", "C++17 DSP", "FFT", "Material 3"],
    color: "#7ea8b8",
    github: "https://github.com/negm-7-4/Acoustic-Room-Mapper",
    live: null,
    status: "Production-Ready",
  },
];

export const processSteps = [
  { num: "01", title: "Discover", desc: "Deep dive into your vision, goals and audience. Strategy that drives every decision.", accent: "#8a93a6" },
  { num: "02", title: "Design", desc: "Wireframes become living prototypes. Every layout, spacing and colour choice is intentional.", accent: "#9aa4b6" },
  { num: "03", title: "Build", desc: "Clean, maintainable React code with buttery-smooth animations. Accessible, fast, pixel-perfect.", accent: "#b0baca" },
  { num: "04", title: "Launch", desc: "Deploy with confidence. Cross-device testing, performance tuning and ongoing care.", accent: "#c5cedb" },
] as const;

export const testimonials = [
  { quote: "Mohamed delivered a landing page that made our investors stop scrolling. The animations felt like nothing I'd seen from a freelancer before.", name: "Sarah K.", role: "Startup Founder", initials: "SK" },
  { quote: "Clean code, razor-sharp design instincts and always ahead of deadline. He understands both craft and UX.", name: "Ahmed R.", role: "Product Manager", initials: "AR" },
  { quote: "The 3D interactions he built for our product demo tripled our session duration. Rare to find someone at the intersection of code and art.", name: "Lena M.", role: "UX Lead", initials: "LM" },
] as const;

export const stats = [
  { value: 5, suffix: "+", label: "Shipped Projects" },
  { value: 3, suffix: "+", label: "Years Coding" },
  { value: 60, suffix: "fps", label: "Buttery Motion" },
  { value: 100, suffix: "%", label: "Passion" },
] as const;
