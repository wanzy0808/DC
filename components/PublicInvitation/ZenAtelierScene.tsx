"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { displayTitleCase } from "@/lib/text/display-title-case";
import "./zen-atelier.css";

type ZenAtelierSceneProps = {
  names: string;
  date: string;
  stage: "envelope" | "cover";
  onOpen: () => void;
  preview?: boolean;
  isWedding?: boolean;
  hashtag?: string | null;
};
const root = "/templates/Zen%20Atelier/";

export default function ZenAtelierScene({ names, date, stage, onOpen, isWedding = true, hashtag }: ZenAtelierSceneProps) {
  const [opening, setOpening] = useState(false);
  const title = displayTitleCase(names);
  const couple = isWedding ? title.split(/\s*&\s*/).filter(Boolean) : [];
  return (
    <section data-invitation-section={stage} className={`zen-scene zen-${stage}`} data-opening={opening || undefined}>
      {stage === "envelope" ? <>
        <div className="zen-envelope-object" aria-hidden="true">
          {/* One original paper-and-wax-seal photograph; identical crops form the movable folds. */}
          <Image width={1122} height={1402} sizes="(max-width: 640px) 100vw, 672px" src={root + "amplop1.png"} alt="" fetchPriority="high" className="zen-envelope-back" />
          <div className="zen-letter"><span>{title}</span><small>{date}</small></div>
          <Image width={1122} height={1402} sizes="(max-width: 640px) 100vw, 672px" src={root + "amplop1.png"} alt="" className="zen-envelope-flap" />
          <Image width={1122} height={1402} sizes="(max-width: 640px) 100vw, 672px" src={root + "amplop1.png"} alt="" className="zen-envelope-front" />
        </div>
        <div className="zen-envelope-heading">
          <p className="zen-envelope-greeting">Sebuah undangan<br />untuk orang istimewa</p>
          <span className="zen-envelope-rule" aria-hidden="true" />
        </div>
        <button type="button" disabled={opening} className="zen-open" onClick={() => { setOpening(true); onOpen(); }}>
          <span className="zen-envelope-action-icon" aria-hidden="true"><span>✉</span></span>
          <span>Buka Undangan</span>
        </button>
      </> : <>
        <Image width={1254} height={1254} sizes="(max-width: 640px) 75vw, 420px" src={root + "bunga0001.png"} alt="" aria-hidden="true" fetchPriority="high" className="zen-cover-blossom" />
        <div className="zen-cover-copy">
          <p className="zen-kicker">{isWedding ? "The Wedding Of" : "Sebuah Undangan"}</p>
          <h1>{couple.length === 2 ? <><span>{couple[0]}</span><em>&amp;</em><span>{couple[1]}</span></> : <span>{title}</span>}</h1>
          <p className="zen-cover-date">{date}</p>
          {hashtag?.trim() && <p className="zen-hashtag">{hashtag}</p>}
        </div>
        <Image width={1122} height={1402} sizes="(max-width: 640px) 100vw, 672px" src={root + "inkmountain.png"} alt="" aria-hidden="true" className="zen-cover-mountain" />
        <button type="button" aria-label="Ke bagian berikutnya" className="zen-scroll" onClick={(event) => {
          event.currentTarget.closest('section')?.nextElementSibling?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        }}><ArrowDown size={19} aria-hidden="true" /></button>
      </>}
    </section>
  );
}
