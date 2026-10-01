"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PaperCutBotanicalArt } from "@/components/PublicInvitation/PaperCutBotanicalArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./paper-cut-botanical.css";

type Props = {
  names: string;
  date: string;
  couple?: boolean;
  stage: "envelope" | "cover";
  onOpen: (immediate?: boolean) => void;
  preview?: boolean;
  allowEnvelopeOpen?: boolean;
  recipientLine?: string;
  motionEnabled?: boolean;
};

export default function PaperCutBotanicalScene({
  names,
  date,
  couple,
  stage,
  onOpen,
  preview = false,
  allowEnvelopeOpen = false,
  recipientLine,
  motionEnabled = true,
}: Props) {
  const language = useInvitationLanguage();
  const tr = (value: string) => invitationText(language, value);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const still = reduced || !motionEnabled;
  const ease = [0.22, 1, 0.36, 1] as const;
  const paired = Boolean(couple && names.includes(" & "));
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");

  if (stage === "envelope") {
    return (
      <section className="pcb-envelope" data-paper-cut-botanical-stage="envelope">
        <span aria-hidden="true" data-studio-native-object="object:envelope:paper-back" className="pcb-envelope-paper pcb-envelope-paper-back" />
        <span aria-hidden="true" data-studio-native-object="object:envelope:paper-middle" className="pcb-envelope-paper pcb-envelope-paper-middle" />
        <PaperCutBotanicalArt objectKey="object:envelope:ribbon-art" asset="ribbon" className="pcb-envelope-ribbon" eager />
        <PaperCutBotanicalArt objectKey="object:envelope:lantern-art" asset="lantern" className="pcb-envelope-lantern" eager />

        <p data-studio-native-object="object:envelope:kicker" className="pcb-envelope-kicker">{tr("A story in paper")}</p>
        <h1 data-studio-native-heading="" className="pcb-envelope-names">{names}</h1>
        <p data-studio-native-object="object:envelope:date" className="pcb-envelope-date">{date}</p>

        <div data-studio-native-object="object:envelope:card-stage" className="pcb-envelope-stage">
          <motion.div
            className="pcb-envelope-letter-motion"
            animate={{
              transform: opening && !still ? "translateY(-44px) rotate(-1.5deg)" : "translateY(0px) rotate(-1deg)",
              opacity: opening ? 0 : 1,
            }}
            transition={{ duration: still ? 0 : 0.58, ease }}
          >
            <div data-studio-native-object="object:envelope:letter" className="pcb-envelope-letter">
              <PaperCutBotanicalArt objectKey="object:envelope:ticket-art" asset="ticket" className="pcb-envelope-ticket" eager />
              <p data-studio-native-object="object:envelope:letter-kicker" className="pcb-letter-kicker">{tr("Untuk momen istimewa")}</p>
              {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="pcb-recipient">{recipientLine}</p>}
              <p data-studio-native-object="object:envelope:letter-names" className="pcb-letter-names">{names}</p>
            </div>
          </motion.div>

          <motion.span
            aria-hidden="true"
            data-studio-native-object="object:envelope:flap"
            className="pcb-envelope-flap"
            animate={{ transform: opening && !still ? "perspective(700px) rotateX(-72deg)" : "perspective(700px) rotateX(0deg)" }}
            transition={{ duration: still ? 0 : 0.52, ease }}
          />
          <PaperCutBotanicalArt objectKey="object:envelope:seal-art" asset="waxSeal" className="pcb-envelope-seal" eager />
        </div>

        <button
          type="button"
          className="pcb-action pcb-open"
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
          {tr("Buka Undangan")}<ArrowRight size={17} strokeWidth={1.4} aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <section className="pcb-cover" data-paper-cut-botanical-stage="cover">
      <span aria-hidden="true" data-studio-native-object="object:cover:paper-back" className="pcb-cover-paper pcb-cover-paper-back" />
      <span aria-hidden="true" data-studio-native-object="object:cover:paper-middle" className="pcb-cover-paper pcb-cover-paper-middle" />
      <span aria-hidden="true" data-studio-native-object="object:cover:paper-window" className="pcb-cover-window" />

      <PaperCutBotanicalArt objectKey="object:cover:ribbon-art" asset="ribbon" className="pcb-cover-ribbon" eager />
      <PaperCutBotanicalArt objectKey="object:cover:couple-art" asset={couple ? "couple" : "bookstack"} className="pcb-cover-couple" eager />
      <PaperCutBotanicalArt objectKey="object:cover:ticket-art" asset="ticket" className="pcb-cover-ticket" eager />
      <PaperCutBotanicalArt objectKey="object:cover:seal-art" asset="waxSeal" className="pcb-cover-seal" eager />

      <p data-studio-native-object="object:cover:kicker" className="pcb-cover-kicker">{tr("A story in paper")}</p>
      <div data-studio-native-object="object:cover:copy-panel" className="pcb-cover-copy">
        <h1 data-studio-native-heading="" className={"pcb-cover-names " + (paired ? "" : "pcb-cover-single")}>
          {paired ? (
            <>
              <span data-studio-native-object="object:cover:personOne-name" className="pcb-cover-name-first">{first}</span>
              <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
              <span data-studio-native-object="object:cover:personTwo-name" className="pcb-cover-name-second">{second}</span>
            </>
          ) : <span data-studio-native-object="object:cover:event-name">{names}</span>}
        </h1>
        <p data-studio-native-object="object:cover:closing-copy" className="pcb-cover-caption">{tr("Selembar kecil untuk satu hari yang besar.")}</p>
      </div>
      <p data-studio-native-object="object:cover:date" className="pcb-cover-date">{date}</p>
    </section>
  );
}
