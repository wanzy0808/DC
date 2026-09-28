"use client";

import Image from "next/image";
import { useState } from "react";
import { MailOpen } from "lucide-react";
import { displayTitleCase } from "@/lib/text/display-title-case";
import { BlossomBranch, EnsoSun, InkMountains } from "@/components/PublicInvitation/ZenAtelierArtwork";
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

export default function ZenAtelierScene({ names, date, stage, onOpen, preview = false, isWedding = true, hashtag }: ZenAtelierSceneProps) {
  const [opening, setOpening] = useState(false);
  const title = displayTitleCase(names);
  const couple = isWedding ? title.split(/\s*&\s*/).filter(Boolean) : [];
  return (
    <section data-invitation-section={stage} className={`zen-scene zen-${stage}`} data-opening={opening || undefined}>
      {stage === "envelope" ? <>
        <div className="zen-jp-atmosphere" aria-hidden="true" data-studio-native-object="object:envelope:atmosphere-group">
          <div className="zen-jp-shoji" data-studio-native-object="object:envelope:shoji" />
          <EnsoSun className="zen-jp-sun" studioObject="object:envelope:sun" />
          <BlossomBranch className="zen-jp-branch" studioObject="object:envelope:branch" />
          <InkMountains className="zen-jp-mountains" studioObject="object:envelope:mountains" />
        </div>
        <div className="zen-jp-intro" data-studio-native-object="object:envelope:intro-group">
          <span className="zen-jp-kicker" lang="ja" data-studio-native-object="object:envelope:kicker">{isWedding ? "結婚式のご案内" : "ご招待"}</span>
          <p className="zen-envelope-greeting" data-studio-native-object="object:envelope:greeting">Sebuah undangan<br />untuk orang istimewa</p>
          <span className="zen-envelope-rule" aria-hidden="true" data-studio-native-object="object:envelope:intro-rule" />
        </div>
        <div className="zen-jp-paper-stage" aria-hidden="true" data-studio-native-object="object:envelope:paper-stage">
          <div className="zen-jp-envelope-shell" data-studio-native-object="object:envelope:shell" />
          <div className="zen-jp-letter" data-studio-native-object="object:envelope:letter">
            <span className="zen-jp-letter-kicker" data-studio-native-object="object:envelope:letter-kicker">ZEN ATELIER</span>
            <span className="zen-jp-letter-names" data-studio-native-object="object:envelope:names">{title}</span>
            <span className="zen-jp-letter-rule" data-studio-native-object="object:envelope:letter-rule" />
            <span className="zen-jp-letter-date" data-studio-native-object="object:envelope:date">{date}</span>
          </div>
          <div className="zen-jp-fold-left" data-studio-native-object="object:envelope:fold-left" />
          <div className="zen-jp-fold-right" data-studio-native-object="object:envelope:fold-right" />
          <div className="zen-jp-fold-bottom" data-studio-native-object="object:envelope:fold-bottom" />
          <div className="zen-jp-fold-top" data-studio-native-object="object:envelope:fold-top" />
          <div className="zen-jp-mizuhiki-band" data-studio-native-object="object:envelope:mizuhiki">
            <svg className="zen-jp-mizuhiki" viewBox="0 0 260 94" fill="none" focusable="false">
              <path d="M0 49C55 49 83 49 110 45c18-3 34-18 48-22 12-4 28 0 30 13 2 14-19 25-37 21-18-4-40-26-30-39 10-13 34 1 44 14 14 20 32 19 95 19" stroke="var(--jp-accent)" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 55c58 0 84-2 113-6 22-3 34 26 54 27 21 2 27-14 17-27-12-14-47-9-45 7 2 12 28 17 47 12 23-7 42-12 74-13" stroke="var(--jp-soft)" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M0 43c56 1 80 4 115 9 22 4 39-30 59-28 17 1 19 15 8 25-14 14-42 10-51-4-10-17 10-26 27-24 24 3 30 24 102 22" stroke="color-mix(in srgb,var(--jp-accent) 55%,var(--jp-paper))" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M0 60c55-2 89-7 114-12 22-6 36 9 51 10 23 2 42-5 95-4" stroke="color-mix(in srgb,var(--jp-soft) 80%,var(--jp-paper-ink))" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="zen-jp-seal" lang="ja" data-studio-native-object="object:envelope:seal">{isWedding ? "寿" : "和"}</span>
          </div>
        </div>
        <button type="button" disabled={opening} className="zen-open" data-studio-system-action={preview ? "open-invitation" : undefined} data-studio-native-object="object:envelope:open-button" onClick={() => {
          if (preview) return;
          setOpening(true);
          onOpen();
        }}>
          <span className="zen-envelope-action-icon" aria-hidden="true"><MailOpen size={17} strokeWidth={1.35} /></span>
          <span>Buka Undangan</span>
        </button>
      </> : <>
        <Image width={1254} height={1254} sizes="(max-width: 640px) 75vw, 420px" src={root + "bunga0001.png"} alt="" aria-hidden="true" fetchPriority="high" className="zen-cover-blossom" data-studio-native-object="object:cover:blossom" />
        <div className="zen-cover-copy" data-studio-native-object="object:cover:copy-group">
          <p className="zen-kicker" data-studio-native-object="object:cover:kicker">{isWedding ? "The Wedding Of" : "Sebuah Undangan"}</p>
          <h1 data-studio-native-heading="">{couple.length === 2 ? <><span>{couple[0]}</span><em>&amp;</em><span>{couple[1]}</span></> : <span>{title}</span>}</h1>
          <p className="zen-cover-date" data-studio-native-object="object:cover:date">{date}</p>
          {hashtag?.trim() && <p className="zen-hashtag" data-studio-native-object="object:cover:hashtag">{hashtag}</p>}
        </div>
        <Image width={1122} height={1402} sizes="(max-width: 640px) 100vw, 672px" src={root + "inkmountain.png"} alt="" aria-hidden="true" className="zen-cover-mountain" data-studio-native-object="object:cover:mountains" />
      </>}
    </section>
  );
}
