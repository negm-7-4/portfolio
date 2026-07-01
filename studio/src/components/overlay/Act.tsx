"use client";

import type { ReactNode } from "react";

/**
 * One act of the journey. A full-height (or taller) band of DOM content
 * layered above the 3D world. `align` positions the content so it doesn't
 * collide with the act's 3D focal point.
 */
export default function Act({
  id,
  children,
  className = "",
  align = "center",
  tall = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  align?: "center" | "left" | "right";
  tall?: boolean;
}) {
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <section
      id={id}
      data-act={id}
      className={`relative flex ${tall ? "min-h-[180vh]" : "min-h-screen"} w-full items-center ${justify} px-6 py-24 sm:px-10 ${className}`}
    >
      <div className="w-full max-w-6xl">{children}</div>
    </section>
  );
}
