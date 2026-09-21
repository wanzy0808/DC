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
      <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 mx-auto my-3 flex min-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[1680px] flex-col overflow-hidden rounded-[22px] border border-primary/30 bg-background/35 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-6 sm:min-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)] lg:my-8 lg:min-h-[calc(100dvh-4rem)] lg:w-[calc(100%-4rem)]">
        <div className="relative z-30 border-b border-primary/15"><Navbar embedded /></div>
        <main className="relative flex flex-1 flex-col items-center justify-center px-3 py-5 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(217,163,170,0.11),transparent_64%)]" aria-hidden />
          <div className="relative z-10 w-full max-w-5xl">
            <SimpleDoorLab />
          </div>
        </main>
        <div className="relative z-20 border-t border-primary/15"><Footer embedded /></div>
      </motion.div>
    </div>
  );
}
