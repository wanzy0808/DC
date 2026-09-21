"use client";

import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import SimpleDoorLab from "@/components/Landing/Pintu/SimpleDoorLab";
import LandingFloralGlow from "@/components/Landing/LandingFloralGlow";
import { motion, useReducedMotion } from "motion/react";

export default function PageContoh() {
  const reduced = useReducedMotion();
  return (
    <div className="relative isolate -mx-[calc((100vw-100%)/2)] min-h-dvh w-screen overflow-hidden bg-background text-foreground">
      {/* One continuous scene behind the framed composition and its outer margins. */}
      <LandingFloralGlow />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.2),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.2),transparent_65%)]" />
      <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 mx-auto my-[19px] flex h-[calc(100dvh-38px)] w-[calc(100%-38px)] flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/35 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <main className="absolute inset-0 z-0">
          <SimpleDoorLab fullFrame />
        </main>
        <div className="pointer-events-none relative z-30 border-b border-primary/15 bg-background/35 backdrop-blur-sm [&_a]:pointer-events-auto [&_button]:pointer-events-auto"><Navbar embedded /></div>
        <div className="flex-1" aria-hidden="true" />
        <div className="pointer-events-none relative z-20 border-t border-primary/15 bg-background/30 backdrop-blur-sm [&_a]:pointer-events-auto [&_button]:pointer-events-auto"><Footer embedded /></div>
      </motion.div>
    </div>
  );
}
