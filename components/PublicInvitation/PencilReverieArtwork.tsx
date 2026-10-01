"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./pencil-reverie.css";

const root = "/templates/pencil-reverie/";

type DrawingKind = "sheet" | "object";
type Drawing = { file: string; width: number; height: number; caption: string; kind: DrawingKind };

const drawings = {
  bingkai: { file: "bingkai.webp", width: 1122, height: 1402, caption: "Surat kecil untukmu", kind: "sheet" },
  riverside: { file: "bungaandlampbg.webp", width: 1122, height: 1402, caption: "Jalan kecil penuh cerita", kind: "sheet" },
  booksScene: { file: "bungabg.webp", width: 1122, height: 1402, caption: "Halaman-halaman kenangan", kind: "sheet" },
  magnolia: { file: "bungabg1.webp", width: 1122, height: 1402, caption: "Bunga-bunga yang mekar", kind: "sheet" },
  bicycleScene: { file: "sepedabg.webp", width: 1122, height: 1402, caption: "Perjalanan bersama", kind: "sheet" },
  lamp: { file: "streetlamp.webp", width: 1086, height: 1448, caption: "Lampu jalan vintage", kind: "object" },
  couple: { file: "couplesitting.webp", width: 1122, height: 1402, caption: "Sketsa pasangan", kind: "object" },
  bicycle: { file: "bycicle.webp", width: 1448, height: 1086, caption: "Sepeda klasik", kind: "object" },
  camera: { file: "camera1.webp", width: 1254, height: 1254, caption: "Kamera analog", kind: "object" },
  cassette: { file: "casette.webp", width: 1254, height: 1254, caption: "Kaset nostalgia", kind: "object" },
  balloon: { file: "loveballon1.webp", width: 1254, height: 1254, caption: "Balon hati", kind: "object" },
  ticket: { file: "loveticket.webp", width: 1448, height: 1086, caption: "Tiket kenangan", kind: "object" },
  polaroid: { file: "polaroidlove.webp", width: 1254, height: 1254, caption: "Polaroid kisah kita", kind: "object" },
  bow: { file: "ribbon.webp", width: 1254, height: 1254, caption: "Pita merah muda", kind: "object" },
  books: { file: "bookstack.webp", width: 1254, height: 1254, caption: "Buku-buku lama", kind: "object" },
} as const satisfies Record<string, Drawing>;

type DrawingKey = keyof typeof drawings;

const sectionDrawings: Partial<Record<string, DrawingKey[]>> = {
  greeting: ["magnolia"],
  identity: ["books"],
  event: ["riverside"],
  dateTime: ["ticket", "camera"],
  countdown: ["cassette"],
  location: ["lamp", "bicycle"],
  rsvp: ["balloon"],
  wishes: ["booksScene", "polaroid"],
  gift: ["bow", "books"],
  closing: ["bicycleScene"],
};

export function PencilSectionArt({ section }: { section: string }) {
  const ids = sectionDrawings[section];
  if (!ids?.length) return null;

  return (
    <div className="pr-section-art" data-part={section} aria-hidden="true" data-studio-native-object={`object:${section}:theme-art`}>
      {ids.map((id, index) => {
        const art = drawings[id];
        return (
          <span
            key={id}
            className={`pr-section-prop pr-section-prop-${index + 1} pr-section-${art.kind}`}
            data-studio-native-object={`object:${section}:theme-art-${index + 1}`}
          >
            <Image
              src={root + art.file}
              width={art.width}
              height={art.height}
              sizes="(max-width: 640px) 62vw, 330px"
              loading="lazy"
              alt=""
              className="pr-section-whole-image"
            />
          </span>
        );
      })}
    </div>
  );
}

export function PencilBackwardClock() {
  return (
    <div className="pr-clock-art" aria-hidden="true" data-studio-native-object="object:countdown:clock-art">
      <span className="pr-clock-face" />
      <span className="pr-clock-hand pr-clock-hour" />
      <span className="pr-clock-hand pr-clock-minute" />
      <span className="pr-clock-dot" />
    </div>
  );
}

const gallery: Drawing[] = [
  drawings.couple,
  drawings.camera,
  drawings.ticket,
  drawings.books,
  drawings.cassette,
  drawings.bicycle,
  drawings.balloon,
  drawings.polaroid,
  drawings.booksScene,
  drawings.magnolia,
  drawings.bicycleScene,
];

export function PencilMemoryGallery({ preview = false }: { preview?: boolean }) {
  const language = useInvitationLanguage();
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const beginTouch = useRef<number | null>(null);

  const open = (i: number, button: HTMLButtonElement) => {
    trigger.current = button;
    setIndex(i);
  };
  const close = () => {
    setIndex(null);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  const shift = (direction: number) =>
    setIndex((old) => (old === null ? null : (old + direction + gallery.length) % gallery.length));

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [index]);

  return (
    <>
      <div className="pr-memory-grid" data-studio-native-object="object:gallery:memory-board">
        {gallery.map((item, i) => (
          <button
            className="pr-polaroid-button"
            key={item.file}
            type="button"
            data-memory-index={i + 1}
            data-studio-native-object={`object:gallery:memory-${i + 1}`}
            aria-label={preview ? `Pilih ilustrasi ${i + 1}` : "Perbesar: " + item.caption}
            onClick={(e) => {
              if (preview) { e.preventDefault(); return; }
              open(i, e.currentTarget);
            }}
          >
            <span className="pr-polaroid-sheet">
              <Image
                src={root + item.file}
                width={item.width}
                height={item.height}
                sizes="(max-width: 640px) 48vw, 230px"
                loading="lazy"
                alt=""
                className="pr-polaroid-image"
              />
              <span className="pr-polaroid-caption">{invitationText(language, item.caption)}</span>
            </span>
          </button>
        ))}
      </div>

      {!preview && index!==null && (
        <div
          className="pr-lightbox"
          role="dialog"
          aria-label="Lihat ilustrasi"
          aria-modal="true"
          onTouchStart={(event) => {
            beginTouch.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (beginTouch.current === null) return;
            const dx = event.changedTouches[0].clientX - beginTouch.current;
            beginTouch.current = null;
            if (Math.abs(dx) > 65) shift(dx < 0 ? 1 : -1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              shift(1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              shift(-1);
            }
            if (event.key === "Tab") {
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
              const selected = buttons.indexOf(document.activeElement as HTMLButtonElement);
              if (event.shiftKey && selected === 0) {
                event.preventDefault();
                buttons.at(-1)?.focus();
              }
              if (!event.shiftKey && selected === buttons.length - 1) {
                event.preventDefault();
                buttons[0]?.focus();
              }
            }
          }}
        >
          <button ref={closeRef} type="button" className="pr-lightbox-close" aria-label="Tutup galeri" onClick={close}>
            <X size={24} />
          </button>
          <button type="button" className="pr-lightbox-previous" aria-label="Ilustrasi sebelumnya" onClick={() => shift(-1)}>
            <ChevronLeft size={25} />
          </button>
          <figure className="pr-lightbox-art">
            <Image
              src={root + gallery[index].file}
              width={gallery[index].width}
              height={gallery[index].height}
              sizes="(max-width: 640px) 86vw, 580px"
              alt={gallery[index].caption}
              className="pr-lightbox-image"
            />
            <figcaption>{invitationText(language, gallery[index].caption)}</figcaption>
          </figure>
          <button type="button" className="pr-lightbox-next" aria-label="Ilustrasi berikutnya" onClick={() => shift(1)}>
            <ChevronRight size={25} />
          </button>
        </div>
      )}
    </>
  );
}
