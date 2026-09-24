"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "./pencil-reverie.css";

const root = "/templates/pencil-reverie/";
type Drawing = { file: string; width: number; height: number; caption: string };
const drawings: Record<string, Drawing> = {
  bingkai: { file:"bingkai.png", width:1122, height:1402, caption:"Surat kecil untukmu" },
  riverside: { file:"bungaandlampbg.png", width:1122, height:1402, caption:"Jalan kecil penuh cerita" },
  magnolia: { file:"bungabg.png", width:1122, height:1402, caption:"Bunga-bunga yang mekar" },
  blossoms: { file:"bungabg1.png", width:1122, height:1402, caption:"Hari yang penuh harapan" },
  bicycleScene: { file:"sepedabg.png", width:1122, height:1402, caption:"Perjalanan bersama" },
  lamp: { file:"streetlamp.png", width:1086, height:1448, caption:"Lampu jalan vintage" },
  couple: { file:"couplesitting.png", width:1122, height:1402, caption:"Sketsa pasangan" },
  bicycle: { file:"bycicle.png", width:1448, height:1086, caption:"Sepeda klasik" },
  camera: { file:"camera1.png", width:1254, height:1254, caption:"Kamera analog" },
  cassette: { file:"casette.png", width:1254, height:1254, caption:"Kaset nostalgia" },
  balloon: { file:"loveballon1.png", width:1254, height:1254, caption:"Balon hati" },
  ticket: { file:"loveticket.png", width:1448, height:1086, caption:"Tiket kenangan" },
  polaroid: { file:"polaroidlove.png", width:1254, height:1254, caption:"Polaroid kisah kita" },
  bow: { file:"ribbon.png", width:1254, height:1254, caption:"Pita merah muda" },
  books: { file:"bookstack.png", width:1254, height:1254, caption:"Buku-buku lama" },
};

// One COMPLETE drawing per section. Old artwork had three absolutely-positioned
// PNGs per section, so a lantern became nothing but its pole in narrow Studio canvases.
const sectionDrawings: Partial<Record<string, keyof typeof drawings>> = {
  greeting: "magnolia",
  identity: "polaroid",
  event: "riverside",
  dateTime: "ticket",
  countdown: "cassette",
  location: "lamp",
  rsvp: "blossoms",
  wishes: "balloon",
  gift: "bow",
  closing: "bicycleScene",
};

export function PencilSectionArt({ section }: { section: string }) {
  const id = sectionDrawings[section];
  if (!id) return null;
  const art = drawings[id];
  return <figure className="pr-section-art" data-part={section} aria-hidden="true">
    <Image src={root+art.file} width={art.width} height={art.height}
      sizes="(max-width: 640px) 88vw, 510px" loading="lazy" alt="" className="pr-section-whole-image"/>
  </figure>;
}

export function PencilBackwardClock() {
  return <div className="pr-clock-art" aria-hidden="true">
    <span className="pr-clock-face"/><span className="pr-clock-hand pr-clock-hour"/>
    <span className="pr-clock-hand pr-clock-minute"/><span className="pr-clock-dot"/>
  </div>;
}

// This is a gallery of supplied ILLUSTRATIONS, not the couple's real photographs
// or fabricated personal memories. The no-photo template has no customer photo slots.
const gallery: Drawing[] = [
  drawings.bicycleScene, drawings.couple, drawings.camera, drawings.books,
  drawings.cassette, drawings.bicycle, drawings.balloon, drawings.ticket,
  drawings.polaroid, drawings.magnolia,
];

export function PencilMemoryGallery() {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const beginTouch = useRef<number | null>(null);
  const open = (i: number, button: HTMLButtonElement) => {trigger.current=button;setIndex(i);};
  const close = () => {setIndex(null);requestAnimationFrame(()=>trigger.current?.focus());};
  const shift = (direction: number) => setIndex((old)=>old===null?null:(old+direction+gallery.length)%gallery.length);

  useEffect(()=>{
    if(index===null) return;
    closeRef.current?.focus();
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=previousOverflow;};
  },[index===null]);

  return <>
    <div className="pr-memory-grid">
      {gallery.map((item,i)=><button className="pr-polaroid-button" key={item.file}
        type="button" aria-label={"Perbesar: "+item.caption} onClick={e=>open(i,e.currentTarget)}>
        <span className="pr-polaroid-sheet">
          <Image src={root+item.file} width={item.width} height={item.height}
            sizes="(max-width: 640px) 42vw, 225px" loading="lazy" alt="" className="pr-polaroid-image"/>
          <span className="pr-polaroid-caption">{item.caption}</span>
        </span>
      </button>)}
    </div>
    {index!==null && <div className="pr-lightbox" role="dialog" aria-label="Lihat ilustrasi" aria-modal="true"
      onTouchStart={e=>{beginTouch.current=e.touches[0]?.clientX??null;}}
      onTouchEnd={e=>{if(beginTouch.current===null)return;const dx=e.changedTouches[0].clientX-beginTouch.current;beginTouch.current=null;if(Math.abs(dx)>65)shift(dx<0?1:-1);}}
      onKeyDown={e=>{
        if(e.key==="Escape"){e.stopPropagation();close();}
        if(e.key==="ArrowRight"){e.preventDefault();shift(1);}
        if(e.key==="ArrowLeft"){e.preventDefault();shift(-1);}
        if(e.key==="Tab"){
          const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
          const selected=buttons.indexOf(document.activeElement as HTMLButtonElement);
          if(e.shiftKey && selected===0){e.preventDefault();buttons.at(-1)?.focus();}
          if(!e.shiftKey && selected===buttons.length-1){e.preventDefault();buttons[0]?.focus();}
        }
      }}>
      <button ref={closeRef} type="button" className="pr-lightbox-close" aria-label="Tutup galeri" onClick={close}><X size={24}/></button>
      <button type="button" className="pr-lightbox-previous" aria-label="Ilustrasi sebelumnya" onClick={()=>shift(-1)}><ChevronLeft size={25}/></button>
      <figure className="pr-lightbox-art">
        <Image src={root+gallery[index].file} width={gallery[index].width} height={gallery[index].height}
          sizes="(max-width: 640px) 86vw, 580px" alt={gallery[index].caption} className="pr-lightbox-image"/>
        <figcaption>{gallery[index].caption}</figcaption>
      </figure>
      <button type="button" className="pr-lightbox-next" aria-label="Ilustrasi berikutnya" onClick={()=>shift(1)}><ChevronRight size={25}/></button>
    </div>}
  </>;
}
