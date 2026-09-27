"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { id: string; url: string; title: string | null };
export default function ZenAtelierGallery({ photos, customMotion = false, preview = false }: { photos: Photo[]; customMotion?: boolean; preview?: boolean }) {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<number | null>(null);
  const move = (offset: number) => setSelected((value) => (value + offset + photos.length) % photos.length);
  useEffect(() => {
    if (selected >= photos.length) { dialog.current?.close(); setSelected(0); }
  }, [photos.length, selected]);
  useEffect(() => {
    if (customMotion || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("zen-reveal", entry.isIntersecting));
    }, { threshold: .1 });
    grid.current?.querySelectorAll("button").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [photos, customMotion]);
  if (!photos.length) return <p className="text-sm">Foto belum ditambahkan.</p>;
  return <>
    <div ref={grid} className="zen-gallery-grid">
      {photos.map((photo, index) => <button type="button" key={photo.id} data-invitation-photo-slot="gallery" data-studio-photo-id={photo.id} aria-label={preview ? `Pilih foto ${index + 1}` : `Buka foto ${index + 1}`} onClick={(event) => {
        if (preview) { event.preventDefault(); return; }
        opener.current = event.currentTarget; setSelected(index); dialog.current?.showModal();
      }}><img src={photo.url} alt={photo.title || `Momen ${index + 1}`} loading="lazy" decoding="async" /></button>)}
    </div>
    <p data-studio-native-object="object:gallery:quote" className="zen-quote">Setiap foto menyimpan cerita tentang kita.</p>
    {!preview && <dialog ref={dialog} className="zen-lightbox" aria-label="Galeri foto" onClose={() => opener.current?.focus()} onKeyDown={(event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    }} onTouchStart={(event) => { touch.current = event.touches[0].clientX; }} onTouchEnd={(event) => {
      if (touch.current !== null) {
        const delta = event.changedTouches[0].clientX - touch.current;
        if (Math.abs(delta) > 55) move(delta < 0 ? 1 : -1);
      }
      touch.current = null;
    }}>
      <button type="button" className="zen-close" aria-label="Tutup foto" onClick={() => dialog.current?.close()}><X /></button>
      {photos[selected] && <img key={photos[selected].id} src={photos[selected].url} alt={photos[selected].title || `Momen ${selected + 1}`} />}
      {photos.length > 1 && <>
        <button type="button" className="zen-prev" aria-label="Foto sebelumnya" onClick={() => move(-1)}><ChevronLeft /></button>
        <button type="button" className="zen-next" aria-label="Foto berikutnya" onClick={() => move(1)}><ChevronRight /></button>
      </>}
      <p aria-live="polite">{selected + 1} / {photos.length}</p>
    </dialog>}
  </>;
}
