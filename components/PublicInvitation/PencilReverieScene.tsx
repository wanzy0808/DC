"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDown, Play } from "lucide-react";
import Image from "next/image";
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
  return <Image aria-hidden="true" alt="" src={root + file} width={1254} height={1254} sizes="(max-width: 640px) 65vw, 380px" className={className} priority={eager} />;
}

function Scribble({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" className={"pr-scribble " + className} viewBox="0 0 92 86" fill="none">
    <path d="M47 73C15 47 5 31 18 19c11-10 24 1 29 10 12-21 28-19 35-7 11 17-11 37-35 51Z" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m4 9 12-4M76 5l11 8M5 66l11 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>;
}

/** Light-weight pencil skyline to anchor illustrations without relying on any user photo. */
function SketchTown({ className = "" }: { className?: string }) {
  return <svg className={"pr-sketch-town " + className} viewBox="0 0 600 315" aria-hidden="true" preserveAspectRatio="xMidYMax slice" fill="none">
    <path d="M0 243 27 238V159h38v-20h28v93h15V115h30v-20h20v137h14V186h25v47h13V144h22v-43l15-20 16 20v43h28v94h14V182h37v55h14V135h35v-28h18V84l15-14 15 14v23h21v135h14V168h27v-36h37v107h21V175h34v66h31" stroke="currentColor" strokeWidth="1.65"/>
    <path d="M18 245V181h16m14 65v-61h15M110 245V137h23m-12-19v-9m105 135V158h25m-12-62v-42m7 5V38m-28 75h53m-37-15 12-9 13 9m-16 28v100m-14-91h28m-27 20h24m-25 18h28m53 70v-77h25m-18-55V92m-5 7 11-7 11 7m-7-5V80m-11 38h33M416 242v-119h33m-16-54V48m-11 44h22m-11-29-14 23 14 14 14-14-14-23m-12 33h24m-15 50h21m-21 18h21m-21 18h21m-4 18h-11" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M0 245c86-8 150 0 203 0 55 0 95-7 149-9 66-1 166 8 248-1M0 253h600M0 270c105-13 186-13 288-10 93 3 176-4 312-7M0 289c91-11 182-8 249-9 132-2 190 2 351-8M0 309c104-9 202-8 309-11 120-4 174-6 291-7" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M0 258q38-22 75-3t75-1q39-26 76 1t75-2q39-26 75-2t75-2q48-26 89 0t60-1M0 279q45-22 90-4t80-3q42-16 82 1t73 0q42-15 80 1t80-2q46-21 115-3" stroke="currentColor" strokeWidth=".9" opacity=".6"/>
    {Array.from({length:21},(_,i)=><path key={i} d={"M"+(18+i*27)+" "+(182+(i%4)*9)+" v"+(17+(i%3)*5)+" m-4 -8 h8"} stroke="currentColor" strokeWidth="1" opacity=".64"/>)}
    <path d="M1 241c84-20 138-19 211 0M273 238q38-18 67-5t53 6M471 241q69-22 128-2" stroke="currentColor" strokeDasharray="3 4" opacity=".4"/>
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
  const [active, setActive] = useState(true);
  const sceneRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  const couple = isWedding ? names.split(/\s*&\s*/).filter(Boolean) : [];
  const openInvitation = () => {
    if (opening) return;
    setOpening(true);
    // Play music on the actual click; the shared renderer completes this staged opening.
    onOpen();
  };
  const goNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest("section")?.nextElementSibling?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return <section ref={sceneRef} data-invitation-section={stage} data-pr-opening={opening || undefined} data-pr-active={active}
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
      <SketchTown className="pr-cover-town"/>
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
