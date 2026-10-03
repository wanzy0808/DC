"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import { BirthdayCake, ConfettiPieces, ConfettiRibbon } from "./ConfettiClubArtwork";
import "./confetti-club.css";

type Props = {
  names: string;
  date: string;
  time?: string;
  eventLabel?: string;
  stage: "envelope" | "cover";
  onOpen: (immediate?: boolean) => void;
  preview?: boolean;
  allowEnvelopeOpen?: boolean;
  recipientLine?: string;
  motionEnabled?: boolean;
};

/** Only presentation lives here; event data, music and opening are shared. */
export default function ConfettiClubScene({
  names, date, time, eventLabel, stage, onOpen,
  preview = false, allowEnvelopeOpen = false, recipientLine, motionEnabled = true,
}: Props) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);

  if (stage === "envelope") return <section className="cc-envelope" data-confetti-stage="envelope" data-opening={opening ? "true" : undefined}>
    <ConfettiPieces section="envelope" />
    <p data-studio-native-object="object:envelope:invitation-title" className="cc-envelope-title">{tr("Ada pesta untukmu")}</p>
    <div data-studio-native-object="object:envelope:gift-group" className="cc-gift">
      <div data-studio-native-object="object:envelope:paper-back-art" className="cc-gift-back" aria-hidden="true" />
      <div className="cc-letter-motion">
        <div data-studio-native-object="object:envelope:letter-paper" className="cc-letter">
          <h1 data-studio-native-heading="">{names}</h1>
          <p data-studio-native-object="object:envelope:date">{date}</p>
        </div>
      </div>
      <div data-studio-native-object="object:envelope:fold-left-art" className="cc-gift-fold cc-gift-left" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-right-art" className="cc-gift-fold cc-gift-right" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-bottom-art" className="cc-gift-fold cc-gift-bottom" aria-hidden="true" />
      <div className="cc-flap-motion">
        <div data-studio-native-object="object:envelope:fold-top-art" className="cc-gift-fold cc-gift-top" aria-hidden="true" />
      </div>
      <div className="cc-bow-motion">
        <div data-studio-native-object="object:envelope:bow-art" className="cc-bow" aria-hidden="true">
          <svg viewBox="0 0 220 160" fill="none" focusable="false">
            <path d="M110 65C22 57 28 4 69 19c18 7 30 26 41 46Zm0 0c88-8 82-61 41-46-18 7-30 26-41 46Z" stroke="currentColor" strokeWidth="16" strokeLinejoin="round" />
            <path d="m105 65-24 80 25-12 13 13 2-81m-5 0 37 65 2-24 23 6-55-54" fill="currentColor" />
            <ellipse cx="111" cy="65" rx="14" ry="11" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
    {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="cc-recipient">{recipientLine}</p>}
    <button
      type="button"
      data-studio-native-object="object:envelope:open-button"
      data-studio-system-action={preview ? "open-invitation" : undefined}
      className="cc-open-button"
      disabled={opening}
      aria-label={preview && !allowEnvelopeOpen ? tr("Buka Undangan") + " — " + tr("Mode desain") : undefined}
      onClick={(event) => {
        if (preview && !allowEnvelopeOpen) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        const immediate = event.detail === 0 || Boolean(reduced) || !motionEnabled;
        if (!immediate) setOpening(true);
        onOpen(immediate);
      }}
    >{tr("Buka Undangan")}<ArrowRight size={18} aria-hidden="true" /></button>
  </section>;

  return <section className="cc-cover" data-confetti-stage="cover">
    <ConfettiPieces section="cover" />
    <p data-studio-native-object="object:cover:kicker" className="cc-cover-category">{eventLabel || tr("Ulang Tahun")}</p>
    <div data-studio-native-object="object:cover:heading-group" className="cc-cover-heading">
      <p data-studio-native-object="object:cover:celebration-label" className="cc-celebrate">{tr("Rayakan")}</p>
      <h1 data-studio-native-heading="" className="cc-cover-name">{names}</h1>
    </div>
    <div data-studio-native-object="object:cover:date-group" className="cc-cover-meta">
      <p data-studio-native-object="object:cover:date">{date}</p>
      {time && <p data-studio-native-object="object:cover:start">{time}</p>}
    </div>
    <div className="cc-cover-art">
      <ConfettiRibbon objectKey="object:cover:ribbon-art" className="cc-cover-ribbon" />
      <BirthdayCake />
    </div>
    <p data-studio-native-object="object:cover:scroll-hint" className="cc-scroll-hint">{tr("Gulir untuk merayakan")}<ArrowDown size={17} aria-hidden="true" /></p>
  </section>;
}
