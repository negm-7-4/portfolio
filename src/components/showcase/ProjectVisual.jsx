/**
 * Project artwork with a designed fallback: when a project has no
 * screenshot yet, render its monogram over a brand-tinted gradient so the
 * slot still feels intentional (same treatment the classic gallery used).
 */
export default function ProjectVisual({ project, className = "", imgClassName = "" }) {
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={`${project.title} — ${project.tagline}`}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover object-top ${imgClassName}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${project.color}26 0%, rgba(10,12,16,0.6) 100%)`,
      }}
    >
      <div className="text-center">
        <p
          className="font-display text-6xl font-bold tracking-tight md:text-7xl"
          style={{ color: `${project.color}66` }}
        >
          {project.title.split(" ").map((w) => w[0]).join("")}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/35">
          preview · soon
        </p>
      </div>
    </div>
  );
}
