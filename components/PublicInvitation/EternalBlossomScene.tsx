"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ImageIcon } from "lucide-react";
import { BlossomArt, BlossomScallop, BlossomSymbol } from "@/components/PublicInvitation/EternalBlossomArtwork";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";
import type { PhotoCrop } from "@/lib/templates/photo-slots";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./eternal-blossom.css";

type Props = {
  names: string; date: string; couple?: boolean; cover?: string;
  focus: "top" | "center" | "bottom"; crop?: PhotoCrop | null;
  cropEditing?: boolean; onCropChange?: (crop: PhotoCrop) => void; onFinishCrop?: () => void;
  locale?: string; onEditPhoto?: () => void;
  stage: "envelope" | "cover"; onOpen: (immediate?: boolean) => void;
  preview?: boolean; allowEnvelopeOpen?: boolean; recipientLine?: string; motionEnabled?: boolean;
};

export default function EternalBlossomScene({ names, date, couple, cover, focus, crop, cropEditing, onCropChange, onFinishCrop, locale, onEditPhoto, stage, onOpen, preview = false, allowEnvelopeOpen = false, recipientLine, motionEnabled = true }: Props) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const still = reduced || !motionEnabled;
  const ease = [.22, 1, .36, 1] as const;
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");

  if (stage === "envelope") return <section className="eb-envelope" data-blossom-stage="envelope">
    <h1 data-studio-native-heading="" className="eb-envelope-names">{names}</h1>
    <p data-studio-native-object="object:envelope:date" className="eb-envelope-date">{date}</p>
    <div data-studio-native-object="object:envelope:card-stage" className="eb-stationery">
      <BlossomArt objectKey="object:envelope:flower-right" className="eb-envelope-sprig" branch eager />
      <div data-studio-native-object="object:envelope:card" className="eb-envelope-back" aria-hidden="true" />
      <motion.div className="eb-letter-motion" animate={{ transform: opening && !still ? "translateY(-65px) rotate(-2deg)" : "translateY(0px) rotate(0deg)", opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .7, delay: still ? 0 : .2, ease }}>
        <div data-studio-native-object="object:envelope:letter-paper" className="eb-letter">
          <BlossomSymbol />
          <p data-studio-native-object="object:envelope:letter-names">{names}</p>
        </div>
      </motion.div>
      <div data-studio-native-object="object:envelope:fold-left" className="eb-fold eb-fold-left" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-right" className="eb-fold eb-fold-right" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-bottom" className="eb-fold eb-fold-bottom" aria-hidden="true" />
      <motion.div className="eb-flap-motion" animate={{ transform: opening && !still ? "rotateX(175deg)" : "rotateX(0deg)" }} transition={{ duration: still ? 0 : .55, delay: still ? 0 : .08, ease }}>
        <div data-studio-native-object="object:envelope:flap" className="eb-fold eb-fold-top" aria-hidden="true" />
      </motion.div>
      <motion.div className="eb-seal-motion" animate={{ transform: opening && !still ? "translateY(-14px) rotate(-12deg) scale(.96)" : "translateY(0px) rotate(0deg) scale(1)", opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .25, ease }}>
        <span data-studio-native-object="object:envelope:seal" className="eb-seal" aria-hidden="true"><BlossomSymbol /></span>
      </motion.div>
      <BlossomArt objectKey="object:envelope:flower" className="eb-envelope-flower" eager />
    </div>
    {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="eb-recipient">{recipientLine}</p>}
    <button type="button" className="eb-action eb-open" data-studio-native-object="object:envelope:open-button" data-studio-system-action={preview ? "open-invitation" : undefined} disabled={opening} onClick={event => {
      if ((preview && !allowEnvelopeOpen) || opening) { event.preventDefault(); event.stopPropagation(); return; }
      setOpening(true);
      onOpen(Boolean(still || event.detail === 0));
    }}>{tr("Buka Undangan")}<ArrowRight size={19} strokeWidth={1.3} aria-hidden="true" /></button>
  </section>;

  const photoStyle = crop ? { objectPosition: `${crop.x}% ${crop.y}%`, transform: crop.zoom === 1 ? undefined : `scale(${crop.zoom})`, transformOrigin: `${crop.x}% ${crop.y}%` } : { objectPosition: `center ${focus}` };
  return <section className="eb-cover" data-blossom-stage="cover">
    <p data-studio-native-object="object:cover:kicker" className="eb-cover-intro">{tr("Kami Mengundang Anda")}</p>
    <div className="eb-cover-composition">
      <div data-studio-native-object="object:cover:photo-frame" className="eb-cover-frame">
        <BlossomScallop />
        <div data-studio-native-object="object:cover:photo-window" className="eb-cover-window">
          <span data-invitation-photo-slot="cover" className="eb-cover-photo">
            {cover ? <img src={cover} alt={`${tr("Foto")} ${names}`} style={photoStyle} loading="eager" decoding="async" /> : <span className="eb-photo-empty"><ImageIcon size={28} strokeWidth={1} aria-hidden="true" />{tr("Foto belum ditambahkan.")}</span>}
            {onEditPhoto && !cropEditing && <button type="button" className="eb-photo-edit" onClick={onEditPhoto} aria-label={tr("Atur Foto Sampul")}>{tr("Atur Foto Sampul")}</button>}
            {cropEditing && crop && onCropChange && onFinishCrop && <StudioPhotoCropOverlay crop={crop} onChange={onCropChange} onDone={onFinishCrop} locale={locale} />}
          </span>
        </div>
      </div>
      <BlossomArt objectKey="object:cover:flower-left" className="eb-cover-branch" branch eager />
      <BlossomArt objectKey="object:cover:flower-right" className="eb-cover-sprig" eager />
    </div>
    <h1 data-studio-native-heading="" className={`eb-cover-names ${paired ? "" : "eb-cover-single"}`}>
      {paired ? <><span data-studio-native-object="object:cover:personOne-name" className="eb-name-first">{first}</span><span className="eb-name-line"><em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em><span data-studio-native-object="object:cover:personTwo-name" className="eb-name-second">{second}</span></span></> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
    </h1>
    <p data-studio-native-object="object:cover:date" className="eb-cover-date">{date}</p>
    <span data-studio-native-object="object:cover:ornament" className="eb-cover-ornament" aria-hidden="true"><BlossomSymbol /></span>
  </section>;
}
