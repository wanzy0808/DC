"use client";

import { useState } from "react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Check, ChevronDown, ImagePlus, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";
import { photoCropStyle, type PhotoAssignments, type PhotoSlot } from "@/lib/templates/photo-slots";

const englishLabels: Record<PhotoSlot, string> = {
  cover: "Main Cover",
  personOne: "First Partner",
  personTwo: "Second Partner",
  gallery: "Gallery",
};

const labels: Record<PhotoSlot, string> = {
  cover: "Cover utama",
  personOne: "Mempelai pertama",
  personTwo: "Mempelai kedua",
  gallery: "Galeri",
};

export default function PhotoPanel({
  photos,
  slots,
  assignments,
  activeSlot,
  onActiveSlotChange,
  onSetPhoto,
  onToggleGallery,
  onUpload,
}: {
  photos: InvitationDesignerInvitation["assets"];
  slots: PhotoSlot[];
  assignments: PhotoAssignments;
  activeSlot: PhotoSlot;
  onActiveSlotChange: (slot: PhotoSlot) => void;
  onSetPhoto: (slot: "cover" | "personOne" | "personTwo", id: string | null) => void;
  onToggleGallery: (id: string) => void;
  onUpload?: (file: File) => Promise<void>;
}) {
  const { locale } = useLanguage();
  const en = locale === "en";
  const defaultPhotoLabel = en ? "Back to default" : "Kembali ke bawaan";
  const slotLabels = en ? englishLabels : labels;
  const pictures = photos.filter((asset) => asset.type === "IMAGE");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const selectedGallery = assignments.gallery ?? pictures.map((photo) => photo.id);
  const slotsAvailable = slots.length ? slots : (["cover"] as PhotoSlot[]);
  const active = slotsAvailable.includes(activeSlot) ? activeSlot : slotsAvailable[0];

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
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
            {en ? "No photos uploaded yet." : "Foto belum diunggah."}
          </div>
        )}
        {onUpload && (
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
        )}
        <p className="mt-2 text-xs leading-5 text-muted-foreground">JPG / PNG / WebP · 15 MB/{en ? "photo" : "foto"}</p>
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
                <span className="min-w-0 flex-1 text-sm font-medium">{slotLabels[slot]}</span>
                <ChevronDown size={16} aria-hidden="true" className={`shrink-0 text-primary ${active === slot ? "rotate-180" : ""}`} />
              </button>
              {active === slot && (
                <div className="space-y-4 border-t border-border bg-muted/15 p-3">
                  {pictures.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {pictures.map((photo, index) => {
                        const marked = slot === "gallery" ? selectedGallery.includes(photo.id) : assignments[slot] === photo.id;
                        return (
                          <button
                            type="button"
                            key={photo.id}
                            onClick={() => {
                              onActiveSlotChange(slot);
                              if (slot === "gallery") onToggleGallery(photo.id);
                              else onSetPhoto(slot, photo.id);
                            }}
                            aria-pressed={marked}
                            aria-label={`${en ? "Select " : "Pilih "}${slotLabels[slot]}: ${en ? "photo" : "foto"} ${index + 1}`}
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
                    <Button type="button" size="sm" onClick={() => { onActiveSlotChange(slot); onToggleGallery("*"); }} className="min-h-11 max-w-full whitespace-normal text-sm"
                      aria-label={assignments.gallery === null ? (en ? "Clear gallery selection" : "Kosongkan pilihan galeri") : (en ? "Select all gallery photos" : "Pilih semua foto galeri")}>
                      {assignments.gallery === null ? (en ? "Clear" : "Kosongkan") : (en ? "All photos" : "Semua foto")}
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={() => { onActiveSlotChange(slot); onSetPhoto(slot, null); }} className="min-h-11 max-w-full whitespace-normal text-sm"
                      aria-label={`${defaultPhotoLabel}: ${slotLabels[slot]}`}>
                      {defaultPhotoLabel}
                    </Button>
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
