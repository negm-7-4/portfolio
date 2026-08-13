import confetti from "canvas-confetti";

/**
 * Burst confetti at a given screen coordinate (or center of viewport).
 * Reuses a single dedicated canvas to avoid mount thrash on rapid clicks.
 */
type Fire = ReturnType<typeof confetti.create>;

let instance: Fire | null = null;

function getInstance(): Fire {
  if (instance) return instance;
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998";
  document.body.appendChild(canvas);
  instance = confetti.create(canvas, { resize: true, useWorker: true });
  return instance;
}

const SILVER = ["#ffffff", "#d9e0ec", "#8a93a6", "#b8c4d6", "#cbd2dd"];

/** The confetti options this app varies. The rest stay at the house defaults. */
export interface BurstOptions {
  /** Override the silver palette. */
  colors?: string[];
  particleCount?: number;
  spread?: number;
  scalar?: number;
  startVelocity?: number;
}

export function burst(x?: number, y?: number, opts: BurstOptions = {}): void {
  const fire = getInstance();
  const origin = {
    x: (x ?? window.innerWidth / 2) / window.innerWidth,
    y: (y ?? window.innerHeight / 2) / window.innerHeight,
  };
  fire({
    particleCount: 48,
    spread: 70,
    startVelocity: 38,
    decay: 0.92,
    gravity: 1.1,
    ticks: 180,
    scalar: 0.9,
    colors: opts.colors ?? SILVER,
    origin,
    ...opts,
  });
}

/** Fancy two-stage burst (rim + center) for big CTA clicks. */
export function celebrate(x?: number, y?: number, color?: string): void {
  const colors = color ? [color, "#ffffff"] : SILVER;
  burst(x, y, { particleCount: 80, spread: 90, colors, scalar: 1.05 });
  setTimeout(
    () => burst(x, y, { particleCount: 30, spread: 140, startVelocity: 22, colors, scalar: 0.7 }),
    120
  );
}

/** Click burst that picks coords from a MouseEvent. */
export function burstFromEvent(
  e: { clientX: number; clientY: number },
  opts: BurstOptions = {}
): void {
  burst(e.clientX, e.clientY, opts);
}

/** Hook helper — call inside a click handler */
export function useConfettiClick() {
  return (e: { clientX: number; clientY: number }, opts?: { color?: string }): void =>
    celebrate(e.clientX, e.clientY, opts?.color);
}
