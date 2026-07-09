import { useEffect, useRef } from "react";
import useDeviceProfile from "../../hooks/useDeviceProfile";
import { loadGsap } from "../../lib/gsapPlugins";

/**
 * A hand-drawn signature swash that literally draws itself with GSAP's
 * DrawSVGPlugin (now free) when it scrolls into view, then pops a small star
 * on the end stroke. The classic "expensive" line-draw beat.
 *
 * Fully self-contained and safe: if GSAP never arrives or the user prefers
 * reduced motion, the SVG simply renders fully drawn (its natural state) — no
 * dependency on the effect for the mark to read.
 */
export default function SignatureFlourish({ className = "" }) {
  const ref = useRef(null);
  const { reducedMotion } = useDeviceProfile();

  useEffect(() => {
    if (reducedMotion) return;
    let ctx;
    let canceled = false;

    (async () => {
      const { gsap } = await loadGsap();
      if (canceled || !ref.current) return;

      ctx = gsap.context(() => {
        // Set the pre-animation state here (not inline) so a failed GSAP load
        // leaves the flourish fully visible instead of hidden.
        gsap.set(".sig-draw", { drawSVG: "0%" });
        gsap.set(".sig-star", { opacity: 0, scale: 0, transformOrigin: "center" });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              toggleActions: "restart none restart none",
            },
          })
          .to(".sig-draw", {
            drawSVG: "100%",
            duration: 1.25,
            ease: "power2.inOut",
            stagger: 0.25,
          })
          .to(
            ".sig-star",
            { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.5)" },
            "-=0.35"
          )
          .fromTo(
            ".sig-star",
            { rotate: 0 },
            { rotate: 180, duration: 6, ease: "none", repeat: -1 },
            ">"
          );
      }, ref);
    })();

    return () => {
      canceled = true;
      ctx?.revert();
    };
  }, [reducedMotion]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 60"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* main calligraphic swash */}
      <path
        className="sig-draw"
        d="M8 40 C 58 14, 120 12, 166 30 C 196 42, 214 38, 232 22"
        stroke="url(#sigGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* crossing tail flourish */}
      <path
        className="sig-draw"
        d="M120 46 C 146 52, 176 50, 198 40"
        stroke="url(#sigGrad)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* terminal star that pops + slowly rotates */}
      <g className="sig-star" transform="translate(232 22)">
        <path
          d="M0 -6 L1.7 -1.7 L6 0 L1.7 1.7 L0 6 L-1.7 1.7 L-6 0 L-1.7 -1.7 Z"
          fill="#c8d2dd"
        />
      </g>
      <defs>
        <linearGradient id="sigGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6f7c8c" />
          <stop offset="55%" stopColor="#aab4c4" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
