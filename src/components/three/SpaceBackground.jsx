import { useMemo } from "react";

/**
 * Lightweight CSS starfield — NO WebGL. (The old version ran a second
 * three.js canvas alongside Spline, which was the main cause of lag.)
 * Three parallax layers of box-shadow dots that drift slowly via a
 * transform-only animation, so it's basically free for the GPU.
 */
function makeStars(count, size) {
  let shadow = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadow.push(`${x}px ${y}px rgba(255,255,255,${0.35 + Math.random() * 0.5})`);
  }
  return { boxShadow: shadow.join(","), width: size, height: size };
}

export default function SpaceBackground() {
  const layers = useMemo(
    () => [
      { ...makeStars(260, "1px"), dur: "120s" },
      { ...makeStars(110, "2px"), dur: "200s" },
      { ...makeStars(45, "3px"), dur: "300s" },
    ],
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {layers.map((l, i) => (
        <div
          key={i}
          className="absolute left-0 top-0 rounded-full bg-white star-drift"
          style={{
            width: l.width,
            height: l.height,
            boxShadow: l.boxShadow,
            animationDuration: l.dur,
          }}
        />
      ))}
    </div>
  );
}
