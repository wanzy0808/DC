"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, X } from "lucide-react";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./serein.css";

type Photo = { id: string; url: string; title: string | null };

/** Layout/motion only. Photo ownership/order and native transforms belong to the shared engine. */
export default function SereinGallery({ photos, preview = false, onEdit, appearance = "serein", allowPhotoOpen = false }: { photos: Photo[]; preview?: boolean; onEdit?: () => void; appearance?: "serein" | "blossom"; allowPhotoOpen?: boolean }) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const index = Math.max(0, photos.findIndex((photo) => photo.id === selectedId));
  const selected = photos[index];
  const canOpen = !preview || allowPhotoOpen;
  const move = (offset: number) => {
    if (photos.length) setSelectedId(photos[(index + offset + photos.length) % photos.length].id);
  };

  return <>
    {preview && onEdit && <button type="button" className={`${appearance === "blossom" ? "eb-action" : "sr-action"} sr-gallery-edit`} onClick={onEdit}>{tr("Atur Foto Galeri")}</button>}
    {photos.length ? <div data-studio-native-object="object:gallery:album-group" className={appearance === "blossom" ? `eb-gallery ${photos.length === 1 ? "eb-gallery-single" : ""}` : `sr-album ${photos.length === 1 ? "sr-album-single" : ""}`}>
      {photos.map((photo, position) => <figure key={photo.id} className="sr-album-page">
        <button type="button" data-invitation-photo-slot="gallery" data-studio-photo-id={photo.id} className="sr-album-photo" aria-label={`${tr(canOpen ? "Buka Foto" : "Pilih Foto")} ${position + 1}`} onClick={(event) => {
          if (!canOpen) { event.preventDefault(); return; }
          opener.current = event.currentTarget; setSelectedId(photo.id); dialog.current?.showModal();
        }}>
          <img src={photo.url} alt={photo.title || `${tr("Foto")} ${position + 1}`} loading="lazy" decoding="async" />
          {canOpen && <span className="sr-expand" aria-hidden="true"><Expand size={17} strokeWidth={1.4} /></span>}
        </button>
        {appearance === "serein" && <figcaption data-studio-native-object={`object:gallery:photo-label-${position}`}>{position + 1} / {photos.length}</figcaption>}
      </figure>)}
    </div> : <div data-studio-native-object="object:gallery:empty-panel" className="sr-gallery-empty"><ImageIcon size={30} strokeWidth={1} aria-hidden="true" /><p data-studio-native-object="object:gallery:empty-copy">{tr("Foto galeri belum ditambahkan.")}</p></div>}
    {canOpen && <dialog ref={dialog} className="sr-lightbox" aria-label={tr("Galeri Foto")} onClose={() => opener.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    }} onTouchStart={(event) => { if (event.touches.length === 1) touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={(event) => {
      const start = touch.current;
      if (start && event.changedTouches[0]) {
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }
      touch.current = null;
    }}>
      <button type="button" className="sr-lightbox-close" aria-label={tr("Tutup Foto")} onClick={() => dialog.current?.close()}><X size={22} /></button>
      {selected && <img key={selected.id} src={selected.url} alt={selected.title || `${tr("Foto")} ${index + 1}`} />}
      {photos.length > 1 && <><button type="button" className="sr-lightbox-prev" aria-label={tr("Foto Sebelumnya")} onClick={() => move(-1)}><ChevronLeft /></button><button type="button" className="sr-lightbox-next" aria-label={tr("Foto Berikutnya")} onClick={() => move(1)}><ChevronRight /></button></>}
      <p aria-live="polite">{photos.length ? index + 1 : 0} / {photos.length}</p>
    </dialog>}
  </>;
}
