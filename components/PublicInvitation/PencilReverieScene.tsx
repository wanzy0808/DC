"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Play } from "lucide-react";
import "./pencil-reverie.css";

/**
 * All artwork is hand-drawn/illustrative: this is a no-photo template.
 * Scene text is event data, not names baked into artwork.
 */
const root = "/templates/pencil-reverie/";
type Props = {
  stage: "cover" | "envelope";
  names: string;
  date: string;
  onOpen: () => void;
  isWedding?: boolean;
  hashtag?: string | null;
};

function Art({ file, className, eager = false }: { file: string; className: string; eager?: boolean }) {
  return <img aria-hidden="true" alt="" src={root + file} className={className} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function Scribble({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" className={"pr-scribble " + className} viewBox="0 0 92 86" fill="none">
    <path d="M47 73C15 47 5 31 18 19c11-10 24 1 29 10 12-21 28-19 35-7 11 17-11 37-35 51Z" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m4 9 12-4M76 5l11 8M5 66l11 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>;
}

function BackwardClock({ className = "" }: { className?: string }) {
  return <span className={"pr-clock-art " + className} aria-hidden="true">
    <span className="pr-clock-face"/><span className="pr-clock-hand pr-clock-hour"/>
    <span className="pr-clock-hand pr-clock-minute"/><span className="pr-clock-dot"/>
  </span>;
}

export default function PencilReverieScene({
  stage, names, date, onOpen, isWedding = true, hashtag,
}: Props) {
  const [opening, setOpening] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (openTimer.current !== null) clearTimeout(openTimer.current); }, []);

  const couple = isWedding ? names.split(/\s*&\s*/).filter(Boolean) : [];
  const openInvitation = () => {
    if (opening) return;
    setOpening(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onOpen();
    } else {
      openTimer.current = setTimeout(onOpen, 1050);
    }
  };
  const goNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest("section")?.nextElementSibling?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return <section data-invitation-section={stage} data-pr-opening={opening || undefined}
    className={"pr-scene pr-" + stage}>
    <div className="pr-paper-fibers" aria-hidden="true"/>
    {stage === "envelope" ? <>
      <header className="pr-letter-intro">
        <span className="pr-overline">A LITTLE STORY OF US</span>
        <p>Setiap cerita punya awalnya.</p>
        <Scribble className="pr-letter-heart"/>
      </header>
      <div className="pr-letter-stage" aria-hidden="true">
        <Art file="loveballon1.png" className="pr-letter-balloons"/>
        <Art file="polaroidlove.png" className="pr-letter-polaroid" eager/>
        <Art file="couplesitting.png" className="pr-letter-couple" eager/>
        <Art file="loveticket.png" className="pr-letter-ticket"/>
        <div className="pr-letter-cassette"><Art file="casette.png" className="pr-letter-cassette-img"/>
          <span className="pr-reel pr-reel-one"/><span className="pr-reel pr-reel-two"/>
        </div>
        <Art file="ribbon.png" className="pr-letter-ribbon"/>
        <Art file="camera1.png" className="pr-letter-camera"/>
        <span className="pr-pencil-note">press play<br/>on our story ♡</span>
        <span className="pr-paper-tape pr-paper-tape-a"/>
        <span className="pr-paper-tape pr-paper-tape-b"/>
      </div>
      <button type="button" disabled={opening} onClick={openInvitation} className="pr-open-button">
        <Play size={15} fill="currentColor" aria-hidden="true"/> Buka Undangan
      </button>
      <p className="pr-open-hint">Ketuk untuk membuka cerita</p>
    </> : <>
      <Art file="streetlamp.png" className="pr-cover-lamp" eager/>
      <Art file="loveballon1.png" className="pr-cover-balloons"/>
      <Art file="polaroidlove.png" className="pr-cover-polaroid"/>
      <Art file="bycicle.png" className="pr-cover-bicycle" eager/>
      <Art file="couplesitting.png" className="pr-cover-couple" eager/>
      <Art file="bookstack.png" className="pr-cover-books"/>
      <Art file="camera1.png" className="pr-cover-camera"/>
      <Art file="loveticket.png" className="pr-cover-ticket"/>
      <BackwardClock className="pr-cover-clock"/>
      <Scribble className="pr-cover-heart"/>
      <span className="pr-cover-handnote">same hearts,<br/>brighter tomorrows.</span>
      <div className="pr-cover-copy">
        <span className="pr-overline">{isWedding ? "THE WEDDING OF" : "YOU ARE INVITED"}</span>
        <h1 className="pr-cover-names">{couple.length === 2
          ? <><span>{couple[0]}</span><em>&amp;</em><span>{couple[1]}</span></>
          : <span>{names}</span>}</h1>
        <p className="pr-cover-date">{date}</p>
        {hashtag?.trim() && <p className="pr-cover-hashtag">{hashtag}</p>}
      </div>
      <button type="button" className="pr-scroll-down" onClick={goNext} aria-label="Ke bagian berikutnya">
        <ArrowDown size={19} aria-hidden="true"/>
      </button>
    </>}
  </section>;
}
