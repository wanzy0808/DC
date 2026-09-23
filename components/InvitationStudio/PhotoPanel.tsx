"use client";

import { useState } from "react";
import { Check, ImagePlus, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";
import type { PhotoAssignments, PhotoFocus, PhotoSlot } from "@/lib/templates/photo-slots";

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
  onUpload: (file: File) => Promise<void>;
}) {
  const pictures = photos.filter((asset) => asset.type === "IMAGE");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const selectedGallery = assignments.gallery ?? pictures.map((photo) => photo.id);
  const slotsAvailable = slots.length ? slots : (["cover"] as PhotoSlot[]);
  const selected = (slot: PhotoSlot) =>
    slot === "gallery" ? selectedGallery.length > 0 : Boolean(assignments[slot] && pictures.some((photo) => photo.id === assignments[slot]));
  const active = slotsAvailable.includes(activeSlot) ? activeSlot : slotsAvailable[0];

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
        <h2 className="font-[family-name:var(--font-dc-heading)] text-xl text-foreground">Foto undangan</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Unggah sekali, lalu tentukan penggunaan foto untuk template ini. Bingkai dan posisi visual tetap mengikuti desain template.
        </p>
      </div>

      <section aria-label="Koleksi foto">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold">Koleksi foto</h3>
          <span className="text-xs text-muted-foreground">{pictures.length}/30</span>
        </div>
        {pictures.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pictures.map((photo, index) => (
              <div key={photo.id} className="relative overflow-hidden rounded-xl border border-border bg-muted">
                <img src={photo.url} alt={`Foto ${index + 1}`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1 text-center text-[10px] text-white">{`Foto ${index + 1}`}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
            Foto belum diunggah.
          </div>
        )}
        <label className={buttonVariants({ size: "lg", className: `mt-3 flex min-h-12 w-full justify-center px-3 ${uploading || pictures.length >= 30 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}` })}>
          <Upload className="h-4 w-4" />
          {uploading ? "Mengunggah foto..." : "Tambah foto"}
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
        <p className="mt-2 text-xs leading-5 text-muted-foreground">JPG, PNG, atau WebP · maksimal 15 MB/foto. File disimpan sebagai WebP otomatis.</p>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      </section>

      <section aria-label="Penempatan foto" className="space-y-3 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-semibold">Penempatan foto</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Klik foto di canvas atau pilih bagian di bawah. Perubahan baru tersimpan setelah menekan Simpan desain.</p>
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
                  {current ? <img src={current.url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{labels[slot].title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{labels[slot].description}</span>
                  <span className="mt-1 block text-[11px] text-primary">{selected(slot) ? "Foto dipilih" : "Gunakan foto bawaan / belum dipilih"}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-primary">{active === slot ? "Terbuka" : "Atur"}</span>
              </button>
              {active === slot && (
                <div className="space-y-4 border-t border-border bg-muted/15 p-3">
                  {!pictures.length ? (
                    <p className="text-xs leading-6 text-muted-foreground">Unggah foto di Koleksi Foto terlebih dahulu.</p>
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
                            aria-label={`${slot === "gallery" ? "Pilih galeri" : "Pilih " + labels[slot].title}: foto ${index + 1}`}
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
                      {assignments.gallery === null ? "Kosongkan Pilihan Galeri" : "Gunakan Semua Foto"}
                    </Button>
                  ) : (
                    <>
                      <Button type="button" size="xs" onClick={() => onSetPhoto(slot, null)} className="max-w-full whitespace-normal">
                        Gunakan Pilihan Otomatis
                      </Button>
                      <div>
                        <p className="mb-2 text-xs font-medium">Fokus foto</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["top", "center", "bottom"] as const).map((focus) => (
                            <button
                              type="button"
                              key={focus}
                              aria-pressed={assignments.focus[slot] === focus}
                              onClick={() => onSetFocus(slot, focus)}
                              className={`min-h-10 rounded-lg border px-2 text-xs ${assignments.focus[slot] === focus ? "border-primary bg-primary text-white dark:text-black" : "border-border hover:border-primary/50"}`}
                            >
                              {focus === "top" ? "Atas" : focus === "center" ? "Tengah" : "Bawah"}
                            </button>
                          ))}
                        </div>
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
