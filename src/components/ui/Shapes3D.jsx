import { memo } from "react";

/**
 * Decorative, GPU-cheap 3D wireframe sculptures built purely from CSS 3D
 * transforms — zero JS render loop, zero extra bundle weight. Used as ambient
 * floating depth objects across sections so the page reads as a connected 3D
 * space rather than flat cards. All honour prefers-reduced-motion (spin off).
 */

function Face({ t, color }) {
  return (
    <span
      className="absolute inset-0"
      style={{
        transform: t,
        border: `1px solid ${color}`,
        background: "linear-gradient(135deg, rgba(180,196,220,0.05), transparent 70%)",
        backfaceVisibility: "visible",
      }}
    />
  );
}

/* A tumbling wireframe cube */
export const WireCube = memo(function WireCube({ size = 120, dur = 30, color = "rgba(180,196,220,0.42)", className = "" }) {
  const h = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(270deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ perspective: 700 }} aria-hidden>
      <div className="spin3d-anim relative" style={{ width: size, height: size, transformStyle: "preserve-3d", animationDuration: `${dur}s` }}>
        {faces.map((t, i) => <Face key={i} t={t} color={color} />)}
      </div>
    </div>
  );
});

/* A gyroscope — three intersecting wireframe rings */
export const Gyro = memo(function Gyro({ size = 150, dur = 34, color = "rgba(180,196,220,0.4)", className = "" }) {
  const rings = [
    "rotateX(0deg) rotateY(0deg)",
    "rotateX(60deg) rotateY(20deg)",
    "rotateX(-55deg) rotateY(-30deg)",
    "rotateY(70deg)",
  ];
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ perspective: 800 }} aria-hidden>
      <div className="spin3d-anim relative" style={{ width: size, height: size, transformStyle: "preserve-3d", animationDuration: `${dur}s` }}>
        {rings.map((t, i) => (
          <span key={i} className="absolute inset-0 rounded-full" style={{ border: `1px solid ${color}`, transform: t }} />
        ))}
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "rgba(200,212,228,0.8)", boxShadow: "0 0 12px rgba(180,196,220,0.8)" }} />
      </div>
    </div>
  );
});

/* An octahedron-ish diamond from two square pyramids (4 triangular planes) */
export const Diamond = memo(function Diamond({ size = 110, dur = 26, color = "rgba(180,196,220,0.45)", className = "" }) {
  const h = size / 2;
  const planes = [0, 90, 180, 270];
  return (
    <div className={`pointer-events-none select-none ${className}`} style={{ perspective: 700 }} aria-hidden>
      <div className="spin3d-anim relative" style={{ width: size, height: size, transformStyle: "preserve-3d", animationDuration: `${dur}s` }}>
        {planes.map((r, i) => (
          <span
            key={`t${i}`}
            className="absolute"
            style={{
              left: "50%", top: 0, width: 0, height: 0,
              borderLeft: `${h}px solid transparent`,
              borderRight: `${h}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
              transform: `translateX(-50%) rotateY(${r}deg) rotateX(28deg)`,
              transformOrigin: "50% 0%",
              opacity: 0.5,
              mixBlendMode: "screen",
            }}
          />
        ))}
      </div>
    </div>
  );
});
