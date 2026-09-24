"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { ArrowDown, Play } from "lucide-react";
import "./pencil-reverie.css";

const assetRoot = "/templates/pencil-reverie/";

type SceneProps = {
  stage: "envelope" | "cover";
  names: string;
  date: string;
  onOpen: () => void;
  isWedding?: boolean;
  hashtag?: string | null;
};

/**
 * The artwork is a complete drawing, not a cropped CSS background.
 * In particular bungaandlampbg.png contains the ENTIRE lantern and its bracket.
 * The 1122x1402 paper illustrations have their own aspect ratio and remain in flow.
 */
function PaperIllustration({ file, priority = false, className = "" }: { file: string; priority?: boolean; className?: string }) {
  return <Image src={assetRoot + file} alt="" aria-hidden="true" width={1122} height={1402}
    sizes="(max-width: 640px) 100vw, 560px" priority={priority} className={className}/>;
}

function HeartDoodle() {
  return <svg className="pr-heart-doodle" aria-hidden="true" viewBox="0 0 64 62" fill="none">
    <path d="M31 56C16 41 3 30 6 18 10 1 25 7 32 21 41 2 56 8 59 20c3 14-17 30-28 36Z"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

export default function PencilReverieScene({
  stage, names, date, onOpen, isWedding = true, hashtag,
}: SceneProps) {
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const couple = isWedding ? names.split(/\s*&\s*/).filter(Boolean) : [];
  const longName = names.length > 29 || couple.some((name) => name.length > 17);
  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    // The shared parent starts user-selected music synchronously with this click.
    onOpen();
  };
  const scrollNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest("section")?.nextElementSibling?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return <section ref={rootRef} data-invitation-section={stage} data-pr-opening={opening || undefined}
    data-pr-active={visible} data-pr-long={longName} className={"pr-scene pr-" + stage}>
    {stage === "envelope" ? <>
      <div className="pr-gate-intro">
        <span className="pr-overline">A LITTLE STORY OF US</span>
        <p>Setiap cerita punya awalnya.</p>
      </div>
      <div className="pr-letter-illustration">
        <PaperIllustration file="bingkai.png" priority className="pr-letter-paper"/>
        <div className="pr-letter-copy">
          <p>Untuk momen istimewa</p>
          <h1>{names}</h1>
          <span>{date}</span>
        </div>
        <HeartDoodle/>
      </div>
      <button className="pr-open-button" type="button" onClick={handleOpen} disabled={opening}>
        <Play size={15} aria-hidden="true" fill="currentColor"/> Buka Undangan
      </button>
    </> : <>
      <header className="pr-cover-heading">
        <span className="pr-overline">{isWedding ? "THE WEDDING OF" : "SEBUAH UNDANGAN"}</span>
      </header>
      <div className="pr-cover-illustration">
        <PaperIllustration file="bungaandlampbg.png" priority className="pr-cover-paper"/>
        <div className="pr-cover-copy">
          <h1 className="pr-cover-names">{couple.length === 2
            ? <><span>{couple[0]}</span><em>&amp;</em><span>{couple[1]}</span></>
            : <span>{names}</span>}</h1>
          <p className="pr-cover-date">{date}</p>
          {hashtag?.trim() && <p className="pr-cover-hashtag">{hashtag}</p>}
        </div>
        <HeartDoodle/>
      </div>
      <div className="pr-cover-end"><span>Every little moment matters.</span>
        <button className="pr-scroll-down" type="button" aria-label="Ke bagian berikutnya" onClick={scrollNext}>
          <ArrowDown size={18} aria-hidden="true"/>
        </button>
      </div>
    </>}
  </section>;
}
