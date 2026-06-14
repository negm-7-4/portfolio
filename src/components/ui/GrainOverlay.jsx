/**
 * Film-grain overlay for a premium cinematic finish. Uses an inline
 * SVG noise pattern (no extra request) blended via difference for
 * subtle texture without affecting colour balance.
 */
export default function GrainOverlay({ opacity = 0.045 }) {
  const noiseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)"/>
    </svg>
  `;
  const dataUri = `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[3] mix-blend-overlay"
      style={{
        backgroundImage: dataUri,
        backgroundSize: "160px 160px",
        opacity,
      }}
    />
  );
}
