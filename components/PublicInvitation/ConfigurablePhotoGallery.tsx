"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import type { GallerySettings } from "@/lib/templates/photo-slots";
import "./configurable-photo-gallery.css";

type Photo = { id: string; url: string; title: string | null };

export default function ConfigurablePhotoGallery({
  photos,
  settings,
  preview = false,
  onEdit,
}: {
  photos: Photo[];
  settings: GallerySettings;
  preview?: boolean;
  onEdit?: () => void;
}) {
  const language = useInvitationLanguage();
  const tr = (value: string) => invitationText(language, value);
  const [active, setActive] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touch = useRef<number | null>(null);
  const slideshow = settings.presentation === "carousel" || settings.presentation === "stack";

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (active < photos.length) return;
    setActive(Math.max(0, photos.length - 1));
  }, [active, photos.length]);

  const paused = manualPaused || interactionPaused;

  useEffect(() => {
    if (!slideshow || !settings.autoplay || paused || reducedMotion || photos.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % photos.length);
    }, Math.max(2000, settings.interval * 1000));
    return () => window.clearInterval(timer);
  }, [photos.length, paused, reducedMotion, settings.autoplay, settings.interval, slideshow]);

  const move = (offset: number) => {
    if (photos.length < 2) return;
    setActive((value) => (value + offset + photos.length) % photos.length);
  };

  if (!photos.length) {
    return <div className="ugc-gallery-empty" data-studio-native-object="object:gallery:empty-panel">
      <p data-studio-native-object="object:gallery:empty-copy">{tr("Belum ada foto galeri.")}</p>
      {preview && onEdit && <button type="button" className="ugc-gallery-edit" onClick={onEdit}>{tr("Atur Foto Galeri")}</button>}
    </div>;
  }

  const style = {
    "--ugc-transition-duration": `${reducedMotion ? 0 : settings.transitionDuration}s`,
  } as CSSProperties;

  if (settings.presentation === "masonry") {
    return <div className="ugc-gallery-shell" data-gallery-presentation="masonry">
      {preview && onEdit && <button type="button" className="ugc-gallery-edit" onClick={onEdit}>{tr("Atur Foto Galeri")}</button>}
      <div data-studio-native-object="object:gallery:grid" className="ugc-gallery-masonry">
        {photos.map((photo, index) => <figure key={photo.id} className="ugc-gallery-masonry-item">
          <span data-invitation-photo-slot="gallery" data-studio-photo-id={photo.id} className="ugc-gallery-photo-motion">
            <img src={photo.url} alt={photo.title || `${tr("Galeri foto")} ${index + 1}`} loading="lazy" decoding="async" />
          </span>
        </figure>)}
      </div>
    </div>;
  }

  if (settings.presentation === "filmstrip") {
    return <div className="ugc-gallery-shell" data-gallery-presentation="filmstrip">
      {preview && onEdit && <button type="button" className="ugc-gallery-edit" onClick={onEdit}>{tr("Atur Foto Galeri")}</button>}
      <div data-studio-native-object="object:gallery:grid" className="ugc-gallery-filmstrip" role="list">
        {photos.map((photo, index) => <figure key={photo.id} role="listitem" className="ugc-gallery-filmstrip-item">
          <span data-invitation-photo-slot="gallery" data-studio-photo-id={photo.id} className="ugc-gallery-photo-motion">
            <img src={photo.url} alt={photo.title || `${tr("Galeri foto")} ${index + 1}`} loading="lazy" decoding="async" />
          </span>
          <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
        </figure>)}
      </div>
    </div>;
  }

  const previous = (active - 1 + photos.length) % photos.length;
  const next = (active + 1) % photos.length;

  return <div
    className="ugc-gallery-shell"
    data-gallery-presentation={settings.presentation}
    data-gallery-transition={settings.transition}
    style={style}
    onMouseEnter={() => settings.autoplay && setInteractionPaused(true)}
    onMouseLeave={() => settings.autoplay && setInteractionPaused(false)}
    onFocusCapture={() => settings.autoplay && setInteractionPaused(true)}
    onBlurCapture={(event) => {
      if (settings.autoplay && !event.currentTarget.contains(event.relatedTarget as Node | null)) setInteractionPaused(false);
    }}
    onTouchStart={(event) => {
      if (event.touches.length === 1) touch.current = event.touches[0].clientX;
    }}
    onTouchEnd={(event) => {
      if (touch.current === null || !event.changedTouches[0]) return;
      const delta = event.changedTouches[0].clientX - touch.current;
      touch.current = null;
      if (Math.abs(delta) > 48) move(delta < 0 ? 1 : -1);
    }}
  >
    {preview && onEdit && <button type="button" className="ugc-gallery-edit" onClick={onEdit}>{tr("Atur Foto Galeri")}</button>}
    <div
      data-studio-native-object="object:gallery:grid"
      className="ugc-gallery-stage"
      role="region"
      aria-roledescription="carousel"
      aria-label={tr("Galeri Foto")}
      aria-live={settings.autoplay && !paused ? "off" : "polite"}
    >
      {photos.map((photo, index) => {
        const stackPosition = index === active ? "active" : index === previous ? "previous" : index === next ? "next" : "hidden";
        return <figure
          key={photo.id}
          data-active={index === active ? "true" : "false"}
          data-stack-position={stackPosition}
          aria-hidden={index === active ? undefined : true}
          className="ugc-gallery-slide"
        >
          <span data-invitation-photo-slot="gallery" data-studio-photo-id={photo.id} className="ugc-gallery-photo-motion">
            <img src={photo.url} alt={photo.title || `${tr("Galeri foto")} ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          </span>
        </figure>;
      })}
    </div>

    {photos.length > 1 && <div className="ugc-gallery-controls">
      <button type="button" className="ugc-gallery-arrow" aria-label={tr("Foto Sebelumnya")} onClick={() => move(-1)}><ChevronLeft size={18} /></button>
      <div className="ugc-gallery-dots" aria-label={tr("Galeri Foto")}>
        {photos.map((photo, index) => <button
          key={photo.id}
          type="button"
          aria-label={`${tr("Foto")} ${index + 1}`}
          aria-current={index === active ? "true" : undefined}
          onClick={() => setActive(index)}
        />)}
      </div>
      {settings.autoplay && <button
        type="button"
        className="ugc-gallery-pause"
        aria-label={manualPaused ? (language === "EN" ? "Resume gallery autoplay" : "Lanjutkan autoplay galeri") : (language === "EN" ? "Pause gallery autoplay" : "Jeda autoplay galeri")}
        aria-pressed={manualPaused}
        onClick={() => setManualPaused((value) => !value)}
      >{manualPaused ? <Play size={14} /> : <Pause size={14} />}</button>}
      <button type="button" className="ugc-gallery-arrow" aria-label={tr("Foto Berikutnya")} onClick={() => move(1)}><ChevronRight size={18} /></button>
    </div>}
    <p className="ugc-gallery-counter" aria-live="polite">{active + 1} / {photos.length}</p>
  </div>;
}
