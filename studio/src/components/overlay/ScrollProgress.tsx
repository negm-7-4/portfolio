"use client";

import { useExperience } from "@/lib/store";

/** Hairline top progress bar reflecting global journey progress. */
export default function ScrollProgress() {
  const p = useExperience((s) => s.scroll);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-steel via-ice to-steel"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}
