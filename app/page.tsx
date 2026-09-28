"use client";

import Navbar from "@/components/Layout/Navbar/Navbar";
import LandingDoorScene from "@/components/Landing/Pintu/LandingDoorScene";
import LandingWoodlandAtmosphere from "@/components/Landing/LandingWoodlandAtmosphere";
import LandingTopCanopy from "@/components/Landing/LandingTopCanopy";
import LandingStoryCopy from "@/components/Landing/LandingStoryCopy";
import MarketingFrameFooter from "@/components/Layout/MarketingFrameFooter";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

export default function HomePage() {
  const reduced = useReducedMotion();
  const [doorOpen, setDoorOpen] = useState(false);

  return (
    <div className="relative isolate -mx-[calc((100vw-100%)/2)] min-h-dvh w-screen overflow-hidden bg-background text-foreground dark:bg-[#281414]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(112,59,59,0.10),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_42%,rgba(140,82,67,0.34)_0%,rgba(74,34,32,0.26)_42%,rgba(40,20,20,0.10)_67%,transparent_82%)]"
      />
      <LandingTopCanopy />

      <motion.div
        data-dc-marketing-frame
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto my-auto flex h-[calc(100dvh-24px)] w-[calc(100%-16px)] flex-col overflow-hidden rounded-[14px] border border-primary/20 bg-transparent shadow-[0_18px_75px_rgba(75,35,47,0.09)] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] sm:rounded-[18px] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]"
      >
        <LandingWoodlandAtmosphere />

        <main className={`absolute inset-0 ${doorOpen ? "z-[25] sm:z-[5]" : "z-[5]"}`}>
          <LandingDoorScene fullFrame onDoorOpenChange={setDoorOpen} />
        </main>

        <div className="pointer-events-none relative z-30 bg-transparent [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <Navbar embedded />
        </div>

        <LandingStoryCopy hidden={doorOpen} />
        <div aria-hidden="true" className="pointer-events-none min-h-0 flex-1" />
        <MarketingFrameFooter />
      </motion.div>
    </div>
  );
}
