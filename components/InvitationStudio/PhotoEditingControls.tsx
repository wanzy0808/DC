"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolveGallerySettings,
  resolvePhotoCrop,
  type CroppablePhotoSlot,
  type GallerySettings,
  type InvitationPhotoAsset,
  type PhotoAssignments,
  type PhotoCrop,
  type PhotoFocus,
} from "@/lib/templates/photo-slots";

export function PhotoCropControls({
  locale, slot, assignments, onSetFocus, onSetCrop, onResetCrop,
}: {
  locale: string;
  slot: CroppablePhotoSlot;
  assignments: PhotoAssignments;
  onSetFocus: (slot: CroppablePhotoSlot, focus: PhotoFocus) => void;
  onSetCrop: (slot: CroppablePhotoSlot, crop: PhotoCrop) => void;
  onResetCrop: (slot: CroppablePhotoSlot) => void;
}) {
  const en = locale === "en";
  const crop = resolvePhotoCrop(assignments, slot);

  return (
    <section aria-label={en ? "Photo crop and focus" : "Crop dan fokus foto"}>
      <h3 className="text-xs font-semibold">{en ? "Photo focus" : "Fokus foto"}</h3>
      <div className="mt-2 grid grid-cols-3 gap-1" role="group" aria-label={en ? "Photo focus" : "Fokus foto"}>
        {(["top", "center", "bottom"] as const).map((focus) => {
          const active = !assignments.crop?.[slot] && assignments.focus[slot] === focus;
          return (
            <Button key={focus} type="button" size="sm" variant={active ? "default" : "outline"}
              className="min-h-11 px-1 text-[11px]" aria-pressed={active} onClick={() => onSetFocus(slot, focus)}>
              {focus === "top" ? (en ? "Top" : "Atas") : focus === "center" ? (en ? "Center" : "Tengah") : (en ? "Bottom" : "Bawah")}
            </Button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold">{en ? "Crop & position" : "Crop & posisi"}</h3>
        <Button type="button" size="sm" variant="outline" className="min-h-11 px-2 text-[11px]" onClick={() => onResetCrop(slot)}>Reset</Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{en ? "Aspect ratio" : "Rasio crop"}</p>
      <div className="mt-2 grid grid-cols-3 gap-1" role="group" aria-label={en ? "Aspect ratio" : "Rasio crop"}>
        {(["template", "original", "1:1", "4:5", "3:4", "16:9"] as const).map((aspect) => {
          const active = (crop.aspect ?? "template") === aspect;
          return (
            <Button key={aspect} type="button" size="sm" variant={active ? "default" : "outline"}
              className="min-h-11 px-1 text-[11px]" aria-pressed={active} onClick={() => onSetCrop(slot, { ...crop, aspect })}>
              {aspect === "template" ? "Template" : aspect === "original" ? (en ? "Original" : "Asli") : aspect}
            </Button>
          );
        })}
      </div>
      {([
        ["x", "Horizontal", 0, 100, 1, "%"],
        ["y", en ? "Vertical" : "Vertikal", 0, 100, 1, "%"],
        ["zoom", "Zoom", 1, 3, 0.05, "×"],
      ] as const).map(([key, label, min, max, step, suffix]) => (
        <label key={key} className="undara-studio-layer-opacity">
          <span><span>{label}</span><output>{key === "zoom" ? crop.zoom.toFixed(2) : Math.round(crop[key])}{suffix}</output></span>
          <input type="range" min={min} max={max} step={step} value={crop[key]}
            onChange={(event) => onSetCrop(slot, { ...crop, [key]: Number(event.target.value) })} />
        </label>
      ))}
    </section>
  );
}

export function GalleryPhotoControls({ locale, assets, assignments, onReorderGallery, onGallerySettings }: {
  locale: string;
  assets: InvitationPhotoAsset[];
  assignments: PhotoAssignments;
  onReorderGallery: (sourceId: string, targetId: string) => void;
  onGallerySettings: (patch: Partial<GallerySettings>) => void;
}) {
  const en = locale === "en";
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const pictures = assets.filter((asset) => asset.type === "IMAGE");
  const selectedIds = assignments.gallery ?? pictures.map((photo) => photo.id);
  const photos = selectedIds.map((id) => pictures.find((photo) => photo.id === id))
    .filter((photo): photo is InvitationPhotoAsset => Boolean(photo));
  const gallerySettings = resolveGallerySettings(assignments);
  const slideshow = gallerySettings.presentation === "carousel" || gallerySettings.presentation === "stack";

  return (
    <section aria-label={en ? "Gallery editing" : "Pengaturan galeri"}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold">{en ? "Photo order" : "Urutan foto"}</h3>
        <span className="text-[11px] text-muted-foreground">{photos.length}</span>
      </div>
      {photos.length ? (
        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto overscroll-contain">
          {photos.map((photo, index) => (
            <div key={photo.id} draggable onDragStart={(event) => {
              event.stopPropagation();
              setDraggedId(photo.id);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", photo.id);
            }} onDragEnd={(event) => { event.stopPropagation(); setDraggedId(null); }}
              onDragOver={(event) => {
                event.stopPropagation();
                if (!draggedId || draggedId === photo.id) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }} onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const sourceId = draggedId || event.dataTransfer.getData("text/plain");
                setDraggedId(null);
                if (sourceId && sourceId !== photo.id) onReorderGallery(sourceId, photo.id);
              }} className={`flex items-center gap-1 rounded-[var(--undara-control-radius)] border border-border p-1 ${draggedId === photo.id ? "opacity-50" : ""}`}>
              <GripVertical size={13} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <img src={photo.url} alt="" loading="lazy" className="h-10 w-7 shrink-0 rounded object-cover" />
              <span className="min-w-0 flex-1 truncate text-[11px]" title={photo.title || undefined}>{photo.title || `${en ? "Photo" : "Foto"} ${index + 1}`}</span>
              <div className="flex shrink-0">
                <Button type="button" size="icon-sm" variant="ghost" className="h-11 w-11" disabled={index === 0}
                  aria-label={`${en ? "Move photo up" : "Naikkan foto"}: ${photo.title || index + 1}`}
                  onClick={() => { const target = photos[index - 1]; if (target) onReorderGallery(photo.id, target.id); }}><ChevronUp size={14} /></Button>
                <Button type="button" size="icon-sm" variant="ghost" className="h-11 w-11" disabled={index === photos.length - 1}
                  aria-label={`${en ? "Move photo down" : "Turunkan foto"}: ${photo.title || index + 1}`}
                  onClick={() => { const target = photos[index + 1]; if (target) onReorderGallery(photo.id, target.id); }}><ChevronDown size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="mt-2 text-[11px] text-muted-foreground">{en ? "Choose gallery photos on the left." : "Pilih foto galeri di kiri."}</p>}

      <label className="undara-studio-layer-select">
        <span>{en ? "Gallery style" : "Gaya galeri"}</span>
        <select value={gallerySettings.presentation} onChange={(event) => onGallerySettings({ presentation: event.target.value as GallerySettings["presentation"] })}>
          <option value="template">{en ? "Template default" : "Default template"}</option>
          <option value="carousel">Carousel / slider</option>
          <option value="stack">{en ? "Stacked cards" : "Kartu bertumpuk"}</option>
          <option value="filmstrip">Filmstrip swipe</option>
          <option value="masonry">{en ? "Masonry collage" : "Kolase masonry"}</option>
        </select>
      </label>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">Autoplay</span>
        <Button type="button" size="sm" variant="outline" className="min-h-11" role="switch"
          aria-label={en ? "Gallery autoplay" : "Autoplay galeri"} aria-checked={gallerySettings.autoplay && slideshow} disabled={!slideshow}
          onClick={() => onGallerySettings({ autoplay: !gallerySettings.autoplay })}>{gallerySettings.autoplay && slideshow ? "ON" : "OFF"}</Button>
      </div>
      {!slideshow && <p className="mt-1 text-[11px] text-muted-foreground">{en ? "Available for Carousel and Stack." : "Aktif untuk Carousel dan Kartu bertumpuk."}</p>}
      {slideshow && gallerySettings.autoplay && (
        <label className="undara-studio-layer-opacity">
          <span><span>{en ? "Slide interval" : "Jeda slide"}</span><output>{gallerySettings.interval.toFixed(1)}s</output></span>
          <input type="range" min="2" max="12" step="0.5" value={gallerySettings.interval}
            onChange={(event) => onGallerySettings({ interval: Number(event.target.value) })} />
        </label>
      )}
      {slideshow && <>
        <label className="undara-studio-layer-select">
          <span>{en ? "Slide transition" : "Transisi slide"}</span>
          <select value={gallerySettings.transition} onChange={(event) => onGallerySettings({ transition: event.target.value as GallerySettings["transition"] })}>
            <option value="slide-left">{en ? "Enter from right" : "Masuk dari kanan"}</option>
            <option value="slide-right">{en ? "Enter from left" : "Masuk dari kiri"}</option>
            <option value="fade">Fade</option><option value="zoom">Zoom</option>
            <option value="rise">{en ? "Rise" : "Naik dari bawah"}</option>
          </select>
        </label>
        <label className="undara-studio-layer-opacity">
          <span><span>{en ? "Transition duration" : "Durasi transisi"}</span><output>{gallerySettings.transitionDuration.toFixed(1)}s</output></span>
          <input type="range" min="0.2" max="2" step="0.1" value={gallerySettings.transitionDuration}
            onChange={(event) => onGallerySettings({ transitionDuration: Number(event.target.value) })} />
        </label>
      </>}
    </section>
  );
}
