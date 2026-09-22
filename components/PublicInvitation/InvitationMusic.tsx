"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Music2, Volume2, VolumeX } from "lucide-react";

export type InvitationMusicHandle = { playOnOpen: () => void };

type InvitationMusicProps = {
  source: string;
  opened: boolean;
  preview: boolean;
};

/**
 * One audio element per opened invitation, outside the conditional envelope.
 * The open button is a real user gesture: start playback in that same handler,
 * not in an effect after the envelope renders (which browsers may block).
 * Studio/gallery previews never start automatically.
 */
const InvitationMusic = forwardRef<InvitationMusicHandle, InvitationMusicProps>(
  function InvitationMusic({ source, opened, preview }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      const audio = audioRef.current;
      const stopOtherInvitation = (event: Event) => {
        const other = (event as CustomEvent<{ player: HTMLAudioElement }>).detail?.player;
        if (audio && other && other !== audio) audio.pause();
      };
      const pauseWhenHidden = () => {
        if (document.hidden) audio?.pause();
      };
      window.addEventListener("dc-invitation-music-play", stopOtherInvitation);
      document.addEventListener("visibilitychange", pauseWhenHidden);
      return () => {
        window.removeEventListener("dc-invitation-music-play", stopOtherInvitation);
        document.removeEventListener("visibilitychange", pauseWhenHidden);
        audio?.pause();
      };
    }, []);

    useEffect(() => {
      // A new song selection must not leave the old track playing.
      setFailed(false);
      setPlaying(false);
    }, [source]);

    const start = () => {
      const audio = audioRef.current;
      if (!audio || failed) return;
      void audio.play().catch(() => setPlaying(false));
    };

    // React 19 accepts refs on components; forwardRef also works with older clients.
    useEffect(() => {
      if (ref && typeof ref !== "function") ref.current = {
        playOnOpen: () => { if (!preview) start(); },
      };
      return () => {
        if (ref && typeof ref !== "function") ref.current = null;
      };
    });

    const toggle = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) start();
      else audio.pause();
    };

    return (
      <>
        <audio
          ref={audioRef}
          src={source}
          loop
          preload="none"
          onPlay={(event) => {
            setFailed(false);
            setPlaying(true);
            window.dispatchEvent(new CustomEvent("dc-invitation-music-play", { detail: { player: event.currentTarget } }));
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
        {opened && (
          <div className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full border border-white/35 bg-[#23191f]/90 px-2 py-1.5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.24)] backdrop-blur-md sm:bottom-6 sm:right-6">
            <Music2 aria-hidden="true" className="ml-1 size-4 text-[#f6d3dc]" />
            <span className="text-[11px] font-medium">Musik</span>
            <button
              type="button"
              onClick={toggle}
              disabled={failed}
              aria-label={failed ? "Musik tidak tersedia" : playing ? "Jeda musik undangan" : "Putar musik undangan"}
              aria-pressed={playing}
              title={failed ? "Musik tidak tersedia" : playing ? "Jeda musik" : "Putar musik"}
              className="flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6d3dc] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {playing ? <Volume2 aria-hidden="true" className="size-5" /> : <VolumeX aria-hidden="true" className="size-5" />}
            </button>
          </div>
        )}
      </>
    );
  },
);

export default InvitationMusic;
