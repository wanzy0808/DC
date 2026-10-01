"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { BotanicalRomanceMark } from "@/components/PublicInvitation/BotanicalIvoryArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

const keepsakes = [
  {
    id: "promise",
    group: "specimenOne-group",
    artKey: "specimen-branch-art",
    eyebrow: "Dua Hati",
    title: "Dua hati, satu janji",
    copy: "Sebuah janji bukan hanya diucapkan, tetapi dipilih lagi pada setiap hari yang datang.",
    motif: "rings",
  },
  {
    id: "day",
    group: "specimenTwo-group",
    artKey: "specimen-fern-art",
    eyebrow: "Satu Hari",
    title: "Satu hari, satu selamanya",
    copy: "Di antara banyak tanggal, ada satu hari yang kami simpan untuk dikenang bersama.",
    motif: "ribbon",
  },
] as const;

/** A photo-free romantic keepsake gallery. Native scroll provides touch swiping. */
export default function BotanicalIvoryGallery() {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const go = (next: number, instant = false) => {
    const track = rail.current;
    const target = track?.children[Math.max(0, Math.min(keepsakes.length - 1, next))] as HTMLElement | undefined;
    if (track && target) track.scrollTo({ left: target.offsetLeft, behavior: reduced || instant ? "instant" : "smooth" });
  };

  return <div className="bi-keepsake" role="region" aria-label={tr("Galeri Kisah")}>
    <div className="bi-keepsake-track" role="group" aria-label={tr("Galeri Kisah")} ref={rail} tabIndex={0} onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        go(index + (event.key === "ArrowRight" ? 1 : -1), true);
      }
    }} onScroll={() => {
      const track = rail.current;
      if (!track) return;
      const closest = Array.from(track.children).reduce((best, child, i) => Math.abs((child as HTMLElement).offsetLeft - track.scrollLeft) < Math.abs((track.children[best] as HTMLElement).offsetLeft - track.scrollLeft) ? i : best, 0);
      setIndex(closest);
    }}>
      {keepsakes.map((item) => <article key={item.id} className="bi-keepsake-page" data-studio-native-object={`object:gallery:${item.group}`}>
        <div className="bi-keepsake-sheet">
          <p data-studio-native-object={`object:gallery:${item.id}-eyebrow`} className="bi-keepsake-eyebrow">{tr(item.eyebrow)}</p>
          {item.motif === "rings"
            ? <BotanicalRomanceMark objectKey={`object:gallery:${item.artKey}`} className="bi-keepsake-rings" />
            : <span aria-hidden="true" data-studio-native-object={`object:gallery:${item.artKey}`} className="bi-ribbon-mark"><span /><span /><span /></span>}
          <h3 data-studio-native-object={`object:gallery:${item.id}-label`} className="bi-keepsake-title">{tr(item.title)}</h3>
          <p data-studio-native-object={`object:gallery:${item.id}-copy`} className="bi-keepsake-card-copy">{tr(item.copy)}</p>
        </div>
      </article>)}
    </div>

    <div className="bi-keepsake-controls">
      <p className="bi-keepsake-position" aria-live="polite">{index + 1} / {keepsakes.length}</p>
      <div>
        <button type="button" className="bi-gallery-arrow" aria-label={tr("Kisah Sebelumnya")} disabled={index === 0} onClick={(event) => go(index - 1, event.detail === 0)}><ChevronLeft size={19} /></button>
        <button type="button" className="bi-gallery-arrow" aria-label={tr("Kisah Berikutnya")} disabled={index === keepsakes.length - 1} onClick={(event) => go(index + 1, event.detail === 0)}><ChevronRight size={19} /></button>
      </div>
    </div>

    <p data-studio-native-object="object:gallery:memory-copy" className="bi-keepsake-copy">{tr("Tanpa foto pun, setiap detail kecil dapat menyimpan rasa dari hari yang sedang kami nantikan.")}</p>
  </div>;
}
