"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ImageIcon } from "lucide-react";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import type { PhotoCrop, PhotoFocus } from "@/lib/templates/photo-slots";
import "./serein.css";

type Props = {
  names: string;
  date: string;
  stage: "envelope" | "cover";
  onOpen: () => void;
  preview?: boolean;
  isWedding?: boolean;
  couple?: boolean;
  recipientLine?: string;
  cover?: string;
  focus: PhotoFocus;
  crop?: PhotoCrop | null;
  cropEditing?: boolean;
  onCropChange?: (crop: PhotoCrop) => void;
  onFinishCrop?: () => void;
  onEditPhoto?: () => void;
  locale?: string;
};

/** A real alpha artwork layer: recolorable and selectable independently of the paper. */
export function SereinSprig({ objectKey, className = "" }: { objectKey: string; className?: string }) {
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`sr-sprig ${className}`}><span /></span>;
}

export default function SereinScene({ names, date, stage, onOpen, preview = false, isWedding, couple, recipientLine, cover, focus, crop, cropEditing, onCropChange, onFinishCrop, onEditPhoto, locale }: Props) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");
  const initials = paired ? `${Array.from(first.trim())[0] || ""}${Array.from(second.trim())[0] || ""}` : Array.from(names.trim()).slice(0, 2).join("");
  const cropStyle = crop
    ? { objectPosition: `${crop.x}% ${crop.y}%`, transform: `scale(${crop.zoom})`, transformOrigin: `${crop.x}% ${crop.y}%` }
    : { objectPosition: `center ${focus}` };

  if (stage === "envelope") return <section className="sr-envelope" data-serein-stage="envelope">
    <p data-studio-native-object="object:envelope:kicker" className="sr-envelope-intro">{tr("Sebuah Undangan Untuk Anda")}</p>
    <SereinSprig objectKey="object:envelope:sprig-art" className="sr-envelope-sprig" />
    <div data-studio-native-object="object:envelope:stationery-group" className="sr-stationery" data-opening={opening ? "true" : undefined}>
      <div data-studio-native-object="object:envelope:paper-back" className="sr-envelope-back" aria-hidden="true" />
      <motion.div className="sr-letter-motion" animate={{ transform: opening && !reduced ? "translateY(-42px)" : "translateY(0px)", opacity: opening ? 0 : 1 }} transition={{ duration: reduced ? 0 : .6, delay: reduced ? 0 : .25, ease: [.22, 1, .36, 1] }}>
        <div data-studio-native-object="object:envelope:letter-paper" className="sr-letter">
          <h1 data-studio-native-heading="">{names}</h1>
          <p data-studio-native-object="object:envelope:date">{date}</p>
        </div>
      </motion.div>
      <div data-studio-native-object="object:envelope:fold-left" className="sr-fold sr-fold-left" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-right" className="sr-fold sr-fold-right" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-bottom" className="sr-fold sr-fold-bottom" aria-hidden="true" />
      <motion.div className="sr-flap-motion" animate={{ transform: opening && !reduced ? "rotateX(165deg)" : "rotateX(0deg)", opacity: opening ? 0 : 1 }} transition={{ duration: reduced ? 0 : .55, ease: [.22, 1, .36, 1] }}>
        <div data-studio-native-object="object:envelope:fold-top" className="sr-fold sr-fold-top" aria-hidden="true" />
      </motion.div>
      <motion.div className="sr-seal-motion" animate={{ transform: opening && !reduced ? "translateY(12px) scale(.92)" : "translateY(0px) scale(1)", opacity: opening ? 0 : 1 }} transition={{ duration: reduced ? 0 : .2 }}>
        <span data-studio-native-object="object:envelope:seal" className="sr-seal" aria-hidden="true"><span>{initials}</span></span>
      </motion.div>
    </div>
    {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="sr-recipient">{recipientLine}</p>}
    <button type="button" data-studio-native-object="object:envelope:open-button" data-studio-system-action={preview ? "open-invitation" : undefined} className="sr-action sr-open" disabled={opening} aria-disabled={opening} onClick={(event) => {
      if (preview) { event.preventDefault(); event.stopPropagation(); return; }
      setOpening(true); onOpen();
    }}>{tr("Buka Undangan")}<ArrowRight size={17} strokeWidth={1.4} aria-hidden="true" /></button>
  </section>;

  return <section className="sr-cover" data-serein-stage="cover">
    <p data-studio-native-object="object:cover:kicker" className="sr-cover-intro">{tr("Kami Mengundang Anda")}</p>
    <SereinSprig objectKey="object:cover:sprig-art" className="sr-cover-sprig" />
    <h1 data-studio-native-heading="" className={`sr-cover-names ${paired ? "" : "sr-cover-single"}`}>
      {paired ? <><span data-studio-native-object="object:cover:personOne-name" className="sr-name-first">{first}</span><em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em><span data-studio-native-object="object:cover:personTwo-name" className="sr-name-second">{second}</span></> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
    </h1>
    <div className="sr-cover-bottom" data-studio-native-object="object:cover:composition-group">
      <div className="sr-cover-caption">
        <span data-studio-native-object="object:cover:side-label">{tr(isWedding ? "Pernikahan Kami" : "Hari Istimewa")}</span>
        <p data-studio-native-object="object:cover:date">{date}</p>
      </div>
      <div className="sr-cover-frame" data-studio-native-object="object:cover:photo-frame">
        <div data-invitation-photo-slot="cover" className="sr-cover-photo">
          {cover ? <img src={cover} alt={`${tr("Foto")} ${names}`} loading="eager" decoding="async" style={cropStyle} /> : <div className="sr-photo-empty"><ImageIcon size={26} strokeWidth={1} aria-hidden="true" /><span>{tr("Foto belum ditambahkan.")}</span></div>}
          {onEditPhoto && !cropEditing && <button type="button" onClick={onEditPhoto} className="sr-edit-photo" aria-label={tr("Atur Foto Sampul")}>{tr("Atur Foto Sampul")}</button>}
          {cropEditing && crop && onCropChange && onFinishCrop && <StudioPhotoCropOverlay crop={crop} onChange={onCropChange} onDone={onFinishCrop} locale={locale} />}
        </div>
      </div>
    </div>
  </section>;
}
