"use client";

import { useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { Play } from "lucide-react";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./pencil-reverie.css";

const assetRoot = "/templates/pencil-reverie/";

type SceneProps = {
  stage: "envelope" | "cover";
  names: string;
  date: string;
  onOpen: (immediate?: boolean) => void;
  isWedding?: boolean;
  hashtag?: string | null;
  preview?: boolean;
  allowEnvelopeOpen?: boolean;
  recipientLine?: string;
  motionEnabled?: boolean;
};

function PaperIllustration({
  file,
  width = 1122,
  height = 1402,
  priority = false,
  className = "",
  studioObject,
}: {
  file: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  studioObject?: string;
}) {
  return (
    <Image
      src={assetRoot + file}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      sizes="(max-width: 640px) 100vw, 560px"
      priority={priority}
      className={className}
      data-studio-native-object={studioObject}
    />
  );
}

function HeartDoodle({ studioObject, className = "" }: { studioObject?: string; className?: string }) {
  return (
    <svg className={"pr-heart-doodle " + className} aria-hidden="true" viewBox="0 0 64 62" fill="none" data-studio-native-object={studioObject}>
      <path
        d="M31 56C16 41 3 30 6 18 10 1 25 7 32 21 41 2 56 8 59 20c3 14-17 30-28 36Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PencilReverieScene({
  stage,
  names,
  date,
  onOpen,
  isWedding = true,
  hashtag,
  preview = false,
  allowEnvelopeOpen = false,
  recipientLine,
  motionEnabled = true,
}: SceneProps) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const still = Boolean(reduced || !motionEnabled);
  const couple = isWedding ? names.split(/\s*&\s*/).filter(Boolean) : [];
  const longName = names.length > 29 || couple.some((name) => name.length > 17);

  const handleOpen = () => {
    if ((preview && !allowEnvelopeOpen) || opening) return;
    setOpening(true);
    onOpen(still);
  };

  if (stage === "envelope") {
    return (
      <section
        data-invitation-section="envelope"
        data-pr-opening={opening || undefined}
        data-pr-motion={still ? "off" : "on"}
        className="pr-scene pr-envelope"
      >
        <div className="pr-envelope-index" aria-hidden data-studio-native-object="object:envelope:index-mark">01</div>
        <div className="pr-gate-intro" data-studio-native-object="object:envelope:intro">
          <span className="pr-overline" data-studio-native-object="object:envelope:kicker">{tr("A LITTLE STORY OF US")}</span>
          <p data-studio-native-object="object:envelope:intro-copy">{tr("Setiap cerita punya awalnya.")}</p>
        </div>

        <div className="pr-letter-illustration" data-studio-native-object="object:envelope:illustration-group">
          <span aria-hidden className="pr-envelope-shadow" data-studio-native-object="object:envelope:paper-shadow" />
          <PaperIllustration file="bingkai.webp" priority className="pr-letter-paper" studioObject="object:envelope:letter-art" />
          <PaperIllustration file="ribbon.webp" width={1254} height={1254} priority className="pr-envelope-ribbon" studioObject="object:envelope:ribbon-art" />
          <PaperIllustration file="loveticket.webp" width={1448} height={1086} priority className="pr-envelope-ticket" studioObject="object:envelope:ticket-art" />

          <div className="pr-letter-copy" data-studio-native-object="object:envelope:copy-panel">
            <p data-studio-native-object="object:envelope:letter-kicker">{tr("Untuk momen istimewa")}</p>
            {recipientLine && (
              <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="pr-recipient-line">
                {recipientLine}
              </p>
            )}
            <h1 data-studio-native-heading="">{names}</h1>
            <span data-studio-native-object="object:envelope:date">{date}</span>
          </div>
          <HeartDoodle studioObject="object:envelope:heart" className="pr-envelope-heart" />
        </div>

        <button
          className="pr-open-button"
          type="button"
          onClick={handleOpen}
          disabled={opening}
          data-studio-system-action={preview ? "open-invitation" : undefined}
          data-studio-native-object="object:envelope:open-button"
        >
          <Play size={15} aria-hidden="true" fill="currentColor" />
          {tr("Buka Undangan")}
        </button>
      </section>
    );
  }

  return (
    <section
      data-invitation-section="cover"
      data-pr-long={longName || undefined}
      className="pr-scene pr-cover"
    >
      <span aria-hidden className="pr-cover-desk" data-studio-native-object="object:cover:desk-field" />
      <span aria-hidden className="pr-cover-sheet" data-studio-native-object="object:cover:paper-sheet" />

      <div className="pr-cover-heading-group" data-studio-native-object="object:cover:heading-group">
        <header className="pr-cover-copy" data-studio-native-object="object:cover:copy-panel">
          <span className="pr-overline" data-studio-native-object="object:cover:kicker">
            {tr(isWedding ? "THE WEDDING OF" : "Sebuah Undangan")}
          </span>
          <h1 className="pr-cover-names" data-studio-native-heading="">
            {couple.length === 2 ? (
              <>
                <span data-studio-native-object="object:cover:personOne-name">{couple[0]}</span>
                <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
                <span data-studio-native-object="object:cover:personTwo-name">{couple[1]}</span>
              </>
            ) : (
              <span data-studio-native-object="object:cover:event-name">{names}</span>
            )}
          </h1>
          <p className="pr-cover-date" data-studio-native-object="object:cover:date">{date}</p>
          {hashtag?.trim() && <p className="pr-cover-hashtag" data-studio-native-object="object:cover:hashtag">{hashtag}</p>}
        </header>
      </div>

      <div className="pr-cover-illustration-group" data-studio-native-object="object:cover:illustration-group">
        <span className="pr-cover-main-art" data-studio-native-object="object:cover:main-art">
          <PaperIllustration
            file={isWedding ? "couplesitting.webp" : "bookstack.webp"}
            width={isWedding ? 1122 : 1254}
            height={isWedding ? 1402 : 1254}
            priority
            className="pr-cover-couple"
            studioObject="object:cover:couple-art"
          />
        </span>
        <PaperIllustration file="streetlamp.webp" width={1086} height={1448} priority className="pr-cover-lamp" studioObject="object:cover:lamp-art" />
        <PaperIllustration file="camera1.webp" width={1254} height={1254} priority className="pr-cover-camera" studioObject="object:cover:camera-art" />
        <PaperIllustration file="loveticket.webp" width={1448} height={1086} priority className="pr-cover-ticket" studioObject="object:cover:ticket-art" />
        <PaperIllustration file="polaroidlove.webp" width={1254} height={1254} priority className="pr-cover-polaroid" studioObject="object:cover:polaroid-art" />
        <PaperIllustration file="ribbon.webp" width={1254} height={1254} priority className="pr-cover-ribbon" studioObject="object:cover:ribbon-art" />
        <HeartDoodle studioObject="object:cover:heart" className="pr-cover-heart" />
      </div>

      <p className="pr-cover-end" data-studio-native-object="object:cover:ending">{tr("Every little moment matters.")}</p>
    </section>
  );
}
