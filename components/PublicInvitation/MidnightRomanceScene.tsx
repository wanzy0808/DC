"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ImageIcon } from "lucide-react";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";
import { MidnightRomanceArt } from "@/components/PublicInvitation/MidnightRomanceArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import type { PhotoCrop } from "@/lib/templates/photo-slots";
import "./midnight-romance.css";

type Props = {
  names: string; date: string; couple?: boolean; cover?: string;
  focus: "top" | "center" | "bottom"; crop?: PhotoCrop | null;
  cropEditing?: boolean; onCropChange?: (crop: PhotoCrop) => void; onFinishCrop?: () => void;
  locale?: string; onEditPhoto?: () => void;
  stage: "envelope" | "cover"; onOpen: (immediate?: boolean) => void;
  preview?: boolean; allowEnvelopeOpen?: boolean; recipientLine?: string; motionEnabled?: boolean;
};

export default function MidnightRomanceScene({ names, date, couple, cover, focus, crop, cropEditing, onCropChange, onFinishCrop, locale, onEditPhoto, stage, onOpen, preview = false, allowEnvelopeOpen = false, recipientLine, motionEnabled = true }: Props) {
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

  if (stage === "envelope") return <section className="mr-envelope" data-midnight-stage="envelope">
    <div aria-hidden="true" data-studio-native-object="object:envelope:night-glow" className="mr-night-glow" />
    <MidnightRomanceArt objectKey="object:envelope:chandelier-art" asset="chandelier" className="mr-envelope-chandelier" eager />
    <MidnightRomanceArt objectKey="object:envelope:lantern-art" asset="lantern" className="mr-envelope-lantern" eager />
    <p data-studio-native-object="object:envelope:kicker" className="mr-envelope-kicker">{tr("Sebuah Undangan Untuk Anda")}</p>
    <h1 data-studio-native-heading="" className="mr-envelope-names">{names}</h1>
    <p data-studio-native-object="object:envelope:date" className="mr-envelope-date">{date}</p>

    <div data-studio-native-object="object:envelope:card-stage" className="mr-envelope-stage">
      <motion.div className="mr-envelope-card-motion" animate={{ y: opening && !still ? -54 : 0, rotate: opening && !still ? -1.2 : 0, opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .7, delay: still ? 0 : .12, ease }}>
        <div data-studio-native-object="object:envelope:letter-paper" className="mr-envelope-card">
          <p data-studio-native-object="object:envelope:letter-kicker" className="mr-letter-kicker">{tr("Untuk momen istimewa")}</p>
          {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="mr-recipient">{recipientLine}</p>}
          <p data-studio-native-object="object:envelope:letter-names" className="mr-letter-names">{names}</p>
          <span aria-hidden="true" data-studio-native-object="object:envelope:letter-star" className="mr-letter-star">✦</span>
        </div>
      </motion.div>
      <MidnightRomanceArt objectKey="object:envelope:garland-art" asset="garland" className="mr-envelope-garland" eager />
      <motion.span data-studio-native-object="object:envelope:seal" className="mr-envelope-seal" animate={{ scale: opening && !still ? .86 : 1, opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .24, ease }} aria-hidden="true">M</motion.span>
    </div>

    <button type="button" className="mr-action mr-open" data-studio-native-object="object:envelope:open-button" data-studio-system-action={preview ? "open-invitation" : undefined} disabled={opening} onClick={(event) => {
      if ((preview && !allowEnvelopeOpen) || opening) { event.preventDefault(); event.stopPropagation(); return; }
      setOpening(true);
      onOpen(Boolean(still || event.detail === 0));
    }}>{tr("Buka Undangan")}<ArrowRight size={18} strokeWidth={1.25} aria-hidden="true" /></button>
  </section>;

  return <section className="mr-cover" data-midnight-stage="cover">
    <div aria-hidden="true" data-studio-native-object="object:cover:night-glow" className="mr-night-glow mr-cover-glow" />
    <MidnightRomanceArt objectKey="object:cover:arch-art" asset="arch" className="mr-cover-arch" eager />
    <MidnightRomanceArt objectKey="object:cover:chandelier-art" asset="chandelier" className="mr-cover-chandelier" eager />
    <MidnightRomanceArt objectKey="object:cover:garland-art" asset="garland" className="mr-cover-garland" eager />
    <p data-studio-native-object="object:cover:kicker" className="mr-cover-kicker">{tr("Setelah cahaya terakhir")}</p>

    <div data-studio-native-object="object:cover:media-group" className="mr-cover-media">
      <div data-studio-native-object="object:cover:photo-frame" className="mr-cover-frame">
        <span data-invitation-photo-slot="cover" className="mr-cover-photo">
          {cover ? <img src={cover} alt={`${tr("Foto")} ${names}`} style={photoStyle} loading="eager" decoding="async" /> : <span className="mr-photo-empty"><ImageIcon size={28} strokeWidth={1} aria-hidden="true" />{tr("Foto belum ditambahkan.")}</span>}
          {onEditPhoto && !cropEditing && <button type="button" className="mr-photo-edit" onClick={onEditPhoto} aria-label={tr("Atur Foto Sampul")}>{tr("Atur Foto Sampul")}</button>}
          {cropEditing && crop && onCropChange && onFinishCrop && <StudioPhotoCropOverlay crop={crop} onChange={onCropChange} onDone={onFinishCrop} locale={locale} />}
        </span>
      </div>
    </div>

    <div data-studio-native-object="object:cover:copy-panel" className="mr-cover-copy">
      <h1 data-studio-native-heading="" className={`mr-cover-names ${paired ? "" : "mr-cover-single"}`}>
        {paired ? <><span data-studio-native-object="object:cover:personOne-name">{first}</span><em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em><span data-studio-native-object="object:cover:personTwo-name">{second}</span></> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
      </h1>
      <div className="mr-cover-meta">
        <p data-studio-native-object="object:cover:date" className="mr-cover-date">{date}</p>
        <p data-studio-native-object="object:cover:closing-copy" className="mr-cover-caption">{tr("Malam menyimpan cahaya yang hanya kita berdua mengerti.")}</p>
      </div>
    </div>
  </section>;
}
