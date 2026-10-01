"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ClassicPearlArt } from "@/components/PublicInvitation/ClassicPearlArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./classic-pearl.css";

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

export default function ClassicPearlScene({
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
  const ease = [.22, 1, .36, 1] as const;
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");

  if (stage === "envelope") return <section className="cp-envelope" data-classic-pearl-stage="envelope">
    <ClassicPearlArt objectKey="object:envelope:garland-art" asset="garland" className="cp-envelope-garland" eager />
    <ClassicPearlArt objectKey="object:envelope:candelabra-art" asset="candelabra" className="cp-envelope-candelabra" eager />
    <p data-studio-native-object="object:envelope:kicker" className="cp-envelope-kicker">{tr("Sebuah Undangan Untuk Anda")}</p>
    <h1 data-studio-native-heading="" className="cp-envelope-names">{names}</h1>
    <p data-studio-native-object="object:envelope:date" className="cp-envelope-date">{date}</p>

    <div data-studio-native-object="object:envelope:stationery-group" className="cp-envelope-stage">
      <motion.div
        className="cp-envelope-letter-motion"
        animate={{
          transform: opening && !still ? "translateY(-56px) rotate(-1.3deg)" : "translateY(0px) rotate(0deg)",
          opacity: opening ? 0 : 1,
        }}
        transition={{ duration: still ? 0 : .68, delay: still ? 0 : .12, ease }}
      >
        <div data-studio-native-object="object:envelope:letter-paper" className="cp-envelope-letter">
          <span aria-hidden="true" className="cp-letter-pearl" />
          <p data-studio-native-object="object:envelope:letter-kicker" className="cp-letter-kicker">{tr("Untuk momen istimewa")}</p>
          {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="cp-recipient">{recipientLine}</p>}
          <p data-studio-native-object="object:envelope:letter-names" className="cp-letter-names">{names}</p>
        </div>
      </motion.div>
      <motion.span
        aria-hidden="true"
        data-studio-native-object="object:envelope:seal"
        className="cp-envelope-seal"
        animate={{ transform: opening && !still ? "scale(.92)" : "scale(1)", opacity: opening ? 0 : 1 }}
        transition={{ duration: still ? 0 : .26, ease }}
      >P</motion.span>
    </div>

    <button
      type="button"
      className="cp-action cp-open"
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
      {tr("Buka Undangan")}<ArrowRight size={18} strokeWidth={1.25} aria-hidden="true" />
    </button>
  </section>;

  return <section className="cp-cover" data-classic-pearl-stage="cover">
    <span aria-hidden="true" data-studio-native-object="object:cover:ledger-line" className="cp-cover-ledger" />
    <ClassicPearlArt objectKey="object:cover:chandelier-art" asset="chandelier" className="cp-cover-chandelier" eager />
    <ClassicPearlArt objectKey="object:cover:arch-art" asset="arch" className="cp-cover-arch" eager />
    <ClassicPearlArt objectKey="object:cover:garland-art" asset="garland" className="cp-cover-garland" eager />
    <ClassicPearlArt objectKey="object:cover:tiara-art" asset="tiara" className="cp-cover-tiara" eager />

    <div data-studio-native-object="object:cover:copy-panel" className="cp-cover-copy">
      <h1 data-studio-native-heading="" className={`cp-cover-names ${paired ? "" : "cp-cover-single"}`}>
        {paired ? <>
          <span data-studio-native-object="object:cover:personOne-name" className="cp-cover-name-first">{first}</span>
          <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
          <span data-studio-native-object="object:cover:personTwo-name" className="cp-cover-name-second">{second}</span>
        </> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
      </h1>
      <p data-studio-native-object="object:cover:date" className="cp-cover-date">{date}</p>
      <p data-studio-native-object="object:cover:closing-copy" className="cp-cover-caption">{tr("Kisah yang lembut, janji yang tinggal lebih lama dari waktu.")}</p>
    </div>

    <span aria-hidden="true" data-studio-native-object="object:cover:pearl-trail" className="cp-cover-pearl-trail">
      <i /><i /><i /><i /><i />
    </span>
  </section>;
}
