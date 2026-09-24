"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./pencil-reverie.css";

const base = "/templates/pencil-reverie/";
const compositions: Record<string, { one: string; two?: string; three?: string; note?: string }> = {
  greeting: { one: "loveballon1.png", two: "loveticket.png", three: "ribbon.png" },
  identity: { one: "ribbon.png", two: "camera1.png", three: "loveballon1.png" },
  event: { one: "streetlamp.png", two: "loveticket.png", three: "ribbon.png" },
  dateTime: { one: "loveticket.png", two: "bookstack.png", three: "camera1.png" },
  gallery: { one: "loveballon1.png", two: "ribbon.png", three: "loveticket.png" },
  countdown: { one: "casette.png", two: "polaroidlove.png", three: "loveballon1.png" },
  location: { one: "streetlamp.png", two: "bycicle.png", three: "loveticket.png" },
  rsvp: { one: "loveticket.png", two: "loveballon1.png", three: "ribbon.png" },
  wishes: { one: "polaroidlove.png", two: "casette.png", three: "camera1.png" },
  gift: { one: "ribbon.png", two: "bookstack.png", three: "loveballon1.png" },
  closing: { one: "bookstack.png", two: "bycicle.png", three: "loveticket.png", note: "and every day after ♡" },
};
export function PencilSectionArt({ section }: { section: string }) {
  const art = compositions[section];
  if (!art) return null;
  return <div className="pr-section-art" data-part={section} aria-hidden="true">
    <img className="pr-art-one" src={base + art.one} alt="" loading="lazy" decoding="async" />
    {art.two && <img className="pr-art-two" src={base + art.two} alt="" loading="lazy" decoding="async"/>}
    {art.three && <img className="pr-art-three" src={base + art.three} alt="" loading="lazy" decoding="async"/>}
    {art.note && <span className="pr-art-note">{art.note}</span>}
  </div>;
}

export function PencilBackwardClock() {
  return <div className="pr-clock-art" aria-hidden="true">
    <span className="pr-clock-face"/><span className="pr-clock-hand pr-clock-hour"/>
    <span className="pr-clock-hand pr-clock-minute"/><span className="pr-clock-dot"/>
  </div>;
}

const illustratedMemories = [
  { image: "polaroidlove.png", label: "Pertemuan pertama" },
  { image: "bycicle.png", label: "Perjalanan bersama" },
  { image: "casette.png", label: "Lagu favorit" },
  { image: "camera1.png", label: "Kenangan kecil" },
  { image: "bookstack.png", label: "Cerita berikutnya" },
  { image: "loveballon1.png", label: "Hari-hari bahagia" },
];
export function PencilMemoryGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const [previousFocus, setPreviousFocus] = useState<HTMLElement | null>(null);
  const open = (index: number) => {
    setPreviousFocus(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setSelected(index);
  };
  const close = () => { setSelected(null); previousFocus?.focus(); };
  return <>
    <div className="pr-memory-grid">
      {illustratedMemories.map(({ image, label }, index) =>
        <button className="pr-polaroid-button" key={image} type="button" aria-label={"Lihat ilustrasi " + label}
          onClick={() => open(index)}>
          <span className="pr-polaroid-sheet">
            <img src={base + image} alt="" loading="lazy" decoding="async"/>
            <span className="pr-polaroid-caption">{label}</span>
          </span>
        </button>)}
    </div>
    <p className="pr-memory-note">Little things, big memories ♡</p>
    {selected !== null && <div className="pr-lightbox" role="dialog" aria-modal="true" aria-label="Ilustrasi kenangan"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
        if (event.key === "ArrowLeft") setSelected((selected + illustratedMemories.length - 1) % illustratedMemories.length);
        if (event.key === "ArrowRight") setSelected((selected + 1) % illustratedMemories.length);
        if (event.key === "Tab") {
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
          const position = controls.indexOf(document.activeElement as HTMLButtonElement);
          if (event.shiftKey && position <= 0) { event.preventDefault(); controls[controls.length - 1]?.focus(); }
          else if (!event.shiftKey && position === controls.length - 1) { event.preventDefault(); controls[0]?.focus(); }
        }
      }}>
      <button className="pr-lightbox-close" type="button" autoFocus aria-label="Tutup" onClick={close}><X size={22}/></button>
      <button type="button" className="pr-lightbox-previous" aria-label="Ilustrasi sebelumnya" onClick={() => setSelected((selected + illustratedMemories.length - 1) % illustratedMemories.length)}><ChevronLeft size={25}/></button>
      <figure><img src={base + illustratedMemories[selected].image} alt={"Ilustrasi " + illustratedMemories[selected].label}/><figcaption>{illustratedMemories[selected].label}</figcaption></figure>
      <button type="button" className="pr-lightbox-next" aria-label="Ilustrasi berikutnya" onClick={() => setSelected((selected + 1) % illustratedMemories.length)}><ChevronRight size={25}/></button>
    </div>}
  </>;
}
