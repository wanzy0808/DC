"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isMarketingPath } from "@/lib/marketing-paths";

type MarketingAudioState = {
  soundOn: boolean;
  volume: number;
  toggleSound: () => Promise<void>;
  changeVolume: (value: number) => void;
};

const MarketingAudioContext = createContext<MarketingAudioState | null>(null);

/** One audio element for all marketing routes: switching pages never restarts the track. */
export function MarketingAudioProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMarketing = isMarketingPath(pathname);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const allowedRef = useRef(isMarketing);
  const manuallyMutedRef = useRef(false);
  const volumeRef = useRef(50);
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    allowedRef.current = isMarketing;
    const player = playerRef.current;
    if (!player) return;
    if (!isMarketing) {
      player.pause();
    } else if (!manuallyMutedRef.current && player.paused) {
      void player.play().catch(() => setSoundOn(false));
    }
  }, [isMarketing]);

  useEffect(() => {
    const player = new Audio("/A%20Himitsu%20-%20Fragile.mp3");
    player.loop = true;
    player.preload = "auto";
    player.volume = volumeRef.current / 100;
    playerRef.current = player;
    const onPlay = () => setSoundOn(true);
    const onPause = () => setSoundOn(false);
    const startOnGesture = () => {
      if (!allowedRef.current || manuallyMutedRef.current || !player.paused) return;
      void player.play().catch(() => setSoundOn(false));
    };
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    window.addEventListener("pointerdown", startOnGesture);
    window.addEventListener("keydown", startOnGesture);
    if (allowedRef.current) void player.play().catch(() => setSoundOn(false));
    return () => {
      window.removeEventListener("pointerdown", startOnGesture);
      window.removeEventListener("keydown", startOnGesture);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.pause();
      player.removeAttribute("src");
      player.load();
      playerRef.current = null;
    };
  }, []);

  async function toggleSound() {
    const player = playerRef.current;
    if (!player) return;
    if (!player.paused) {
      manuallyMutedRef.current = true;
      player.pause();
      return;
    }
    manuallyMutedRef.current = false;
    try {
      await player.play();
    } catch {
      setSoundOn(false);
    }
  }

  function changeVolume(value: number) {
    const next = Math.max(0, Math.min(100, value));
    volumeRef.current = next;
    setVolume(next);
    if (playerRef.current) playerRef.current.volume = next / 100;
  }

  return <MarketingAudioContext.Provider value={{ soundOn, volume, toggleSound, changeVolume }}>
    {children}
  </MarketingAudioContext.Provider>;
}

export function MarketingAudioControls() {
  const audio = useContext(MarketingAudioContext);
  if (!audio) throw new Error("MarketingAudioControls requires MarketingAudioProvider");
  const { soundOn, volume, toggleSound, changeVolume } = audio;
  return <div className="flex shrink-0 items-center gap-2">
    <Button size="icon-sm" variant="ghost" onClick={() => void toggleSound()} aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"} aria-pressed={soundOn} title={soundOn ? "Matikan suara" : "Nyalakan suara"}>
      {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </Button>
    <label htmlFor="dc-marketing-volume" className="sr-only">Volume suara</label>
    <input id="dc-marketing-volume" type="range" min="0" max="100" value={volume} onChange={(event) => changeVolume(Number(event.target.value))} className="w-14 cursor-pointer accent-[#C07A84] sm:w-20" aria-valuetext={volume + "%"} />
    <span className="hidden w-8 text-right font-[family-name:var(--font-dc-mono)] text-xs tabular-nums text-foreground/70 sm:block">{volume}%</span>
  </div>;
}
