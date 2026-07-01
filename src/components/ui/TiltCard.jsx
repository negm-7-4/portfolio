import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { SPRING_SNAP } from "../../lib/motion";

const TILT_SPRING = { stiffness: 280, damping: 22, mass: 0.7 };

/**
 * 3D tilt card — rotates toward the cursor with spring physics, an
 * animated glare highlight, and a coloured spotlight follow.
 * Stronger than the original: snappier springs, deeper perspective,
 * and a subtle Z-lift on hover so cards "come toward you".
 */
export default function TiltCard({
  children,
  className = "",
  max = 16,
  glare = true,
  spotlight = true,
  spotColor = "170,180,196",  // silver-blue (matches palette)
  ...rest
}) {
  const ref = useRef(null);
  const rectRef = useRef(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  /* physical spring — smooth follow with a clean settle */
  const srx = useSpring(rx, TILT_SPRING);
  const sry = useSpring(ry, TILT_SPRING);

  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);

  /* Z-depth moves the card toward the viewer on hover */
  const tz = useSpring(0, TILT_SPRING);
  const translateZ = useTransform(tz, (v) => `${v}px`);

  const onEnter = () => {
    rectRef.current = ref.current?.getBoundingClientRect();
    tz.set(18);
  };
  const onMove = (e) => {
    const rect = rectRef.current ?? ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top)  / rect.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onLeave = () => {
    rectRef.current = null;
    rx.set(0); ry.set(0);
    gx.set(50); gy.set(50);
    tz.set(0);
  };

  const glareBg = useTransform(
    [gx, gy],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.22), transparent 55%)`
  );
  const spotBg = useTransform(
    [gx, gy],
    ([x, y]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, rgba(${spotColor},0.24), transparent 60%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        translateZ,
        transformPerspective: 750,
        willChange: "transform",
      }}
      whileHover={{ scale: 1.03 }}
      transition={SPRING_SNAP}
      className={`group/tilt relative [transform-style:preserve-3d] ${className}`}
      {...rest}
    >
      {spotlight && (
        <motion.div
          aria-hidden
          style={{ background: spotBg }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        />
      )}
      {/* subtle outer halo on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
        style={{
          background: `linear-gradient(135deg, rgba(${spotColor},0.25), rgba(${spotColor},0))`,
          padding: "1px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
      {glare && (
        <motion.div
          aria-hidden
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        />
      )}
    </motion.div>
  );
}
