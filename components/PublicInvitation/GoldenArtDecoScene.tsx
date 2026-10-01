"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GoldenArtDecoArt } from "@/components/PublicInvitation/GoldenArtDecoArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./golden-art-deco.css";

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

export default function GoldenArtDecoScene({
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

  if (stage === "envelope") return <section className="gd-envelope" data-golden-art-deco-stage="envelope">
    <span aria-hidden="true" data-studio-native-object="object:envelope:rail-left" className="gd-envelope-rail gd-envelope-rail-left" />
    <span aria-hidden="true" data-studio-native-object="object:envelope:rail-right" className="gd-envelope-rail gd-envelope-rail-right" />
    <GoldenArtDecoArt objectKey="object:envelope:garland-art" asset="garland" className="gd-envelope-garland" eager />
    <GoldenArtDecoArt objectKey="object:envelope:candelabra-art" asset="candelabra" className="gd-envelope-candelabra" eager />
    <p data-studio-native-object="object:envelope:kicker" className="gd-envelope-kicker">{tr("Undangan malam untuk Anda")}</p>
    <h1 data-studio-native-heading="" className="gd-envelope-names">{names}</h1>
    <p data-studio-native-object="object:envelope:date" className="gd-envelope-date">{date}</p>

    <div data-studio-native-object="object:envelope:ticket-stage" className="gd-ticket-stage">
      <motion.div
        className="gd-ticket-motion"
        animate={{
          transform: opening && !still ? "translateY(-58px) rotate(-1deg)" : "translateY(0px) rotate(0deg)",
          opacity: opening ? 0 : 1,
        }}
        transition={{ duration: still ? 0 : .7, delay: still ? 0 : .12, ease }}
      >
        <div data-studio-native-object="object:envelope:ticket" className="gd-ticket">
          <GoldenArtDecoArt objectKey="object:envelope:fan-art" asset="fan" className="gd-ticket-fan" eager />
          <p data-studio-native-object="object:envelope:letter-kicker" className="gd-ticket-kicker">{tr("Admit one unforgettable evening")}</p>
          {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="gd-recipient">{recipientLine}</p>}
          <p data-studio-native-object="object:envelope:letter-names" className="gd-ticket-names">{names}</p>
          <span aria-hidden="true" data-studio-native-object="object:envelope:ticket-number" className="gd-ticket-number">UNDARA · 01</span>
        </div>
      </motion.div>
      <motion.span
        aria-hidden="true"
        data-studio-native-object="object:envelope:seal"
        className="gd-envelope-seal"
        animate={{ transform: opening && !still ? "scale(.88)" : "scale(1)", opacity: opening ? 0 : 1 }}
        transition={{ duration: still ? 0 : .25, ease }}
      >◆</motion.span>
    </div>

    <button
      type="button"
      className="gd-action gd-open"
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
      {tr("Buka Undangan")}<ArrowRight size={18} strokeWidth={1.3} aria-hidden="true" />
    </button>
  </section>;

  return <section className="gd-cover" data-golden-art-deco-stage="cover">
    <span aria-hidden="true" data-studio-native-object="object:cover:rail" className="gd-cover-rail" />
    <span aria-hidden="true" data-studio-native-object="object:cover:steps" className="gd-cover-steps"><i /><i /><i /><i /></span>
    <GoldenArtDecoArt objectKey="object:cover:fan-art" asset="fan" className="gd-cover-fan" eager />
    <GoldenArtDecoArt objectKey="object:cover:garland-art" asset="garland" className="gd-cover-garland" eager />
    <GoldenArtDecoArt objectKey="object:cover:arch-art" asset="arch" className="gd-cover-arch" eager />
    <GoldenArtDecoArt objectKey="object:cover:champagne-art" asset="champagne" className="gd-cover-champagne" eager />

    <p data-studio-native-object="object:cover:kicker" className="gd-cover-kicker">{tr("A gilded soirée")}</p>

    <div data-studio-native-object="object:cover:copy-panel" className="gd-cover-copy">
      <h1 data-studio-native-heading="" className={`gd-cover-names ${paired ? "" : "gd-cover-single"}`}>
        {paired ? <>
          <span data-studio-native-object="object:cover:personOne-name" className="gd-cover-name-first">{first}</span>
          <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
          <span data-studio-native-object="object:cover:personTwo-name" className="gd-cover-name-second">{second}</span>
        </> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
      </h1>
      <p data-studio-native-object="object:cover:closing-copy" className="gd-cover-caption">{tr("Kilau boleh berlalu; cerita ini tidak.")}</p>
    </div>

    <p data-studio-native-object="object:cover:date" className="gd-cover-date">{date}</p>
  </section>;
}
