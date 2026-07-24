import { useEffect, useRef } from "react";
import useDeviceProfile from "../../hooks/useDeviceProfile";
import { loadScrollSync } from "../../lib/scrollSync";

/**
 * MANIFESTO — the pinned, scrubbed statement beat.
 *
 * A 260vh corridor with a sticky full-screen stage inside. A GSAP
 * ScrollTrigger timeline (scrubbed, synced to Lenis via scrollSync) lights
 * the statement up word by word as you travel through — the one place on
 * the site where scrolling *is* the animation, frame by frame.
 *
 * Sticky positioning does the pinning (proven pattern here — same as the
 * capabilities gallery) so ScrollTrigger only drives the timeline, never
 * the layout. Low tier / reduced motion get the statement as a calm,
 * fully-visible interlude with no pin and no GSAP download.
 */

const LINES = [
  { text: "Motion is not decoration.", cls: "text-white" },
  { text: "It's how a story breathes.", cls: "text-gradient italic font-light" },
  { text: "I build the web that moves you.", cls: "text-white" },
];

export default function Manifesto() {
  const wrapRef = useRef(null);
  const { tier, reducedMotion } = useDeviceProfile();
  const still = reducedMotion || tier === "low";

  useEffect(() => {
    if (still) return;
    let ctx;
    let canceled = false;
    (async () => {
      const { gsap } = await loadScrollSync();
      if (canceled || !wrapRef.current) return;

      ctx = gsap.context(() => {
        // Initial state is set here (not inline) so if GSAP ever fails to
        // arrive the statement simply stays fully visible.
        gsap.set(".mf-word", { opacity: 0.08, filter: "blur(7px)", y: 26 });
        gsap.set(".mf-sig", { opacity: 0, y: 16 });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.55,
            },
          })
          .to(".mf-word", {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1.6,
            stagger: 0.5,
          })
          .to(".mf-sig", { opacity: 1, y: 0, duration: 1.4 }, ">-0.3");
      }, wrapRef);
    })();
    return () => {
      canceled = true;
      ctx?.revert();
    };
  }, [still]);

  return (
    <div
      id="manifesto"
      ref={wrapRef}
      className="relative"
      style={{ height: still ? "auto" : "260vh" }}
    >
      <div
        className={
          still
            ? "flex flex-col justify-center py-32 md:py-44"
            : "sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
        }
      >
        <div className="mx-auto w-[90%] max-w-6xl">
          {/* lead-in — same grammar as the other chapters */}
          <div className="mb-10 flex items-center gap-4">
            <span className="font-display text-[12px] font-semibold tracking-[0.3em] text-white/65">
              ( ✦ )
            </span>
            <span className="h-px w-14 bg-gradient-to-r from-white/40 to-transparent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
              Manifesto
            </span>
          </div>

          {/* the statement — lit word by word by the scrub */}
          <h2
            className="font-display font-bold leading-[1.06] tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 5.6vw, 5.2rem)" }}
          >
            {LINES.map((line, li) => (
              <span key={li} className={`block ${line.cls}`}>
                {line.text.split(" ").map((word, wi) => (
                  <span
                    key={wi}
                    className="mf-word inline-block"
                    style={{ marginRight: "0.26em", willChange: "transform, filter" }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            ))}
          </h2>

          {/* closing signature — lands after the final word */}
          <div className="mf-sig mt-12 flex items-center gap-4">
            <span className="block h-px w-16 bg-gradient-to-r from-[#aab4c4] to-transparent" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-white/60">
              Every frame earns its place
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
