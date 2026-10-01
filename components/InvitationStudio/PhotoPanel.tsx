"use client";

import { useState } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Check, ChevronDown, ChevronUp, GripVertical, ImagePlus, RotateCcw, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";
import { sectionAnimationGroups, sectionAnimationPresets, type InvitationSectionAnimation } from "@/lib/templates/section-animations";
import { photoCropStyle, type GallerySettings, type PhotoAssignments, type PhotoCrop, type PhotoCropAspect, type PhotoFocus, type PhotoMotion, type PhotoSlot } from "@/lib/templates/photo-slots";

const englishLabels: Record<PhotoSlot, { title: string; description: string }> = {
  cover: { title: "Main Cover", description: "Main invitation photo." },
  personOne: { title: "First Partner", description: "Individual portrait for the first partner." },
  personTwo: { title: "Second Partner", description: "Individual portrait for the second partner." },
  gallery: { title: "Gallery", description: "Choose photos from your collection." },
};

const labels: Record<PhotoSlot, { title: string; description: string }> = {
  cover: { title: "Cover utama", description: "Foto utama yang membuka undangan." },
  personOne: { title: "Mempelai pertama", description: "Foto individual untuk perkenalan pertama." },
  personTwo: { title: "Mempelai kedua", description: "Foto individual untuk perkenalan kedua." },
  gallery: { title: "Galeri", description: "Pilih satu atau beberapa foto dari koleksi." },
};

export default function PhotoPanel({
  photos,
  slots,
  assignments,
  activeSlot,
  onActiveSlotChange,
  onSetPhoto,
  onToggleGallery,
  onReorderGallery,
  onGallerySettings,
  galleryMotion,
  onGalleryMotion,
  onResetGalleryMotion,
  onSetFocus,
  onSetCrop,
  onResetCrop,
  onUpload,
}: {
  photos: InvitationDesignerInvitation["assets"];
  slots: PhotoSlot[];
  assignments: PhotoAssignments;
  activeSlot: PhotoSlot;
  onActiveSlotChange: (slot: PhotoSlot) => void;
  onSetPhoto: (slot: "cover" | "personOne" | "personTwo", id: string | null) => void;
  onToggleGallery: (id: string) => void;
  onReorderGallery: (sourceId: string, targetId: string) => void;
  onGallerySettings: (patch: Partial<GallerySettings>) => void;
  galleryMotion: PhotoMotion | undefined;
  onGalleryMotion: (patch: Partial<PhotoMotion>) => void;
  onResetGalleryMotion: () => void;
  onSetFocus: (slot: "cover" | "personOne" | "personTwo", focus: PhotoFocus) => void;
  onSetCrop: (slot: "cover" | "personOne" | "personTwo", crop: PhotoCrop) => void;
  onResetCrop: (slot: "cover" | "personOne" | "personTwo") => void;
  onUpload?: (file: File) => Promise<void>;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const slotLabels = en ? englishLabels : labels;
  const pictures = photos.filter((asset) => asset.type === "IMAGE");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [draggedGalleryId, setDraggedGalleryId] = useState<string | null>(null);
  const selectedGallery = assignments.gallery ?? pictures.map((photo) => photo.id);
  const selectedGalleryPhotos = selectedGallery
    .map((id) => pictures.find((photo) => photo.id === id))
    .filter((photo): photo is InvitationDesignerInvitation["assets"][number] => Boolean(photo));
  const slideshowGallery = assignments.gallerySettings.presentation === "carousel" || assignments.gallerySettings.presentation === "stack";
  const slotsAvailable = slots.length ? slots : (["cover"] as PhotoSlot[]);
  const selected = (slot: PhotoSlot) =>
    slot === "gallery" ? selectedGallery.length > 0 : Boolean(assignments[slot] && pictures.some((photo) => photo.id === assignments[slot]));
  const active = slotsAvailable.includes(activeSlot) ? activeSlot : slotsAvailable[0];
  const cropValue = (slot: "cover" | "personOne" | "personTwo"): PhotoCrop => {
    const crop = assignments.crop?.[slot];
    if (crop) return crop;
    return { x: 50, y: assignments.focus[slot] === "top" ? 0 : assignments.focus[slot] === "bottom" ? 100 : 50, zoom: 1 };
  };

  async function uploadFiles(files: File[]) {
    if (!files.length || !onUpload) return;
    setError("");
    setUploading(true);
    try {
      for (const file of files) await onUpload(file);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Foto belum berhasil diunggah.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-undara-heading)] text-xl text-foreground">{en ? "Invitation Photos" : "Foto Undangan"}</h2>
      </div>

      <section aria-label={en ? "Photo Library" : "Koleksi foto"}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold">{en ? "Photo Library" : "Koleksi Foto"}</h3>
          <span className="text-xs text-muted-foreground">{pictures.length}/30</span>
        </div>
        {pictures.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pictures.map((photo, index) => (
              <div key={photo.id} className="relative overflow-hidden rounded-xl border border-border bg-muted">
                <img src={photo.url} alt={`${en ? "Photo" : "Foto"} ${index + 1}`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1 text-center text-[10px] text-white">{`${en ? "Photo" : "Foto"} ${index + 1}`}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
            {en ? "No photos uploaded yet." : "Foto belum diunggah."}
          </div>
        )}
        {onUpload && (        <label className={buttonVariants({ size: "lg", className: `mt-3 flex min-h-12 w-full justify-center px-3 ${uploading || pictures.length >= 30 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}` })}>
          <Upload className="h-4 w-4" />
          {uploading ? (en ? "Uploading..." : "Mengunggah foto...") : (en ? "Add Photos" : "Tambah Foto")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading || pictures.length >= 30}
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              void uploadFiles(files);
            }}
          />
        </label>
        )}
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{en ? "JPG, PNG or WebP · up to 15 MB per photo." : "JPG, PNG atau WebP · maksimal 15 MB per foto."}</p>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      </section>

      <section aria-label={en ? "Photo Placement" : "Penempatan foto"} className="space-y-3 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-semibold">{en ? "Photo Placement" : "Penempatan Foto"}</h3>
          
        </div>
        {slotsAvailable.map((slot) => {
          const current = slot === "gallery"
            ? pictures.find((photo) => selectedGallery.includes(photo.id))
            : pictures.find((photo) => photo.id === assignments[slot]);
          return (
            <div key={slot} className={`overflow-hidden rounded-xl border ${active === slot ? "border-primary ring-1 ring-primary/20" : "border-border"}`}>
              <button
                type="button"
                aria-expanded={active === slot}
                onClick={() => onActiveSlotChange(slot)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/30"
              >
                <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {current ? <img src={current.url} alt="" className="h-full w-full object-cover" style={slot === "gallery" ? undefined : photoCropStyle(assignments, slot)} /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{slotLabels[slot].title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{slotLabels[slot].description}</span>
                  <span className="mt-1 block text-[11px] text-primary">{selected(slot) ? (en ? "Photo selected" : "Foto dipilih") : (en ? "Default / not selected" : "Bawaan / belum dipilih")}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-primary">{active === slot ? (en ? "Open" : "Terbuka") : (en ? "Edit" : "Atur")}</span>
              </button>
              {active === slot && (
                <div className="space-y-4 border-t border-border bg-muted/15 p-3">
                  {!pictures.length ? (
                    <p className="text-xs leading-6 text-muted-foreground">{en ? "Add photos to your library first." : "Unggah foto ke Koleksi Foto terlebih dahulu."}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {pictures.map((photo, index) => {
                        const marked = slot === "gallery" ? selectedGallery.includes(photo.id) : assignments[slot] === photo.id;
                        return (
                          <button
                            type="button"
                            key={photo.id}
                            onClick={() => slot === "gallery" ? onToggleGallery(photo.id) : onSetPhoto(slot, photo.id)}
                            aria-pressed={marked}
                            aria-label={`${slot === "gallery" ? (en ? "Select Gallery" : "Pilih galeri") : (en ? "Select " : "Pilih ") + slotLabels[slot].title}: ${en ? "photo" : "foto"} ${index + 1}`}
                            className={`relative overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${marked ? "border-primary" : "border-transparent"}`}
                          >
                            <img src={photo.url} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
                            {marked && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white"><Check className="h-3 w-3" /></span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {slot === "gallery" ? (
                    <div className="space-y-5">
                      <Button type="button" size="xs" onClick={() => onToggleGallery("*")} className="max-w-full whitespace-normal">
                        {assignments.gallery === null ? (en ? "Clear Gallery Selection" : "Kosongkan Pilihan Galeri") : (en ? "Use All Photos" : "Gunakan Semua Foto")}
                      </Button>

                      <div className="space-y-2 border-t border-border pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold">{en ? "Photo order" : "Urutan Foto"}</p>
                          <span className="text-[11px] text-muted-foreground">{selectedGalleryPhotos.length}</span>
                        </div>
                        <p className="text-[11px] leading-5 text-muted-foreground">
                          {en ? "Drag photos or use the arrows. The saved order is used by every gallery style." : "Drag foto atau gunakan panah. Urutan ini dipakai oleh semua gaya galeri."}
                        </p>
                        {selectedGalleryPhotos.length ? <div className="space-y-1.5">
                          {selectedGalleryPhotos.map((photo, index) => (
                            <div
                              key={photo.id}
                              draggable
                              onDragStart={(event) => {
                                setDraggedGalleryId(photo.id);
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", photo.id);
                              }}
                              onDragEnd={() => setDraggedGalleryId(null)}
                              onDragOver={(event) => {
                                if (!draggedGalleryId || draggedGalleryId === photo.id) return;
                                event.preventDefault();
                                event.dataTransfer.dropEffect = "move";
                              }}
                              onDrop={(event) => {
                                event.preventDefault();
                                const sourceId = draggedGalleryId || event.dataTransfer.getData("text/plain");
                                setDraggedGalleryId(null);
                                if (sourceId && sourceId !== photo.id) onReorderGallery(sourceId, photo.id);
                              }}
                              className={`flex items-center gap-2 rounded-lg border bg-background p-2 ${draggedGalleryId === photo.id ? "border-primary/50 opacity-60" : "border-border"}`}
                            >
                              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
                              <span className="w-5 shrink-0 text-center text-[10px] font-semibold text-muted-foreground">{index + 1}</span>
                              <img src={photo.url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                              <span className="min-w-0 flex-1 truncate text-[11px]">{photo.title || `${en ? "Photo" : "Foto"} ${index + 1}`}</span>
                              <span className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => index > 0 && onReorderGallery(photo.id, selectedGalleryPhotos[index - 1].id)}
                                  className="grid h-7 w-7 place-items-center rounded-md border border-border disabled:opacity-30"
                                  aria-label={en ? "Move photo up" : "Naikkan foto"}
                                ><ChevronUp size={13} /></button>
                                <button
                                  type="button"
                                  disabled={index === selectedGalleryPhotos.length - 1}
                                  onClick={() => index < selectedGalleryPhotos.length - 1 && onReorderGallery(photo.id, selectedGalleryPhotos[index + 1].id)}
                                  className="grid h-7 w-7 place-items-center rounded-md border border-border disabled:opacity-30"
                                  aria-label={en ? "Move photo down" : "Turunkan foto"}
                                ><ChevronDown size={13} /></button>
                              </span>
                            </div>
                          ))}
                        </div> : <p className="rounded-lg border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">{en ? "Choose gallery photos first." : "Pilih foto galeri terlebih dahulu."}</p>}
                      </div>

                      <div className="space-y-3 border-t border-border pt-4">
                        <p className="text-xs font-semibold">{en ? "Gallery behavior" : "Pengaturan Galeri"}</p>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">{en ? "Gallery style" : "Gaya galeri"}</span>
                          <select
                            value={assignments.gallerySettings.presentation}
                            onChange={(event) => onGallerySettings({ presentation: event.target.value as GallerySettings["presentation"] })}
                            className="min-h-10 w-full rounded-lg border border-border bg-background px-3 text-xs"
                          >
                            <option value="template">{en ? "Template default" : "Default template"}</option>
                            <option value="carousel">{en ? "Carousel / slider" : "Carousel / slider"}</option>
                            <option value="stack">{en ? "Stacked cards" : "Kartu bertumpuk"}</option>
                            <option value="filmstrip">{en ? "Filmstrip swipe" : "Filmstrip swipe"}</option>
                            <option value="masonry">{en ? "Masonry collage" : "Kolase masonry"}</option>
                          </select>
                        </label>

                        <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3">
                          <div>
                            <p className="text-xs font-medium">Autoplay</p>
                            <p className="text-[10px] text-muted-foreground">{slideshowGallery ? (en ? "Advance slides automatically." : "Foto berpindah otomatis.") : (en ? "Available for Carousel and Stack." : "Aktif untuk Carousel dan Kartu bertumpuk.")}</p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={assignments.gallerySettings.autoplay && slideshowGallery}
                            disabled={!slideshowGallery}
                            onClick={() => onGallerySettings({ autoplay: !assignments.gallerySettings.autoplay })}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-35 ${assignments.gallerySettings.autoplay && slideshowGallery ? "bg-primary" : "bg-muted"}`}
                          >
                            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${assignments.gallerySettings.autoplay && slideshowGallery ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>

                        {slideshowGallery && assignments.gallerySettings.autoplay && <label className="block">
                          <span className="mb-1.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                            <span>{en ? "Slide interval" : "Jeda slide"}</span>
                            <output>{assignments.gallerySettings.interval.toFixed(1)}s</output>
                          </span>
                          <input
                            type="range"
                            min="2"
                            max="12"
                            step="0.5"
                            value={assignments.gallerySettings.interval}
                            onChange={(event) => onGallerySettings({ interval: Number(event.target.value) })}
                            className="w-full"
                          />
                        </label>}

                        {slideshowGallery && <>
                          <label className="block">
                            <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">{en ? "Slide transition" : "Transisi slide"}</span>
                            <select
                              value={assignments.gallerySettings.transition}
                              onChange={(event) => onGallerySettings({ transition: event.target.value as GallerySettings["transition"] })}
                              className="min-h-10 w-full rounded-lg border border-border bg-background px-3 text-xs"
                            >
                              <option value="slide-left">{en ? "Enter from right" : "Masuk dari kanan"}</option>
                              <option value="slide-right">{en ? "Enter from left" : "Masuk dari kiri"}</option>
                              <option value="fade">Fade</option>
                              <option value="zoom">Zoom</option>
                              <option value="rise">{en ? "Rise" : "Naik dari bawah"}</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-1.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                              <span>{en ? "Transition duration" : "Durasi transisi"}</span>
                              <output>{assignments.gallerySettings.transitionDuration.toFixed(1)}s</output>
                            </span>
                            <input
                              type="range"
                              min="0.2"
                              max="2"
                              step="0.1"
                              value={assignments.gallerySettings.transitionDuration}
                              onChange={(event) => onGallerySettings({ transitionDuration: Number(event.target.value) })}
                              className="w-full"
                            />
                          </label>
                        </>}
                      </div>

                      <div className="space-y-3 border-t border-border pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold">{en ? "Entrance animation" : "Animasi Saat Muncul"}</p>
                          <button type="button" onClick={onResetGalleryMotion} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"><RotateCcw size={11} />Reset</button>
                        </div>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">{en ? "Animation" : "Animasi foto"}</span>
                          <select
                            value={galleryMotion?.animation && galleryMotion.animation !== "none" ? galleryMotion.animation : ""}
                            onChange={(event) => {
                              const animation = event.target.value as InvitationSectionAnimation | "";
                              onGalleryMotion(animation
                                ? { animation, animationDuration: undefined }
                                : { animation: "none", animationDuration: undefined, animationDelay: undefined, animationStagger: undefined });
                            }}
                            className="min-h-10 w-full rounded-lg border border-border bg-background px-3 text-xs"
                          >
                            <option value="">{en ? "No entrance animation" : "Tanpa animasi masuk"}</option>
                            {sectionAnimationGroups.map((group) => (
                              <optgroup key={group.key} label={en ? group.labelEn : group.labelId}>
                                {sectionAnimationPresets.filter((item) => item.group === group.key).map((item) => (
                                  <option key={item.key} value={item.key}>{en ? item.labelEn : item.labelId}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </label>
                        {galleryMotion?.animation && galleryMotion.animation !== "none" && <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="mb-1 block text-[10px] text-muted-foreground">{en ? "Duration" : "Durasi"}</span>
                            <input
                              type="number"
                              min="0.2"
                              max="2.5"
                              step="0.1"
                              value={galleryMotion.animationDuration ?? 0.7}
                              onChange={(event) => {
                                const value = event.currentTarget.valueAsNumber;
                                if (Number.isFinite(value)) onGalleryMotion({ animationDuration: Math.min(2.5, Math.max(.2, value)) });
                              }}
                              className="min-h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[10px] text-muted-foreground">{en ? "Photo stagger" : "Jeda antar foto"}</span>
                            <input
                              type="number"
                              min="0.01"
                              max="0.2"
                              step="0.01"
                              value={galleryMotion.animationStagger ?? 0.08}
                              onChange={(event) => {
                                const value = event.currentTarget.valueAsNumber;
                                if (Number.isFinite(value)) onGalleryMotion({ animationStagger: Math.min(.2, Math.max(.01, value)) });
                              }}
                              className="min-h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                            />
                          </label>
                        </div>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button type="button" size="xs" onClick={() => onSetPhoto(slot, null)} className="max-w-full whitespace-normal">
                        {en ? "Use Automatic Selection" : "Gunakan Pilihan Otomatis"}
                      </Button>
                      <div>
                        <p className="mb-2 text-xs font-medium">{en ? "Photo Focus" : "Fokus Foto"}</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["top", "center", "bottom"] as const).map((focus) => (
                            <button
                              type="button"
                              key={focus}
                              aria-pressed={assignments.focus[slot] === focus}
                              onClick={() => onSetFocus(slot, focus)}
                              className={`min-h-10 rounded-lg border px-2 text-xs ${assignments.focus[slot] === focus ? "border-primary bg-primary text-white dark:text-black" : "border-border hover:border-primary/50"}`}
                            >
                              {focus === "top" ? (en ? "Top" : "Atas") : focus === "center" ? (en ? "Center" : "Tengah") : (en ? "Bottom" : "Bawah")}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3 border-t border-border pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-medium">{en ? "Crop & position" : "Crop & posisi"}</p>
                          <Button type="button" size="xs" variant="outline" onClick={() => onResetCrop(slot)}>
                            {en ? "Reset crop" : "Reset crop"}
                          </Button>
                        </div>
                        <div>
                          <p className="mb-2 text-[11px] font-medium text-muted-foreground">{en ? "Aspect ratio" : "Rasio crop"}</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {([
                              ["template", en ? "Template" : "Template"],
                              ["original", en ? "Original" : "Original"],
                              ["1:1", "1:1"],
                              ["4:5", "4:5"],
                              ["3:4", "3:4"],
                              ["16:9", "16:9"],
                            ] as const).map(([aspect, label]) => {
                              const crop = cropValue(slot);
                              const activeAspect = crop.aspect ?? "template";
                              return (
                                <button
                                  key={aspect}
                                  type="button"
                                  aria-pressed={activeAspect === aspect}
                                  onClick={() => onSetCrop(slot, { ...crop, aspect: aspect as PhotoCropAspect })}
                                  className={`min-h-9 rounded-[var(--undara-control-radius)] border px-2 text-[11px] ${activeAspect === aspect ? "border-primary bg-primary text-white dark:text-black" : "border-border hover:border-primary/50"}`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {([
                          ["x", en ? "Horizontal" : "Horizontal", 0, 100, 1, "%"],
                          ["y", en ? "Vertical" : "Vertikal", 0, 100, 1, "%"],
                          ["zoom", "Zoom", 1, 3, 0.05, "×"],
                        ] as const).map(([key, label, min, max, step, suffix]) => {
                          const crop = cropValue(slot);
                          return (
                            <label key={key} className="block">
                              <span className="mb-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                                <span>{label}</span>
                                <output>{key === "zoom" ? crop.zoom.toFixed(2) : Math.round(crop[key])}{suffix}</output>
                              </span>
                              <input
                                type="range"
                                min={min}
                                max={max}
                                step={step}
                                value={crop[key]}
                                onChange={(event) => onSetCrop(slot, { ...crop, [key]: Number(event.target.value) })}
                                className="w-full"
                              />
                            </label>
                          );
                        })}
                        <p className="text-[11px] leading-5 text-muted-foreground">
                          {en ? "Cropping is non-destructive. The original uploaded photo is kept." : "Crop tidak merusak foto asli. File upload tetap utuh."}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
