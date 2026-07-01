"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig } from "motion/react";

import { SmoothScroll } from "@/lib/scroll";
import { useQualityTier } from "@/lib/useQualityTier";
import { useExperience } from "@/lib/store";

import Preloader from "@/components/Preloader";
import Header from "@/components/overlay/Header";
import ChapterRail from "@/components/overlay/ChapterRail";
import ScrollProgress from "@/components/overlay/ScrollProgress";
import CustomCursor from "@/components/overlay/CustomCursor";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Work from "@/components/sections/Work";
import Contact from "@/components/sections/Contact";

// The 3D canvas must never render on the server (it touches WebGL/window).
// ssr:false is allowed here because Experience is a Client Component.
const Scene = dynamic(() => import("@/components/canvas/Scene"), { ssr: false });

export default function Experience() {
  const [booted, setBooted] = useState(false);
  useQualityTier();
  const lowTier = useExperience((s) => s.quality === "low");

  const handleDone = () => {
    setBooted(true);
    useExperience.getState().setPhase("ready");
  };

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        {/* Persistent 3D world */}
        <Scene />

        {/* Cinematic DOM grade overlays */}
        <div className="cine-bars" aria-hidden />
        {lowTier && <div className="vignette" aria-hidden />}
        <div className="grain" aria-hidden />

        {/* Chrome */}
        <ScrollProgress />
        <Header />
        <ChapterRail />
        <CustomCursor />

        {/* Acts */}
        <main className="relative z-10">
          <Hero />
          <About />
          <Skills />
          <Work />
          <Contact />
        </main>

        {/* Preloader → synchronized reveal */}
        <AnimatePresence>
          {!booted && <Preloader key="preloader" onDone={handleDone} />}
        </AnimatePresence>
      </SmoothScroll>
    </MotionConfig>
  );
}
