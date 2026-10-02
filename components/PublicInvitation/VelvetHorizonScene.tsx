"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ImageIcon } from "lucide-react";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import type { PhotoCrop } from "@/lib/templates/photo-slots";
import { VelvetHorizonArt } from "@/components/PublicInvitation/VelvetHorizonArtwork";
import "./velvet-horizon.css";

type Props = {
  names: string;
  date: string;
  couple?: boolean;
  cover?: string;
  focus: "top" | "center" | "bottom";
  crop?: PhotoCrop | null;
  cropEditing?: boolean;
  onCropChange?: (crop: PhotoCrop) => void;
  onFinishCrop?: () => void;
  locale?: string;
  onEditPhoto?: () => void;
  stage: "envelope" | "cover";
  onOpen: (immediate?: boolean) => void;
  preview?: boolean;
  allowEnvelopeOpen?: boolean;
  recipientLine?: string;
  motionEnabled?: boolean;
};

export default function VelvetHorizonScene({
  names,
  date,
  couple,
  cover,
  focus,
  crop,
  cropEditing,
  onCropChange,
  onFinishCrop,
  locale,
  onEditPhoto,
  stage,
  onOpen,
  preview = false,
  allowEnvelopeOpen = false,
  recipientLine,
  motionEnabled = true,
}: Props) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const still = reduced || !motionEnabled;
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");
  const ease = [.22, 1, .36, 1] as const;
  const photoStyle = crop
    ? {
        objectPosition: `${crop.x}% ${crop.y}%`,
        transform: crop.zoom === 1 ? undefined : `scale(${crop.zoom})`,
        transformOrigin: `${crop.x}% ${crop.y}%`,
      }
    : { objectPosition: `center ${focus}` };

  if (stage === "envelope") {
    return (
      <section data-invitation-section="envelope" className="vh-envelope">
        <div aria-hidden="true" data-studio-native-object="object:envelope:sunset-glow" className="vh-envelope-glow" />
        <VelvetHorizonArt objectKey="object:envelope:blossom-art" asset="blossom" className="vh-envelope-blossom" eager />
        <VelvetHorizonArt objectKey="object:envelope:garland-art" asset="garland" className="vh-envelope-garland" eager />

        <div data-studio-native-object="object:envelope:intro" className="vh-envelope-intro">
          <p data-studio-native-object="object:envelope:kicker" className="vh-envelope-kicker">{tr("A personal invitation")}</p>
          <p data-studio-native-object="object:envelope:date" className="vh-envelope-date">{date}</p>
        </div>

        <div data-studio-native-object="object:envelope:stationery-group" className="vh-envelope-stage">
          <motion.div
            data-studio-native-object="object:envelope:paper"
            className="vh-envelope-paper"
            animate={{
              y: opening && !still ? -44 : 0,
              opacity: opening ? 0 : 1,
              rotate: opening && !still ? -1.2 : 0,
            }}
            transition={{ duration: still ? 0 : .62, delay: still ? 0 : .14, ease }}
          >
            <div data-studio-native-object="object:envelope:letter" className="vh-envelope-letter">
              <span aria-hidden="true" className="vh-envelope-arch-line" />
              <p data-studio-native-object="object:envelope:letter-kicker" className="vh-envelope-letter-kicker">{tr("Untuk hari yang kami nantikan")}</p>
              {recipientLine && (
                <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="vh-envelope-recipient">
                  {recipientLine}
                </p>
              )}
              <h1 data-studio-native-heading="" data-studio-native-object="object:envelope:names" className="vh-envelope-names">{names}</h1>
              <p className="vh-envelope-letter-date">{date}</p>
            </div>

            <motion.div
              aria-hidden="true"
              data-studio-native-object="object:envelope:flap"
              className="vh-envelope-flap"
              animate={{ rotateX: opening && !still ? -154 : 0 }}
              transition={{ duration: still ? 0 : .52, ease }}
            />
            <motion.span
              aria-hidden="true"
              data-studio-native-object="object:envelope:seal"
              className="vh-envelope-seal"
              animate={{ scale: opening && !still ? .82 : 1, opacity: opening ? 0 : 1 }}
              transition={{ duration: still ? 0 : .24, ease }}
            >
              VH
            </motion.span>
          </motion.div>
        </div>

        <button
          type="button"
          className="vh-action vh-open"
          data-studio-native-object="object:envelope:open-button"
          data-studio-system-action={preview ? "open-invitation" : undefined}
          disabled={opening}
          onClick={(event) => {
            if ((preview && !allowEnvelopeOpen) || opening) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            setOpening(true);
            onOpen(Boolean(still || event.detail === 0));
          }}
        >
          {tr("Buka Undangan")}
          <ArrowRight size={17} strokeWidth={1.3} aria-hidden="true" />
        </button>
      </section>
    );
  }

  const cropEditor = cropEditing && crop && onCropChange && onFinishCrop
    ? <StudioPhotoCropOverlay crop={crop} onChange={onCropChange} onDone={onFinishCrop} locale={locale} />
    : null;

  return (
    <section data-invitation-section="cover" className="vh-cover">
      <div aria-hidden="true" data-studio-native-object="object:cover:sunset-field" className="vh-cover-sunset" />

      <div data-studio-native-object="object:cover:media-group" className="vh-cover-media">
        <span data-invitation-photo-slot="cover" className="vh-cover-photo-slot">
          {cover ? (
            <img src={cover} alt={`${tr("Foto")} ${names}`} style={photoStyle} loading="eager" decoding="async" />
          ) : (
            <span className="vh-cover-photo-empty">
              <ImageIcon size={27} strokeWidth={1} aria-hidden="true" />
              {tr("Foto belum ditambahkan.")}
            </span>
          )}
          {onEditPhoto && !cropEditing && (
            <button type="button" className="vh-cover-photo-edit" onClick={onEditPhoto} aria-label={tr("Atur Foto Sampul")}>
              {tr("Atur Foto Sampul")}
            </button>
          )}
          {cropEditor}
        </span>
      </div>

      <div aria-hidden="true" data-studio-native-object="object:cover:horizon-glaze" className="vh-cover-horizon-glaze" />
      <VelvetHorizonArt objectKey="object:cover:arch-art" asset="arch" className="vh-cover-arch" eager />
      <VelvetHorizonArt objectKey="object:cover:drape-art" asset="drape" className="vh-cover-drape" eager />
      <VelvetHorizonArt objectKey="object:cover:blossom-art" asset="blossom" className="vh-cover-blossom" eager />
      <VelvetHorizonArt objectKey="object:cover:sunset-disc-art" asset="sunsetDisc" className="vh-cover-disc" eager />
      <VelvetHorizonArt objectKey="object:cover:lantern-art" asset="lanterns" className="vh-cover-lanterns" eager />

      <div data-studio-native-object="object:cover:copy-panel" className="vh-cover-copy">
        <p data-studio-native-object="object:cover:kicker" className="vh-cover-kicker">{tr("The Wedding Of")}</p>
        <h1 data-studio-native-heading="" className={`vh-cover-names ${paired ? "" : "vh-cover-single"}`}>
          {paired ? (
            <>
              <span data-studio-native-object="object:cover:personOne-name">{first}</span>
              <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
              <span data-studio-native-object="object:cover:personTwo-name">{second}</span>
            </>
          ) : (
            <span data-studio-native-object="object:cover:event-name">{names}</span>
          )}
        </h1>
        <p data-studio-native-object="object:cover:date" className="vh-cover-date">{date}</p>
        <span aria-hidden="true" data-studio-native-object="object:cover:rule" className="vh-cover-rule" />
        <p data-studio-native-object="object:cover:closing-copy" className="vh-cover-caption">
          {tr("Senja hangat, janji yang lembut, dan satu perjalanan baru.")}
        </p>
      </div>
    </section>
  );
}
