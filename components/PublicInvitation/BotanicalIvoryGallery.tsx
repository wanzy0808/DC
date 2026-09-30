"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { BotanicalArt } from "@/components/PublicInvitation/BotanicalIvoryArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

const specimens = [
  { id: "branch", group: "specimenOne-group", title: "Tangkai Berbunga", variant: "branch" },
  { id: "fern", group: "specimenTwo-group", title: "Pakis Muda", variant: "fern" },
] as const;

/** An artwork gallery for this no-photo theme. Native scroll provides touch swiping. */
export default function BotanicalIvoryGallery() {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const go = (next: number, instant = false) => {
    const track = rail.current;
    const target = track?.children[Math.max(0, Math.min(specimens.length - 1, next))] as HTMLElement | undefined;
    if (track && target) track.scrollTo({ left: target.offsetLeft, behavior: reduced || instant ? "instant" : "smooth" });
  };
  return <div className="bi-herbarium" role="region" aria-label={tr("Galeri Botani")}>
    <div className="bi-herbarium-track" role="group" aria-label={tr("Galeri Botani")} ref={rail} tabIndex={0} onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(index + (event.key === "ArrowRight" ? 1 : -1), true); }
    }} onScroll={() => {
      const track = rail.current;
      if (!track) return;
      const closest = Array.from(track.children).reduce((best, child, i) => Math.abs((child as HTMLElement).offsetLeft - track.scrollLeft) < Math.abs((track.children[best] as HTMLElement).offsetLeft - track.scrollLeft) ? i : best, 0);
      setIndex(closest);
    }}>
      {specimens.map((item) => <div key={item.id} className="bi-herbarium-page" data-studio-native-object={`object:gallery:${item.group}`}>
        <figure className="bi-herbarium-sheet">
          <BotanicalArt objectKey={`object:gallery:specimen-${item.id}-art`} variant={item.variant} className="bi-herbarium-art" />
          <figcaption data-studio-native-object={`object:gallery:specimen-${item.id}-label`}>{tr(item.title)}</figcaption>
        </figure>
      </div>)}
    </div>
    <div className="bi-herbarium-controls">
      <p className="bi-herbarium-position" aria-live="polite">{index + 1} / {specimens.length}</p>
      <div><button type="button" className="bi-gallery-arrow" aria-label={tr("Ilustrasi Sebelumnya")} disabled={index === 0} onClick={(event) => go(index - 1, event.detail === 0)}><ChevronLeft size={19} /></button>
        <button type="button" className="bi-gallery-arrow" aria-label={tr("Ilustrasi Berikutnya")} disabled={index === specimens.length - 1} onClick={(event) => go(index + 1, event.detail === 0)}><ChevronRight size={19} /></button></div>
    </div>
    <p data-studio-native-object="object:gallery:memory-copy" className="bi-herbarium-copy">{tr("Kenangan indah hadir dalam setiap momen yang kita rayakan bersama.")}</p>
  </div>;
}
