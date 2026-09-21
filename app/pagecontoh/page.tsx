"use client";

import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import SimpleDoorLab from "@/components/Landing/Pintu/SimpleDoorLab";
import LandingFloralGlow from "@/components/Landing/LandingFloralGlow";
import WindRosePetals from "@/components/Landing/WindRosePetals";
import { motion, useReducedMotion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

export default function PageContoh() {
  const reduced = useReducedMotion();
  const { locale } = useLanguage();
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolume] = useState(50);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const player = new Audio("/A%20Himitsu%20-%20Fragile.mp3");
    player.loop = true;
    player.preload = "auto";
    player.volume = volume / 100;
    audio.current = player;
    let disposed = false;
    const start = () => {
      if (disposed || audio.current !== player || !player.paused) return;
      void player.play().then(() => {
        if (!disposed) setSoundOn(true);
      }).catch(() => {
        if (!disposed) setSoundOn(false);
      });
    };
    start();
    // Browsers may block autoplay with sound until the first user interaction.
    const firstInteraction = () => {
      start();
      window.removeEventListener("pointerdown", firstInteraction);
      window.removeEventListener("keydown", firstInteraction);
    };
    window.addEventListener("pointerdown", firstInteraction);
    window.addEventListener("keydown", firstInteraction);
    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", firstInteraction);
      window.removeEventListener("keydown", firstInteraction);
      player.pause();
      player.removeAttribute("src");
      player.load();
      audio.current = null;
    };
  }, []);

  async function toggleSound() {
    const player = audio.current;
    if (!player) return;
    if (soundOn) {
      player.pause();
      setSoundOn(false);
      return;
    }
    try {
      player.volume = volume / 100;
      await player.play();
      setSoundOn(true);
    } catch {
      setSoundOn(false);
    }
  }

  function changeVolume(value: number) {
    setVolume(value);
    if (audio.current) audio.current.volume = value / 100;
  }
  return (
    <div className="relative isolate -mx-[calc((100vw-100%)/2)] min-h-dvh w-screen overflow-hidden bg-background text-foreground">
      {/* One continuous scene behind the framed composition and its outer margins. */}
      <LandingFloralGlow />
      <WindRosePetals />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(217,163,170,0.2),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(192,122,132,0.2),transparent_65%)]" />
      <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 mx-auto my-[19px] flex h-[calc(100dvh-38px)] w-[calc(100%-38px)] flex-col overflow-hidden rounded-[18px] border border-primary/30 bg-background/35 shadow-[0_18px_75px_rgba(75,35,47,0.09)] backdrop-blur-[2px] sm:my-[23px] sm:h-[calc(100dvh-46px)] sm:w-[calc(100%-46px)] lg:my-[27px] lg:h-[calc(100dvh-54px)] lg:w-[calc(100%-54px)]">
        <main className="absolute inset-0 z-0">
          <SimpleDoorLab fullFrame />
        </main>
        <div className="pointer-events-none relative z-30 border-b border-primary/15 bg-background/35 backdrop-blur-sm [&_a]:pointer-events-auto [&_button]:pointer-events-auto"><Navbar embedded /></div>
        <div className="pointer-events-none relative z-20 flex-1">
          <div className="absolute inset-x-4 top-5 text-center sm:inset-x-8 sm:top-8 lg:inset-x-auto lg:left-[5%] lg:top-[12%] lg:max-w-[29rem] lg:text-left">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.22em] text-foreground/55 sm:text-xs"
            >
              {locale === "en" ? "For moments worth remembering" : "Untuk momen yang ingin dikenang"}
            </motion.p>
            <h1 className="mt-3 font-[family-name:var(--font-dc-heading)] text-[clamp(1.5rem,3vw,3.2rem)] leading-[1.18] tracking-[-0.025em] text-primary sm:mt-4">
              {(locale === "en" ? ["Every story", "begins somewhere."] : ["Setiap cerita", "punya awalnya."]).map((line, index) => (
                <motion.span key={line} className="block" initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.95, delay: 0.38 + index * 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  {line}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 1.1 }} className="mx-auto mt-3 max-w-[19rem] text-xs leading-6 text-foreground/75 sm:mt-5 sm:max-w-[25rem] sm:text-sm lg:mx-0">
              {locale === "en" ? "Choose a door. We'll take care of the moments beyond it." : "Pilih pintumu. Biar kami menemani setiap momen setelahnya."}
            </motion.p>
          </div>
        </div>
        <div className="relative z-40 flex flex-wrap items-center justify-between gap-2 border-t border-primary/15 bg-background/30 px-3 backdrop-blur-sm sm:px-6"><div className="relative z-40 flex items-center gap-2 rounded-xl border border-primary/25 bg-background/85 px-2 py-1 shadow-sm backdrop-blur-md">
          <Button size="icon-sm" onClick={toggleSound} aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"} aria-pressed={soundOn} title={soundOn ? "Matikan suara" : "Nyalakan suara"}>
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <label htmlFor="contoh-volume" className="sr-only">Volume suara</label>
          <input id="contoh-volume" type="range" min="0" max="100" value={volume} onChange={(event) => changeVolume(Number(event.target.value))} className="w-20 cursor-pointer accent-[#C07A84] sm:w-24" aria-valuetext={volume + "%"} />
          <span className="w-8 text-right font-[family-name:var(--font-dc-mono)] text-xs tabular-nums text-foreground/70">{volume}%</span>
        </div><div className="pointer-events-none min-w-0 flex-1 [&_a]:pointer-events-auto [&_button]:pointer-events-auto"><Footer embedded /></div></div>
      </motion.div>
    </div>
  );
}
