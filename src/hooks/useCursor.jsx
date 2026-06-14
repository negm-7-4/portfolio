import { createContext, useContext, useEffect, useRef } from "react";
import { useMotionValue } from "motion/react";

/**
 * Global cursor position store. Wrap the app with <CursorProvider />.
 * Anywhere in the tree call useCursor() to get reactive motion values
 * (mx, my) and helpers (distance from a DOM rect, isMoving, vx, vy).
 *
 * Motion values are batched & read by Framer without re-rendering the
 * subscriber — cheap enough to use on every card, every letter.
 */
const CursorCtx = createContext(null);

export function CursorProvider({ children }) {
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);
  const lastX = useRef(-9999);
  const lastY = useRef(-9999);
  const lastT = useRef(performance.now());

  useEffect(() => {
    const onMove = (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT.current);
      vx.set((e.clientX - lastX.current) / dt);
      vy.set((e.clientY - lastY.current) / dt);
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      lastT.current = now;
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, vx, vy]);

  return (
    <CursorCtx.Provider value={{ mx, my, vx, vy }}>
      {children}
    </CursorCtx.Provider>
  );
}

export function useCursor() {
  return useContext(CursorCtx);
}
