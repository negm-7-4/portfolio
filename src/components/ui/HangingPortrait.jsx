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

    // physics state (angle in radians, 0 = straight down).
    // Start lifted to one side so that — the first time it scrolls into view —
    // it "drops" and swings, as if it had been held up and released.
    const s = { angle: 0.92, vel: 0, dragging: false, lastAngle: 0.92, lastT: 0, dropped: false };
    const K = 0.013;     // gravity restoring strength → ~0.9s period
    const DAMP = 0.994;  // air resistance (longer, lazier swing)
    const MAX = 1.2;     // ~69° swing clamp

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
      {/* mounting beam — reads as a bracket fixed to the top of the wall */}
      <div className="relative mx-auto mb-1 h-[10px] w-[78%] rounded-full bg-gradient-to-b from-[#2a2f3a] to-[#11141b] shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]">
        <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-[#8a93a6] shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
      </div>

      {/* swing arena — generous so the frame never clips while swinging */}
      <div ref={containerRef} className="relative mx-auto h-[540px] w-full" style={{ overflow: "visible" }}>
        {/* the nail / mount anchor (pivot point) */}
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <span className="block h-2.5 w-2.5 rounded-full bg-[#c8b48c] shadow-[0_0_8px_rgba(200,180,140,0.5)]" />
        </div>

        {/* rotating arm = rope + frame, pivots at the nail (top centre) */}
        <div
          ref={armRef}
          className="absolute left-1/2 top-[4px] flex -translate-x-1/2 flex-col items-center will-change-transform"
          style={{ transformOrigin: "50% 0%" }}
        >
          {/* rope — longer, thicker twin braided strands meeting at a ring */}
          <div className="relative h-[170px] w-14">
            <span className="absolute left-1/2 top-0 h-[150px] w-[5px] origin-top -translate-x-1/2 rotate-[7deg] rounded-full bg-gradient-to-b from-[#cdb488] via-[#a98f63] to-[#766343] shadow-[0_0_4px_rgba(0,0,0,0.4)]" />
            <span className="absolute left-1/2 top-0 h-[150px] w-[5px] origin-top -translate-x-1/2 -rotate-[7deg] rounded-full bg-gradient-to-b from-[#cdb488] via-[#a98f63] to-[#766343] shadow-[0_0_4px_rgba(0,0,0,0.4)]" />
            {/* braided highlight */}
            <span className="absolute left-1/2 top-2 h-[140px] w-[1.5px] -translate-x-1/2 rounded-full bg-white/20" />
            {/* hanging ring */}
            <span className="absolute bottom-[6px] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-[#c8b48c] shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
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
