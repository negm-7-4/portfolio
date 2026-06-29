import { useEffect, useRef } from "react";

/**
 * HangingPortrait — a framed photo suspended from a nail by a rope, simulated
 * as a rigid-rod pendulum. Grab the frame with the pointer and drag it: on
 * release it swings and settles with real gravity + damping, like a picture
 * knocked on a wall. Honors prefers-reduced-motion (hangs straight, static).
 *
 * The whole rope+frame assembly is one element rotated about its top-centre
 * (the nail), which is exactly how a rigid pendulum behaves.
 */
export default function HangingPortrait({ src = "/portrait-najm.jpg", alt = "Mohamed Negm — نجم" }) {
  const containerRef = useRef(null);
  const armRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const arm = armRef.current;
    const container = containerRef.current;
    const frame = frameRef.current;
    if (!arm || !container || !frame) return;

    if (reduce) { arm.style.transform = "rotate(0rad)"; return; }

    // physics state (angle in radians, 0 = straight down)
    const s = { angle: 0.14, vel: 0, dragging: false, lastAngle: 0.14, lastT: 0 };
    const K = 0.015;     // gravity restoring strength → ~0.85s period
    const DAMP = 0.992;  // air resistance
    const MAX = 1.15;    // ~66° swing clamp

    const pivot = () => {
      const r = container.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + 6 };
    };
    // angle of the pointer measured from straight-down at the pivot
    const angleOf = (cx, cy) => {
      const p = pivot();
      return Math.atan2(cx - p.x, Math.max(8, cy - p.y));
    };

    const onMove = (e) => {
      const a = Math.max(-MAX, Math.min(MAX, angleOf(e.clientX, e.clientY)));
      const now = performance.now();
      const dt = Math.max(8, now - s.lastT);
      s.vel = Math.max(-0.14, Math.min(0.14, ((a - s.lastAngle) / dt) * 16));
      s.lastAngle = a;
      s.lastT = now;
      s.angle = a;
    };
    const onUp = () => {
      s.dragging = false;
      frame.style.cursor = "grab";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    const onDown = (e) => {
      e.preventDefault();
      s.dragging = true;
      s.vel = 0;
      const a = angleOf(e.clientX, e.clientY);
      s.angle = s.lastAngle = a;
      s.lastT = performance.now();
      frame.style.cursor = "grabbing";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
    frame.addEventListener("pointerdown", onDown);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
    io.observe(container);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible && !s.dragging) return;
      if (!s.dragging) {
        s.vel += -K * Math.sin(s.angle);
        s.vel *= DAMP;
        s.angle += s.vel;
      }
      arm.style.transform = `rotate(${s.angle}rad)`;
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      frame.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[340px] select-none" style={{ touchAction: "none" }}>
      {/* swing arena — generous so the frame never clips while swinging */}
      <div ref={containerRef} className="relative mx-auto h-[440px] w-full" style={{ overflow: "visible" }}>
        {/* the nail / mount */}
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <span className="block h-3 w-3 rounded-full bg-gradient-to-br from-white to-[#8a93a6] shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
          <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40" />
        </div>

        {/* rotating arm = rope + frame, pivots at the nail (top centre) */}
        <div
          ref={armRef}
          className="absolute left-1/2 top-[6px] flex -translate-x-1/2 flex-col items-center will-change-transform"
          style={{ transformOrigin: "50% 0%" }}
        >
          {/* rope — twin strands meeting at a ring */}
          <div className="relative h-[78px] w-10">
            <span className="absolute left-1/2 top-0 h-[58px] w-[3px] origin-top -translate-x-1/2 rotate-[10deg] rounded-full bg-gradient-to-b from-[#b9a07a] to-[#7d6a4a]" />
            <span className="absolute left-1/2 top-0 h-[58px] w-[3px] origin-top -translate-x-1/2 -rotate-[10deg] rounded-full bg-gradient-to-b from-[#b9a07a] to-[#7d6a4a]" />
            {/* hanging ring */}
            <span className="absolute bottom-[12px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-[2.5px] border-[#c8b48c]" />
          </div>

          {/* the framed photo (grab target) */}
          <div
            ref={frameRef}
            data-cursor="hover"
            data-cursor-text="Pull me"
            className="group relative h-[300px] w-[230px] cursor-grab rounded-[14px] p-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
            style={{
              background: "linear-gradient(145deg,#d9c39a,#9c8559 45%,#c8b083)",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.25)",
            }}
          >
            {/* inner mat + photo */}
            <div className="relative h-full w-full overflow-hidden rounded-[7px] bg-black ring-1 ring-black/40">
              <img
                src={src}
                alt={alt}
                width="460"
                height="600"
                draggable="false"
                loading="lazy"
                decoding="async"
                className="pointer-events-none h-full w-full object-cover"
              />
              {/* glass light sweep */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {/* bilingual name plate */}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8">
                <span className="font-display text-sm font-semibold tracking-tight text-white">Mohamed Negm</span>
                <span dir="rtl" lang="ar" className="font-display text-sm font-bold text-[#e7d6b0]">نجم</span>
              </span>
            </div>

            {/* corner screws */}
            {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((pos) => (
              <span key={pos} className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-[#6f5d3d] shadow-inner`} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.32em] text-white/30">
        Drag the frame ✦ let it swing
      </p>
    </div>
  );
}
