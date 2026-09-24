"use client";

import { useState } from "react";
import { displayTitleCase } from "@/lib/text/display-title-case";

type ZenAtelierSceneProps = {
  names: string;
  date: string;
  stage: "envelope" | "cover";
  onOpen: () => void;
  preview?: boolean;
  isWedding?: boolean;
};

const root = "/templates/";
const paper = "radial-gradient(ellipse at 50% 20%, var(--inv-scene-surface, #fffaf0) 0%, var(--inv-scene-bg, #f3eddf) 75%, var(--inv-scene-soft, #e7dfd0) 100%)";

/**
 * The artwork is the real Zen Atelier set in public/templates, not generated SVG
 * substitutes. The frame is deliberately independent of the shared RSVP/data engine.
 */
export default function ZenAtelierScene({ names, date, stage, onOpen, preview = false, isWedding = true }: ZenAtelierSceneProps) {
  const envelope = stage === "envelope";
  const [opening, setOpening] = useState(false);
  const title = displayTitleCase(names);
  const occasion = isWedding ? "The Wedding of" : "Sebuah Undangan";
  const open = () => {
    if (opening) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onOpen();
      return;
    }
    setOpening(true);
    window.setTimeout(onOpen, 420);
  };

  return (
    <section
      data-invitation-section={stage}
      aria-label={envelope ? "Amplop undangan Zen Atelier" : "Sampul undangan Zen Atelier"}
      className="relative isolate flex min-h-[760px] flex-col items-center overflow-hidden px-6 pb-16 pt-14 text-center sm:px-12"
      style={{
        background: "var(--inv-scene-bg, #f3eddf)",
        color: "var(--inv-scene-ink, #343b34)",
        backgroundImage: paper,
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#a4987b]/50 sm:inset-5" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[17px] border border-[#c5bda8]/45 sm:inset-[26px]" />
      <img src={root + "bamboo1.png"} alt="" loading="lazy" aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 z-[1] w-[65%] max-w-[360px] object-contain opacity-70 sm:-right-14" />
      <img src={root + "bunga0001.png"} alt="" loading="lazy" aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-16 z-[1] w-[46%] max-w-[260px] object-contain opacity-80" />
      <p className="relative z-10 text-[10px] font-medium uppercase tracking-[.4em] text-[#716c5e]">Zen Atelier</p>

      {envelope ? (
        <>
          <p className="relative z-10 mt-8 text-[11px] uppercase tracking-[.28em] text-[#9b5240]">Sebuah undangan untukmu</p>
          <div className={`relative z-10 mt-8 flex w-full max-w-[450px] flex-col items-center transition duration-500 ${opening ? "-translate-y-8 scale-105 opacity-0" : ""}`}>
            <div className="relative aspect-[4/5] w-full max-w-[340px] drop-shadow-[0_22px_20px_rgba(70,58,43,.15)]">
              <img src={root + "amplop1.png"} alt="Ilustrasi amplop undangan Zen Atelier" className="absolute inset-0 h-full w-full object-contain" fetchPriority="high" />
            </div>
            <div className="relative -mt-5 w-full border border-[#c6b99e] bg-[#faf6ec]/95 px-4 py-8 shadow-[0_18px_40px_rgba(70,58,43,.12)] backdrop-blur-[2px] sm:-mt-8">
              <p className="text-[10px] uppercase tracking-[.32em] text-[#9b5240]">{occasion}</p>
              <h1 className="mx-auto mt-4 max-w-sm break-words text-[clamp(1.85rem,7vw,2.9rem)] leading-[1.18]" style={{ fontFamily: "var(--inv-heading, Georgia), Georgia, serif" }}>{title}</h1>
              <span aria-hidden="true" className="mx-auto my-5 block h-px w-16 bg-[#a9513b]" />
              <p className="text-[12px] tracking-[.12em]">{date}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={open}
            disabled={opening}
            className="relative z-20 mt-9 min-h-12 border border-[var(--inv-scene-accent,#a9513b)] bg-[var(--inv-scene-accent,#a9513b)] px-8 py-3 text-[12px] font-semibold tracking-[.18em] text-white shadow-[0_8px_20px_rgba(169,81,59,.17)] transition hover:-translate-y-1 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--inv-scene-accent,#a9513b)] disabled:cursor-wait disabled:opacity-60"
          >
            Buka Undangan
          </button>
          {preview && <p className="relative z-10 mt-4 text-[11px] text-[#716c5e]">Pratinjau undangan</p>}
        </>
      ) : (
        <>
          <p className="relative z-10 mt-6 text-[11px] uppercase tracking-[.3em] text-[#9b5240]">{occasion}</p>
          <div className="relative mt-8 h-[330px] w-full max-w-[440px] overflow-hidden border border-[#afa48d] bg-[#e7e7d9] shadow-[0_23px_55px_rgba(58,57,47,.12)] sm:h-[390px]">
            <img src={root + "japanroom1.png"} alt="" loading="eager" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f6eee3]/25 via-transparent to-[#f3eddf]/50" />
            <img src={root + "redsun1.png"} alt="" loading="lazy" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[6%] h-[56%] w-[70%] -translate-x-1/2 object-contain opacity-90" />
            <img src={root + "inkmountain.png"} alt="" loading="lazy" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] w-full object-cover object-bottom opacity-80" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#fff8e7]/65" />
          </div>
          <div className="relative z-10 -mt-8 w-[94%] max-w-[400px] border border-[#bfb49d] bg-[#faf6ed]/95 px-5 py-9 shadow-[0_12px_35px_rgba(58,57,47,.09)] backdrop-blur-[2px]">
            <p className="text-[10px] uppercase tracking-[.35em] text-[#9b5240]">Dua hati, satu cerita</p>
            <h1 className="mt-4 break-words text-[clamp(2rem,8vw,3.4rem)] leading-[1.12]" style={{ fontFamily: "var(--inv-heading, Georgia), Georgia, serif" }}>{title}</h1>
            <p className="mt-5 text-xs tracking-[.19em]">{date}</p>
          </div>
          <p className="relative z-10 mt-8 text-[10px] uppercase tracking-[.32em] text-[#827761]">Scroll untuk melihat undangan</p>
          <span aria-hidden="true" className="relative z-10 mt-5 h-10 w-px bg-[#a9513b]/65" />
        </>
      )}
    </section>
  );
}
