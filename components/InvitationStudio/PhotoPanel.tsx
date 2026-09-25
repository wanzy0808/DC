"use client";

import { useState } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Check, ImagePlus, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";
import { photoCropStyle, type PhotoAssignments, type PhotoCrop, type PhotoFocus, type PhotoSlot } from "@/lib/templates/photo-slots";

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
  onSetFocus: (slot: "cover" | "personOne" | "personTwo", focus: PhotoFocus) => void;
  onSetCrop: (slot: "cover" | "personOne" | "personTwo", crop: PhotoCrop) => void;
  onResetCrop: (slot: "cover" | "personOne" | "personTwo") => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const slotLabels = en ? englishLabels : labels;
  const pictures = photos.filter((asset) => asset.type === "IMAGE");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const selectedGallery = assignments.gallery ?? pictures.map((photo) => photo.id);
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
    if (!files.length) return;
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
        <h2 className="font-[family-name:var(--font-dc-heading)] text-xl text-foreground">{en ? "Invitation Photos" : "Foto Undangan"}</h2>
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
        <label className={buttonVariants({ size: "lg", className: `mt-3 flex min-h-12 w-full justify-center px-3 ${uploading || pictures.length >= 30 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}` })}>
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
                    <Button type="button" size="xs" onClick={() => onToggleGallery("*")} className="max-w-full whitespace-normal">
                      {assignments.gallery === null ? (en ? "Clear Gallery Selection" : "Kosongkan Pilihan Galeri") : (en ? "Use All Photos" : "Gunakan Semua Foto")}
                    </Button>
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
