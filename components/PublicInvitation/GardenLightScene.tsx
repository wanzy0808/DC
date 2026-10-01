"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ImageIcon } from "lucide-react";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";
import { GardenLightArt } from "@/components/PublicInvitation/GardenLightArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import type { PhotoCrop } from "@/lib/templates/photo-slots";
import "./garden-light.css";

type Props = {
  names: string; date: string; couple?: boolean; cover?: string;
  focus: "top" | "center" | "bottom"; crop?: PhotoCrop | null;
  cropEditing?: boolean; onCropChange?: (crop: PhotoCrop) => void; onFinishCrop?: () => void;
  locale?: string; onEditPhoto?: () => void;
  stage: "envelope" | "cover"; onOpen: (immediate?: boolean) => void;
  preview?: boolean; allowEnvelopeOpen?: boolean; recipientLine?: string; motionEnabled?: boolean;
};

export default function GardenLightScene({ names, date, couple, cover, focus, crop, cropEditing, onCropChange, onFinishCrop, locale, onEditPhoto, stage, onOpen, preview = false, allowEnvelopeOpen = false, recipientLine, motionEnabled = true }: Props) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const still = reduced || !motionEnabled;
  const ease = [.22, 1, .36, 1] as const;
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");
  const photoStyle = crop ? { objectPosition: `${crop.x}% ${crop.y}%`, transform: crop.zoom === 1 ? undefined : `scale(${crop.zoom})`, transformOrigin: `${crop.x}% ${crop.y}%` } : { objectPosition: `center ${focus}` };

  if (stage === "envelope") return <section className="gl-envelope" data-garden-light-stage="envelope">
    <div aria-hidden="true" className="gl-fireflies gl-fireflies-envelope" />
    <GardenLightArt objectKey="object:envelope:hanging-lantern-art" asset="hangingLantern" className="gl-envelope-hanging" eager />
    <p data-studio-native-object="object:envelope:kicker" className="gl-envelope-kicker">{tr("Sebuah Undangan Untuk Anda")}</p>
    <h1 data-studio-native-heading="" className="gl-envelope-names">{names}</h1>
    <p data-studio-native-object="object:envelope:date" className="gl-envelope-date">{date}</p>

    <div data-studio-native-object="object:envelope:card-stage" className="gl-envelope-stage">
      <GardenLightArt objectKey="object:envelope:birdcage-art" asset="birdcage" className="gl-envelope-birdcage" eager />
      <motion.div className="gl-envelope-letter-motion" animate={{ y: opening && !still ? -58 : 0, rotate: opening && !still ? -1.5 : 0, opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .68, delay: still ? 0 : .14, ease }}>
        <div data-studio-native-object="object:envelope:letter-paper" className="gl-envelope-letter">
          <p data-studio-native-object="object:envelope:letter-kicker" className="gl-letter-kicker">{tr("Untuk momen istimewa")}</p>
          {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="gl-recipient">{recipientLine}</p>}
          <p data-studio-native-object="object:envelope:letter-names" className="gl-letter-names">{names}</p>
        </div>
      </motion.div>
      <motion.span data-studio-native-object="object:envelope:seal" className="gl-envelope-seal" animate={{ scale: opening && !still ? .88 : 1, opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .26, ease }} aria-hidden="true">GL</motion.span>
    </div>

    <button type="button" className="gl-action gl-open" data-studio-native-object="object:envelope:open-button" data-studio-system-action={preview ? "open-invitation" : undefined} disabled={opening} onClick={(event) => {
      if ((preview && !allowEnvelopeOpen) || opening) { event.preventDefault(); event.stopPropagation(); return; }
      setOpening(true);
      onOpen(Boolean(still || event.detail === 0));
    }}>{tr("Buka Undangan")}<ArrowRight size={18} strokeWidth={1.35} aria-hidden="true" /></button>
  </section>;

  return <section className="gl-cover" data-garden-light-stage="cover">
    <div aria-hidden="true" className="gl-fireflies" />
    <GardenLightArt objectKey="object:cover:arch-art" asset="arch" className="gl-cover-arch" eager />
    <GardenLightArt objectKey="object:cover:garland-art" asset="garland" className="gl-cover-garland" eager />
    <p data-studio-native-object="object:cover:kicker" className="gl-cover-kicker">{tr("Senja di taman")}</p>

    <div data-studio-native-object="object:cover:media-group" className="gl-cover-media">
      <div data-studio-native-object="object:cover:photo-frame" className="gl-cover-photo-frame">
        <span data-invitation-photo-slot="cover" className="gl-cover-photo">
          {cover ? <img src={cover} alt={`${tr("Foto")} ${names}`} style={photoStyle} loading="eager" decoding="async" /> : <span className="gl-photo-empty"><ImageIcon size={27} strokeWidth={1} aria-hidden="true" />{tr("Foto belum ditambahkan.")}</span>}
          {onEditPhoto && !cropEditing && <button type="button" className="gl-photo-edit" onClick={onEditPhoto} aria-label={tr("Atur Foto Sampul")}>{tr("Atur Foto Sampul")}</button>}
          {cropEditing && crop && onCropChange && onFinishCrop && <StudioPhotoCropOverlay crop={crop} onChange={onCropChange} onDone={onFinishCrop} locale={locale} />}
        </span>
      </div>
      <GardenLightArt objectKey="object:cover:lantern-art" asset="lanterns" className="gl-cover-lanterns" eager />
    </div>

    <div data-studio-native-object="object:cover:copy-panel" className="gl-cover-copy">
      <h1 data-studio-native-heading="" className={`gl-cover-names ${paired ? "" : "gl-cover-single"}`}>
        {paired ? <><span data-studio-native-object="object:cover:personOne-name">{first}</span><em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em><span data-studio-native-object="object:cover:personTwo-name">{second}</span></> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
      </h1>
      <p data-studio-native-object="object:cover:date" className="gl-cover-date">{date}</p>
      <p data-studio-native-object="object:cover:closing-copy" className="gl-cover-caption">{tr("Di bawah cahaya hangat, sebuah hari baru akan dimulai.")}</p>
    </div>
  </section>;
}
