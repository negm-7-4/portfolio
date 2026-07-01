import { useEffect, useRef } from "react";

/**
 * PreloaderAtmosphere — a cheap 2D-canvas drift of luminous dust behind the
 * loader, so the loading screen reads as the FIRST beat of the world rather
 * than a holding screen. Deliberately DOM-only (no three) so it never pulls
 * the heavy WebGL bundle into the eager path — the loader must paint instantly.
 * Honours reduced-motion (draws one static frame, no loop).
 */
export default function PreloaderAtmosphere() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rnd = (a, b) => a + Math.random() * (b - a);

    let w = 0;
    let h = 0;
    let raf = 0;
    let disposed = false;

    const N = 90;
    const P = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: rnd(0.2, 1), // depth → size, brightness, parallax speed
      s: rnd(0.4, 1.7),
      tw: Math.random() * Math.PI * 2,
      sp: rnd(0.0003, 0.0012),
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const paint = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of P) {
        if (!reduce) {
          p.y -= p.sp * (0.5 + p.z); // slow upward drift, parallaxed by depth
          if (p.y < -0.04) {
            p.y = 1.04;
            p.x = Math.random();
          }
        }
        const tw = 0.5 + 0.5 * Math.sin(t * 0.001 + p.tw);
        const x = p.x * w;
        const y = p.y * h;
        const r = p.s * p.z * (0.8 + tw * 0.6);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.shadowBlur = 8 * p.z;
        ctx.shadowColor = "rgba(170,180,196,0.5)";
        ctx.fillStyle = `rgba(196,205,220,${0.05 + p.z * 0.2 * tw})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (!disposed && !reduce) raf = requestAnimationFrame(paint);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(paint);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.75 }}
    />
  );
}
