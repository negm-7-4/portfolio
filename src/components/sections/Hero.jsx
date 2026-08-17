import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";
import useDeviceProfile from "../../hooks/useDeviceProfile";
import useFadeGate from "../../hooks/useFadeGate";
import { experience } from "../../store/experience";
import MagneticButton from "../ui/MagneticButton";
import MagneticText from "../ui/MagneticText";
import { celebrate } from "../../lib/confetti";
import { goToSection } from "../../lib/navigation";
import { useContent } from "../../i18n/useContent";
import { EASE_OUT, EASE_BACK } from "../../lib/motion";
import { sfxTheme, isAudioEnabled } from "../../lib/ambientAudio";
import { toast } from "../../lib/toast";

// A spring with a hint of life used for the hero tag pills.
const TAG_SPRING = { type: "spring", stiffness: 200, damping: 15, mass: 0.7 };

const ROLES = ["Software Engineer", "Front-End Developer", "React Specialist", "Motion Designer"];

/* ─── The world answers the copy ───────────────────────────────────────
   Pressing a hero CTA is the site's loudest moment, so it lands on every
   layer at once: confetti in the DOM, a shockwave through the particle
   field, and the organ cue. Sound stays opt-in — the first press with
   audio muted says so once instead of playing something unrequested. */
let soundHintShown = false;

function heroImpact(weight = "full") {
  experience.getState().setShock(1);
  if (isAudioEnabled()) {
    sfxTheme(weight);
  } else if (!soundHintShown) {
    soundHintShown = true;
    toast("Sound is off — the speaker on the left turns the score on.", {
      icon: "♪",
      duration: 5200,
    });
  }
}

/* ─── Cycling typewriter for the role line ─── */
function TypewriterRole() {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing");
  const [idx, setIdx] = useState(0);
  const word = ROLES[idx];

  useEffect(() => {
    if (reduce) return; // honour "reduce motion" — show a static role instead
    let t;
    if (phase === "typing") {
      if (text.length < word.length) {
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), 90);
      } else {
        t = setTimeout(() => setPhase("erasing"), 1600);
      }
    } else if (phase === "erasing") {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), 45);
      } else {
        setIdx((i) => (i + 1) % ROLES.length);
        setPhase("waiting");
      }
    } else {
      t = setTimeout(() => setPhase("typing"), 400);
    }
    return () => clearTimeout(t);
  }, [text, phase, word, reduce]);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-[#aab4c4] mr-3">✦</span>
      <span className="font-display font-semibold tracking-tight text-white">
        {reduce ? ROLES[0] : text}
        {/* A terminal caret blinks — it does not fade. `ease: "steps(1)"` was
            not in Motion's easing table, so it was silently dropped and the
            animation ran linear (a soft pulse). A held keyframe pair with
            explicit `times` gives a true square wave on any path. */}
        <motion.span
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{
            duration: 1.1,
            times: [0, 0.499, 0.5, 1],
            repeat: Infinity,
            ease: "linear",
          }}
          className="ml-1 inline-block h-[0.95em] w-[3px] translate-y-[0.05em] rounded-sm bg-[#aab4c4] align-middle"
        />
      </span>
    </span>
  );
}

/* ─── Tiny inline arrow glyph cycle: → → ⇨ → ↦ → … feels alive ───
   Cheap, transform-only, accessible (aria-hidden on the parent). */
const ARROW_FRAMES = ["→", "⇨", "↦", "⇒", "→"];
function ArrowCycle() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    // A glyph swapping every 0.9s is motion, and "reduce motion" means it.
    if (reduce) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % ARROW_FRAMES.length), 900);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span key={i} style={{ display: "inline-block", minWidth: "0.7em" }}>
      {ARROW_FRAMES[reduce ? 0 : i]}
    </span>
  );
}

/* ─── Hero focal frame ───
   On capable devices the persistent 3D world renders the hero sculpture
   behind this column; we draw a transparent "lens" (rings + focal glow +
   crosshair) so it reads as a deliberately-lit subject. On touch / low-tier
   the world is off, so we fall back to a branded floating mark. */
function HeroFocus({ lite }) {
  // Hover/focus state for the lens, so the otherwise-invisible hotspot can
  // show that it IS a control. `experience.setHovered` drives the 3D world;
  // this drives the DOM affordance. Both, or the button reads as decoration.
  const [armed, setArmed] = useState(false);

  const arm = useCallback((next) => {
    setArmed(next);
    experience.getState().setHovered(next);
  }, []);

  if (lite) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ overflow: "visible" }}
      >
        <div
          className="animate-float3d h-48 w-48 rounded-[2rem] border border-white/10 md:h-72 md:w-72"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(170,180,196,0.18), transparent 70%)",
            boxShadow: "0 0 80px rgba(170,180,196,0.12)",
          }}
        >
          <span className="flex h-full w-full items-center justify-center text-6xl text-[#aab4c4]/40 md:text-7xl">
            ✦
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* The lens framing is a DESKTOP affordance: it frames the sculpture in
          its own column beside the copy. In the single-column phone layout its
          rings drift into the corners and collide with the floating action
          buttons, so it is hidden there — the 3D world itself still renders,
          and the compact phone panel below carries the same interaction.

          aria-hidden belongs on the decorative rings, NOT on this wrapper: the
          wrapper also contains the real "Pulse" button, and hiding an element
          that holds a focusable control leaves it tabbable but unannounced. */}
      <div
        className="pointer-events-none relative hidden h-full w-full md:block"
        style={{ overflow: "visible" }}
      >
        {/* focal glow — makes the sculpture behind read as a lit subject */}
        <div
          aria-hidden
          className="glow-pulse absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(170,180,196,0.12), transparent 70%)" }}
        />
        {/* outer framing ring with an orbiting node */}
        <div
          aria-hidden
          className="spin-slower absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
        >
          <span
            className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#aab4c4]/70"
            style={{ boxShadow: "0 0 8px rgba(170,180,196,0.6)" }}
          />
        </div>
        {/* inner dashed ring, counter-rotating */}
        <div
          aria-hidden
          className="spin-rev absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.05]"
        />
        {/* corner crosshair ticks */}
        {[
          "left-[8%] top-[12%] border-l border-t",
          "right-[8%] top-[12%] border-r border-t",
          "left-[8%] bottom-[14%] border-l border-b",
          "right-[8%] bottom-[14%] border-r border-b",
        ].map((c, i) => (
          <span key={i} aria-hidden className={`absolute ${c} h-5 w-5 border-white/15`} />
        ))}
        {/* live-render caption */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/55">
          <span
            className="h-1 w-1 animate-pulse rounded-full bg-[#aab4c4]"
            style={{ boxShadow: "0 0 6px rgba(170,180,196,0.7)" }}
          />
          Real-time · WebGL
        </div>

        {/* Interactive hotspot — hovering the orb energises it (store hover
          state → shell glow + spin) and morphs the custom cursor. This is the
          only place the otherwise pointer-events-none world accepts input.

          It used to be a completely invisible circle: nothing on screen said
          the sculpture could be touched, so effectively nobody found it. It
          now answers hover AND keyboard focus with a ring and a label, which
          is also what makes the focus state legible for keyboard visitors. */}
        <button
          type="button"
          aria-label="Send a pulse through the particle field"
          className="group/pulse absolute left-1/2 top-1/2 flex h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 items-end justify-center rounded-full pb-[18%]"
          style={{ pointerEvents: "auto" }}
          data-cursor="hover"
          data-cursor-text="Pulse"
          onPointerEnter={() => arm(true)}
          onPointerLeave={() => arm(false)}
          onFocus={() => arm(true)}
          onBlur={() => arm(false)}
          // Clicking the orb detonates a radial shockwave through the whole
          // particle field (MorphField owns the decay) — touch the world and
          // the world answers. A real <button> so keyboard users can fire it
          // too, instead of a div only a mouse can reach.
          onClick={() => heroImpact("short")}
        >
          {/* Reactive ring — the "this is a control" tell. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-[#aab4c4]/45 transition-all duration-500"
            style={{
              opacity: armed ? 1 : 0,
              transform: `scale(${armed ? 1 : 0.94})`,
              boxShadow: "0 0 40px rgba(170,180,196,0.18), inset 0 0 40px rgba(170,180,196,0.10)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none relative rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-sm transition-all duration-400"
            style={{
              opacity: armed ? 1 : 0,
              transform: `translateY(${armed ? 0 : 6}px)`,
            }}
          >
            Pulse the field
          </span>
        </button>
      </div>

      {/* PHONE: the lens rings do not survive a single-column layout, but the
        interaction should. A compact panel gives the same control a visible,
        thumb-sized target instead of leaving 420px of empty column. */}
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-7 md:hidden">
        <div
          aria-hidden
          className="glow-pulse absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(170,180,196,0.14), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="spin-slower relative h-40 w-40 rounded-full border border-white/[0.07]"
        >
          <span
            className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#aab4c4]/70"
            style={{ boxShadow: "0 0 8px rgba(170,180,196,0.6)" }}
          />
        </div>
        <button
          type="button"
          onClick={() => heroImpact("short")}
          className="relative inline-flex min-h-[44px] items-center gap-2 rounded-full glass px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 active:scale-[0.97]"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[#aab4c4]"
            style={{ boxShadow: "0 0 8px rgba(170,180,196,0.8)" }}
          />
          Pulse the field
        </button>
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/55">
          <span
            aria-hidden
            className="h-1 w-1 animate-pulse rounded-full bg-[#aab4c4]"
            style={{ boxShadow: "0 0 6px rgba(170,180,196,0.7)" }}
          />
          Real-time · WebGL
        </p>
      </div>
    </>
  );
}

export default function Hero() {
  const { profile, heroTags, t } = useContent();
  const ref = useRef(null);
  const { tier } = useDeviceProfile();
  // Must match App's world gating: the fallback mark is only correct when the
  // 3D world is genuinely off. While both rendered on phones, the fallback's
  // floating card sat over the hero and collided with the WhatsApp button.
  const lite = tier === "low";
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Multi-layer parallax — spring-smoothed so it doesn't feel jittery on Lenis
  const sScroll = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const yText = useTransform(sScroll, [0, 1], [0, -180]);
  const yDecor = useTransform(sScroll, [0, 1], [0, -90]);
  const yRobot = useTransform(sScroll, [0, 1], [0, 60]);
  const opacity = useTransform(sScroll, [0, 0.7], [1, 0]);
  // A faded-out hero is still a tabbable, clickable hero without this: the
  // CTAs stayed in the tab order at opacity 0, so keyboard visitors landed on
  // an invisible "View My Work" and mouse visitors could click a control
  // sitting over the section below.
  const visibility = useFadeGate(opacity);
  const scale = useTransform(sScroll, [0, 0.6], [1, 0.92]);
  const robotRotate = useTransform(sScroll, [0, 1], [0, -8]);
  const robotScale = useTransform(sScroll, [0, 1], [1, 0.88]);

  const scrollDown = () => goToSection("about");

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full min-h-[100svh] pt-28 pb-28 md:pt-40 md:pb-32"
      style={{ overflow: "visible" }}
    >
      {/* ── Ambient decorations ──────────────────────────────────── */}
      <motion.div
        style={{ y: yDecor }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {/* Ambient orbs + glyphs — driven by pure-CSS compositor animations
            (not framer) so they cost nothing on the main thread even though
            the hero is above the fold and always rendering. */}
        <div
          className="animate-aurora absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #aab4c4 0%, transparent 70%)" }}
        />
        <div
          className="animate-aurora absolute -left-16 bottom-[18%] h-72 w-72 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #6f7c8c 0%, transparent 70%)",
            animationDelay: "-9s",
          }}
        />
        {/* spinning ring top-left */}
        <div className="spin-slower absolute left-[6%] top-[26%] h-24 w-24 rounded-full border border-white/[0.08]">
          <span
            className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#aab4c4]/70"
            style={{ boxShadow: "0 0 8px rgba(170,180,196,0.6)" }}
          />
        </div>
        {/* small cross */}
        <div className="spin-slower absolute right-[20%] bottom-[28%] opacity-20">
          <div className="h-px w-12 bg-white/50" />
          <div className="absolute left-1/2 top-1/2 h-12 w-px -translate-x-1/2 -translate-y-1/2 bg-white/50" />
        </div>
      </motion.div>

      {/* ── Main content grid ───────────────────────────────────── */}
      <div className="mx-auto grid w-[90%] sm:w-[88%] max-w-7xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-4">
        {/* LEFT: copy */}
        <motion.div style={{ y: yText, opacity, scale, visibility }} className="relative z-10">
          {/* Column scrim. The hero's copy sits directly on a bright, moving,
              additively-blended particle field, and "white text at 55% over
              whatever the GPU is doing this frame" is not a contrast strategy
              — the tagline and the tag pills washed out every time the ring
              band swept behind them. This is the standard text-over-video
              answer: a soft ground anchored to the reading edge that fades out
              long before it reaches the sculpture, so it protects the words
              without ever reading as a panel. Desktop only — phones already
              get the full-width veil in App. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[10%] -inset-y-[8%] -z-10 hidden md:block"
            style={{
              background:
                "linear-gradient(100deg, rgba(6,8,12,0.80) 0%, rgba(6,8,12,0.62) 38%, rgba(6,8,12,0.28) 64%, transparent 88%)",
              maskImage: "radial-gradient(120% 100% at 20% 50%, #000 45%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(120% 100% at 20% 50%, #000 45%, transparent 100%)",
            }}
          />
          {/* Available status pill */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: EASE_BACK }}
            className="gradient-border group/pill mb-6 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 transition-all duration-300 hover:bg-white/[0.08] hover:tracking-[0.32em]"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 32px rgba(74,222,128,0.06)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400"
                style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }}
              />
            </span>
            <span className="text-green-400/90">Available</span>
            <span className="text-white/45">·</span>
            <span>{t.labels.forNewProjects}</span>
            {/* expanding hairline — reads as a "live" progress bar under the pill */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE_OUT }}
              className="absolute -bottom-1 left-3 right-3 h-px origin-left bg-gradient-to-r from-green-400/0 via-green-400/70 to-green-400/0"
            />
            <motion.span
              aria-hidden
              className="badge-pulse absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 translate-y-1 rounded-full bg-green-400"
              style={{ boxShadow: "0 0 8px rgba(74,222,128,0.9)" }}
            />
          </motion.div>

          {/* Hi there I'm */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.55, ease: EASE_OUT }}
            className="mb-4 flex items-center gap-3"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.6, ease: EASE_OUT }}
              className="h-px w-10 origin-left bg-gradient-to-r from-white/40 to-transparent"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
              {t.labels.hiThereIm}
            </span>
          </motion.div>

          {/* MASSIVE NAME — locked single line per word.
              An <h2>: the page's single <h1> is the cover statement in
              PhotoIntro, which is first in the DOM and carries the name. */}
          <h2
            className="relative font-display font-bold leading-[0.88] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 7rem)",
              // The name sits directly on top of the brightest part of the
              // particle field. A glow-only shadow made the surname — italic,
              // hairline, filled with a near-white gradient — vanish entirely
              // against the hot ring band. The dark halo underneath is what
              // guarantees the type owns its own ground no matter what the
              // world is doing behind it; the glow rides on top of that.
              textShadow: [
                "0 2px 24px rgba(4,6,10,0.92)",
                "0 0 10px rgba(4,6,10,0.85)",
                "0 0 60px rgba(4,6,10,0.6)",
                "0 0 40px rgba(170,180,196,0.14)",
              ].join(", "),
            }}
          >
            {/* A soft, wide scrim behind the two name lines only. Cheaper and
                far less heavy-handed than dimming the whole hero, and it keeps
                the headline readable on every frame of the animation. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-[6%] -inset-y-[14%] -z-10 block"
              style={{
                background:
                  "radial-gradient(60% 62% at 32% 50%, rgba(4,6,10,0.72) 0%, rgba(4,6,10,0.42) 48%, transparent 78%)",
              }}
            />
            <span className="block overflow-hidden whitespace-nowrap" style={{ perspective: 900 }}>
              <motion.span
                className="block whitespace-nowrap"
                style={{ transformOrigin: "0% 100%" }}
                initial={{
                  y: "118%",
                  rotateX: 48,
                  filter: "blur(10px) drop-shadow(0 0 0px rgba(170,180,196,0))",
                }}
                animate={{
                  y: 0,
                  rotateX: 0,
                  filter: [
                    "blur(0px) drop-shadow(0 0 0px rgba(170,180,196,0))",
                    "blur(0px) drop-shadow(0 0 28px rgba(170,180,196,0.55))",
                    "blur(0px) drop-shadow(0 0 0px rgba(170,180,196,0))",
                  ],
                }}
                transition={{
                  y: { duration: 1.1, delay: 0.55, ease: EASE_OUT },
                  rotateX: { duration: 1.1, delay: 0.55, ease: EASE_OUT },
                  filter: { duration: 1.6, delay: 0.55, times: [0, 0.35, 1] },
                }}
              >
                <MagneticText text={profile.firstName} radius={180} strength={24} />
              </motion.span>
            </span>
            <span className="block overflow-hidden whitespace-nowrap" style={{ perspective: 900 }}>
              <motion.span
                // font-light at 100px+ is a hairline: over a moving bright
                // backdrop it had almost no ink to be legible with. 500 keeps
                // the elegance of the italic and gives it a body.
                // The surname is the page's one ornate moment: a high-contrast
                // display serif set against the block-geometric first name.
                // The contrast between the two faces is the point — running
                // both in one family would just be a big name.
                className="font-ornate block whitespace-nowrap font-semibold"
                // textShadow: "none" is load-bearing. The paint order is
                // background → text-shadow → glyph, and this glyph's fill is
                // transparent (background-clip: text), so the h2's inherited
                // dark halo painted straight over the gradient and turned the
                // surname into a dark silhouette. The drop-shadow filter above
                // does the same job from behind, where it belongs.
                style={{
                  transformOrigin: "0% 100%",
                  textShadow: "none",
                  // Playfair's italic has a smaller cap height than Space
                  // Grotesk's, so at the same font-size the surname reads as a
                  // subtitle. Optical, not mathematical — matched by eye so
                  // the two lines land as one headline.
                  fontSize: "1.14em",
                }}
                // `text-shadow` is painted ON TOP of a background-clip:text
                // fill, so it would smear the metallic gradient rather than
                // back it. `drop-shadow` filters the composited element and
                // lands behind it — the right tool for a clipped-gradient
                // headline that has to survive a bright, moving backdrop.
                initial={{ y: "118%", rotateX: 48, filter: "blur(10px)" }}
                animate={{
                  y: 0,
                  rotateX: 0,
                  filter:
                    "blur(0px) drop-shadow(0 2px 14px rgba(4,6,10,0.95)) drop-shadow(0 0 34px rgba(4,6,10,0.7))",
                }}
                transition={{
                  duration: 1.1,
                  delay: 0.72,
                  ease: EASE_OUT,
                  filter: { duration: 0.7, delay: 0.72 },
                }}
              >
                <MagneticText
                  text={profile.lastName}
                  radius={180}
                  strength={24}
                  // The sheen has to be applied per letter — see the note on
                  // MagneticText's charClassName. On the line wrapper it
                  // painted nothing at all.
                  charClassName="text-gradient-bright"
                />
              </motion.span>
            </span>
          </h2>

          {/* Role typewriter — bigger */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6, ease: EASE_OUT }}
            className="mt-6 text-2xl md:text-3xl"
          >
            <TypewriterRole />
          </motion.div>

          {/* tagline — body copy stays plain for guaranteed spacing/readability
              (clarity > effect); a single soft fade+lift is enough. */}
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.08, duration: 0.7, ease: EASE_OUT }}
            className="mt-6 max-w-md text-base leading-relaxed text-white/55 md:text-lg"
          >
            {profile.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.18, duration: 0.6 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <MagneticButton
              onClick={(e) => {
                celebrate(e.clientX, e.clientY);
                heroImpact("full");
                goToSection("projects");
              }}
              // Hovering the primary action already energises the sculpture,
              // so the copy and the world stop feeling like two separate
              // sites stacked on top of each other.
              onPointerEnter={() => experience.getState().setHovered(true)}
              onPointerLeave={() => experience.getState().setHovered(false)}
              onFocus={() => experience.getState().setHovered(true)}
              onBlur={() => experience.getState().setHovered(false)}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-white px-7 py-4 text-sm font-semibold text-black shadow-[0_18px_36px_-12px_rgba(255,255,255,0.35)]"
            >
              {/* Shimmer sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <span className="relative">{t.cta.viewMyWork}</span>
              <motion.span
                className="relative inline-block"
                aria-hidden
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowCycle />
              </motion.span>
            </MagneticButton>

            <MagneticButton
              onClick={(e) => {
                celebrate(e.clientX, e.clientY, "#aab4c4");
                heroImpact("short");
                goToSection("contact");
              }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl glass px-7 py-4 text-sm font-semibold text-white"
            >
              {/* Light sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <span className="relative">{t.cta.getInTouch}</span>
              <span className="relative text-white/55 transition-colors group-hover:text-white">
                ↗
              </span>
            </MagneticButton>
          </motion.div>

          {/* tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8"
          >
            {/* 9px at 50% white did not clear 4.5:1 — small, wide-tracked,
                low-alpha type is the easiest contrast to lose and the easiest
                to fix. */}
            <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/75">
              Crafting with
            </p>
            <ul className="flex flex-wrap gap-2">
              {heroTags.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, scale: 0.7, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.06, ...TAG_SPRING }}
                  whileHover={{ y: -3, scale: 1.06 }}
                  data-cursor="hover"
                  className="gradient-border group/tag relative inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 text-xs text-white/65 transition-colors hover:text-white"
                >
                  <span className="text-[#aab4c4] transition-transform duration-300 group-hover/tag:rotate-90">
                    ◇
                  </span>
                  {t}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* RIGHT: focal frame for the persistent 3D world's hero sculpture
            (the camera biases the sculpture into this column at the top of
            the page). Parallax layer is preserved so it drifts on scroll. */}
        <motion.div
          style={{ y: yRobot, rotate: robotRotate, scale: robotScale, overflow: "visible" }}
          className="relative h-[420px] w-full md:h-[640px] md:-mt-10"
        >
          <HeroFocus lite={lite} />
        </motion.div>
      </div>

      {/* ── Scroll cue ──────────────────────────────────────────── */}
      <motion.button
        onClick={scrollDown}
        data-cursor="hover"
        data-cursor-text="Down"
        style={{ opacity, visibility }}
        className="group absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/85"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.6 }}
      >
        {/* tiny pulsing accent dot at the top */}
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1 w-1 rounded-full bg-[#aab4c4]"
        />

        <motion.span
          className="text-[10px] uppercase tracking-[0.32em]"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Scroll
        </motion.span>

        {/* Mouse outline with falling dot */}
        <span
          className="relative flex h-9 w-5 justify-center rounded-full border border-white/30 p-1 transition-all duration-300 group-hover:border-white/60 group-hover:bg-white/[0.04]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
        >
          <motion.span
            className="h-2 w-[3px] rounded-full bg-white/60 transition-colors duration-300 group-hover:bg-white"
            animate={{ y: [0, 10, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>

        {/* tiny down arrow flickering */}
        <motion.span
          animate={{ y: [0, 3, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="text-[8px]"
        >
          ▾
        </motion.span>
      </motion.button>
    </section>
  );
}
