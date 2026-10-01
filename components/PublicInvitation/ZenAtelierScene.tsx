"use client";

import Image from "next/image";
import { useState } from "react";
import { MailOpen } from "lucide-react";
import type { PhotoCrop } from "@/lib/templates/photo-slots";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";
import { displayTitleCase } from "@/lib/text/display-title-case";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import { BlossomBranch, EnsoSun, InkMountains } from "@/components/PublicInvitation/ZenAtelierArtwork";
import "./zen-atelier.css";

type ZenAtelierSceneProps = {
  names: string;
  date: string;
  cover?: string;
  focus?: "top" | "center" | "bottom";
  crop?: PhotoCrop | null;
  cropEditing?: boolean;
  onCropChange?: (crop: PhotoCrop) => void;
  onFinishCrop?: () => void;
  locale?: string;
  stage: "envelope" | "cover";
  onOpen: (immediate?: boolean) => void;
  onEditPhoto?: () => void;
  preview?: boolean;
  allowEnvelopeOpen?: boolean;
  isWedding?: boolean;
  hashtag?: string | null;
  recipientLine?: string;
  motionEnabled?: boolean;
};

const root = "/templates/zen-atelier/";

export default function ZenAtelierScene({
  names,
  date,
  cover,
  focus = "center",
  crop,
  cropEditing = false,
  onCropChange,
  onFinishCrop,
  locale,
  stage,
  onOpen,
  onEditPhoto,
  preview = false,
  allowEnvelopeOpen = false,
  isWedding = true,
  hashtag,
  recipientLine,
  motionEnabled = true,
}: ZenAtelierSceneProps) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const [opening, setOpening] = useState(false);
  const title = displayTitleCase(names);
  const couple = isWedding ? title.split(/\s*&\s*/).filter(Boolean) : [];
  const photoStyle = crop
    ? {
        objectPosition: `${crop.x}% ${crop.y}%`,
        transform: crop.zoom === 1 ? undefined : `scale(${crop.zoom})`,
        transformOrigin: `${crop.x}% ${crop.y}%`,
      }
    : { objectPosition: `center ${focus}` };
  const cropEditor = cropEditing && crop && onCropChange && onFinishCrop
    ? <StudioPhotoCropOverlay crop={crop} onChange={onCropChange} onDone={onFinishCrop} locale={locale} />
    : null;

  if (stage === "envelope") {
    return (
      <section
        data-invitation-section="envelope"
        className="zen-scene zen-envelope"
        data-opening={opening && motionEnabled ? "true" : undefined}
      >
        <div className="zen-jp-atmosphere" aria-hidden="true" data-studio-native-object="object:envelope:atmosphere-group">
          <div className="zen-jp-shoji" data-studio-native-object="object:envelope:shoji" />
          <EnsoSun className="zen-jp-sun" studioObject="object:envelope:sun" />
          <BlossomBranch className="zen-jp-branch" studioObject="object:envelope:branch" />
          <InkMountains className="zen-jp-mountains" studioObject="object:envelope:mountains" />
        </div>

        <div className="zen-jp-intro" data-studio-native-object="object:envelope:intro-group">
          <span className="zen-jp-kicker" lang="ja" data-studio-native-object="object:envelope:kicker">
            {isWedding ? "結婚式のご案内" : "ご招待"}
          </span>
          <p className="zen-envelope-greeting" data-studio-native-object="object:envelope:greeting">
            {language === "EN" ? tr("Sebuah undangan untuk orang istimewa") : <>Sebuah undangan<br />untuk orang istimewa</>}
          </p>
          {recipientLine && (
            <p
              data-personal-envelope-address
              data-studio-native-object="object:envelope:address"
              className="mt-3 max-w-[250px] break-words text-center text-[10px] font-semibold leading-4"
            >
              {recipientLine}
            </p>
          )}
          <span className="zen-envelope-rule" aria-hidden="true" data-studio-native-object="object:envelope:intro-rule" />
        </div>

        <div className="zen-jp-paper-stage" aria-hidden="true" data-studio-native-object="object:envelope:paper-stage">
          <div className="zen-jp-envelope-shell" data-studio-native-object="object:envelope:shell" />
          <div className="zen-jp-letter" data-studio-native-object="object:envelope:letter">
            <span className="zen-jp-letter-kicker" data-studio-native-object="object:envelope:letter-kicker">ZEN ATELIER</span>
            <span className="zen-jp-letter-names" data-studio-native-object="object:envelope:names">{title}</span>
            <span className="zen-jp-letter-rule" data-studio-native-object="object:envelope:letter-rule" />
            <span className="zen-jp-letter-date" data-studio-native-object="object:envelope:date">{date}</span>
          </div>
          <div className="zen-jp-fold-left" data-studio-native-object="object:envelope:fold-left" />
          <div className="zen-jp-fold-right" data-studio-native-object="object:envelope:fold-right" />
          <div className="zen-jp-fold-bottom" data-studio-native-object="object:envelope:fold-bottom" />
          <div className="zen-jp-fold-top" data-studio-native-object="object:envelope:fold-top" />
          <div className="zen-jp-mizuhiki-band" data-studio-native-object="object:envelope:mizuhiki">
            <svg className="zen-jp-mizuhiki" viewBox="0 0 260 94" fill="none" focusable="false">
              <path d="M0 49C55 49 83 49 110 45c18-3 34-18 48-22 12-4 28 0 30 13 2 14-19 25-37 21-18-4-40-26-30-39 10-13 34 1 44 14 14 20 32 19 95 19" stroke="var(--jp-accent)" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 55c58 0 84-2 113-6 22-3 34 26 54 27 21 2 27-14 17-27-12-14-47-9-45 7 2 12 28 17 47 12 23-7 42-12 74-13" stroke="var(--jp-soft)" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M0 43c56 1 80 4 115 9 22 4 39-30 59-28 17 1 19 15 8 25-14 14-42 10-51-4-10-17 10-26 27-24 24 3 30 24 102 22" stroke="color-mix(in srgb,var(--jp-accent) 55%,var(--jp-paper))" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M0 60c55-2 89-7 114-12 22-6 36 9 51 10 23 2 42-5 95-4" stroke="color-mix(in srgb,var(--jp-soft) 80%,var(--jp-paper-ink))" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="zen-jp-seal" lang="ja" data-studio-native-object="object:envelope:seal">{isWedding ? "寿" : "和"}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={opening}
          className="zen-open"
          data-studio-system-action={preview ? "open-invitation" : undefined}
          data-studio-native-object="object:envelope:open-button"
          onClick={() => {
            if (preview && !allowEnvelopeOpen) return;
            if (!motionEnabled) {
              onOpen(true);
              return;
            }
            setOpening(true);
            onOpen();
          }}
        >
          <span className="zen-envelope-action-icon" aria-hidden="true"><MailOpen size={17} strokeWidth={1.35} /></span>
          <span>{tr("Buka Undangan")}</span>
        </button>
      </section>
    );
  }

  return (
    <section data-invitation-section="cover" className="zen-scene zen-cover">
      <div aria-hidden="true" className="zen-cover-paper-shadow" data-studio-native-object="object:cover:paper-shadow" />
      <div aria-hidden="true" className="zen-cover-shoji" data-studio-native-object="object:cover:shoji" />
      <EnsoSun className="zen-cover-sun" studioObject="object:cover:sun" />
      <BlossomBranch className="zen-cover-branch" studioObject="object:cover:branch" />

      <div className="zen-cover-scroll" data-studio-native-object="object:cover:scroll-group">
        <span aria-hidden="true" className="zen-cover-scroll-rod zen-cover-scroll-rod-top" data-studio-native-object="object:cover:scroll-rod-top" />
        <div className="zen-cover-photo-frame" data-studio-native-object="object:cover:photo-frame">
          <span data-invitation-photo-slot="cover" className="zen-cover-photo-slot">
            {cover ? (
              <img src={cover} alt={tr("Foto utama undangan")} className="zen-cover-photo" style={photoStyle} />
            ) : (
              <Image
                src={root + "japanroom1.webp"}
                alt=""
                aria-hidden="true"
                width={1122}
                height={1402}
                sizes="(max-width: 640px) 62vw, 360px"
                className="zen-cover-photo zen-cover-photo-fallback"
              />
            )}
            {onEditPhoto && !cropEditing && (
              <button type="button" onClick={onEditPhoto} className="zen-cover-edit-photo" aria-label={tr("Atur foto cover")}>
                {tr("Atur foto")}
              </button>
            )}
            {cropEditor}
          </span>
        </div>
        <span aria-hidden="true" className="zen-cover-scroll-rod zen-cover-scroll-rod-bottom" data-studio-native-object="object:cover:scroll-rod-bottom" />
      </div>

      <div className="zen-cover-copy" data-studio-native-object="object:cover:copy-group">
        <span className="zen-cover-seal" lang="ja" data-studio-native-object="object:cover:seal">{isWedding ? "縁" : "和"}</span>
        <p className="zen-kicker" data-studio-native-object="object:cover:kicker">{tr(isWedding ? "The Wedding Of" : "Sebuah Undangan")}</p>
        <h1 data-studio-native-heading="">
          {couple.length === 2 ? (
            <>
              <span data-studio-native-object="object:cover:personOne-name">{couple[0]}</span>
              <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
              <span data-studio-native-object="object:cover:personTwo-name">{couple[1]}</span>
            </>
          ) : (
            <span data-studio-native-object="object:cover:event-name">{title}</span>
          )}
        </h1>
        <div className="zen-cover-date-block" data-studio-native-object="object:cover:date">
          <span aria-hidden="true" />
          <p>{date}</p>
        </div>
        {hashtag?.trim() && <p className="zen-hashtag" data-studio-native-object="object:cover:hashtag">{hashtag}</p>}
      </div>

      <InkMountains className="zen-cover-mountain" studioObject="object:cover:mountains" />
      <p aria-hidden="true" className="zen-cover-vertical-word" lang="ja" data-studio-native-object="object:cover:vertical-word">
        静かな祝福
      </p>
    </section>
  );
}
