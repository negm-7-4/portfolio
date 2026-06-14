import { useEffect, useRef } from "react";

/**
 * Lightweight canvas-based particle trail that emits from the cursor.
 * Particles fade + drift up + shrink. Tuned for performance — caps at
 * ~120 particles, 60fps; pauses when offscreen/idle.
 */
export default function CursorParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Skip on touch devices — no cursor to trail
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = [];
    let mx = -9999, my = -9999, lastMx = -9999, lastMy = -9999;
    let lastEmit = 0;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      const now = performance.now();
      const dx = mx - lastMx, dy = my - lastMy;
      const dist = Math.hypot(dx, dy);
      // emit proportional to speed, throttled by interval.
      // Capped at 60 particles + 2 per emit for lower fill-rate cost.
      if (now - lastEmit > 18 && dist > 2 && particles.length < 60) {
        const count = Math.min(2, Math.floor(dist / 6));
        for (let i = 0; i < count; i++) {
          const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.6;
          const speed = 0.4 + Math.random() * 1.4;
          particles.push({
            x: mx + (Math.random() - 0.5) * 6,
            y: my + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.6,
            life: 1,
            decay: 0.012 + Math.random() * 0.012,
            size: 1 + Math.random() * 2.2,
            hue: 210 + Math.random() * 20,
          });
        }
        lastEmit = now;
      }
      lastMx = mx; lastMy = my;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf;
    let running = true;
    let idleFrames = 0;            // count frames with no particles → skip work
    const tick = () => {
      if (particles.length === 0) {
        // No particles to draw — clear once, then skip until something happens
        if (idleFrames === 0) ctx.clearRect(0, 0, canvas.width, canvas.height);
        idleFrames = Math.min(idleFrames + 1, 60);
        if (running) raf = requestAnimationFrame(tick);
        return;
      }
      idleFrames = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012;
        p.vx *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        const a = p.life;
        const r = p.size * (0.6 + a * 0.6);
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
        grd.addColorStop(0, `hsla(${p.hue}, 30%, 88%, ${0.32 * a})`);
        grd.addColorStop(1, `hsla(${p.hue}, 30%, 88%, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${p.hue}, 35%, 96%, ${0.85 * a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      if (running) raf = requestAnimationFrame(tick);
    };

    // Pause completely when the tab is hidden
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
        // Drop any in-flight particles so we don't resume a stale state
        particles.length = 0;
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9997]"
      aria-hidden
    />
  );
}
