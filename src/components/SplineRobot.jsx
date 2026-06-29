import { Suspense, lazy, useState } from "react";
import { motion } from "motion/react";
import ErrorBoundary from "./ErrorBoundary";

const Spline = lazy(() => import("@splinetool/react-spline"));

// Robot character that tracks the cursor (interaction built into the scene).
const SCENE = "https://prod.spline.design/dyZOoabO4AAJ7D9X/scene.splinecode";

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-5">
        {/* Triple-ring orbital loader */}
        <div className="relative h-20 w-20">
          {/* Outer ring */}
          <div
            className="absolute inset-0 animate-spin rounded-full border border-white/10"
            style={{ animationDuration: "8s" }}
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[#aab4c4]" />
          </div>
          {/* Middle ring — opposite direction */}
          <div
            className="absolute inset-2 rounded-full border border-white/15"
            style={{ animation: "spin 5s linear infinite reverse" }}
          >
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-1 w-1 rounded-full bg-white/70" />
          </div>
          {/* Inner ring */}
          <div className="absolute inset-5 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
          {/* Center dot pulsing */}
          <span
            className="absolute inset-0 m-auto h-1 w-1 rounded-full bg-white"
            style={{
              animation: "pulse 1.6s ease-in-out infinite",
              boxShadow: "0 0 8px rgba(255,255,255,0.6)",
            }}
          />
        </div>

        <div className="text-center">
          <span className="block text-[10px] uppercase tracking-[0.4em] text-white/50">
            Loading
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.25em] text-white/30">
            3d scene · spline
          </span>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-white/60"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Graceful fallback if the Spline scene fails to load (CDN down, WebGL
   blocked, slow network throwing). Keeps the hero column from going blank. */
function RobotFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div
        className="animate-float3d h-48 w-48 rounded-[2rem] border border-white/10 md:h-64 md:w-64"
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

/**
 * The hero's 3D robot, powered by Spline (NEXBOT). It follows the mouse
 * natively. We lazy-load it and cover Spline's corner watermark.
 */
export default function SplineRobot() {
  const [ready, setReady] = useState(false);

  return (
    <div
      className="relative h-full w-full pointer-events-auto"
      style={{ overflow: "visible" }}
    >
      <ErrorBoundary fallback={<RobotFallback />}>
        <Suspense fallback={<Loader />}>
          {!ready && <Loader />}
          <motion.div
            className="h-full w-full"
            style={{ overflow: "visible" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.9 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Spline
              scene={SCENE}
              onLoad={() => {
                setReady(true);
                window.__splineReady = true;
                window.dispatchEvent(new Event("spline-ready"));
              }}
            />
          </motion.div>
        </Suspense>
      </ErrorBoundary>

      {/* cover the "Built with Spline" watermark (bottom-right of the canvas) */}
      <div className="pointer-events-none absolute bottom-3 right-3 h-11 w-44 rounded-lg bg-[#0b0d11]" />
    </div>
  );
}
