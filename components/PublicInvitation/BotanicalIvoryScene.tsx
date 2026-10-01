"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BotanicalArt, BotanicalRomanceMark } from "@/components/PublicInvitation/BotanicalIvoryArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./botanical-ivory.css";

type Props = {
  names: string;
  date: string;
  couple?: boolean;
  stage: "envelope" | "cover";
  onOpen: () => void;
  preview?: boolean;
  recipientLine?: string;
  motionEnabled?: boolean;
};

export default function BotanicalIvoryScene({ names, date, couple, stage, onOpen, preview = false, recipientLine, motionEnabled = true }: Props) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");
  const still = reduced || !motionEnabled;
  const ease = [.22, 1, .36, 1] as const;

  if (stage === "envelope") return <section className="bi-envelope" data-botanical-stage="envelope">
    <p data-studio-native-object="object:envelope:kicker" className="bi-envelope-kicker">{tr("Sebuah Undangan Untuk Anda")}</p>
    <h1 data-studio-native-heading="" className="bi-envelope-names">{paired ? <>{first}<span>&amp; {second}</span></> : names}</h1>
    <p data-studio-native-object="object:envelope:date" className="bi-envelope-date">{date}</p>

    <div data-studio-native-object="object:envelope:stationery-group" className="bi-stationery">
      <BotanicalArt objectKey="object:envelope:sprig-art" className="bi-envelope-sprig" eager />
      <div data-studio-native-object="object:envelope:paper-back" className="bi-envelope-back" aria-hidden="true" />
      <motion.div className="bi-letter-motion" animate={{ transform: opening && !still ? "translateY(-58px) rotate(-1.5deg)" : "translateY(0px) rotate(0deg)", opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .68, delay: still ? 0 : .14, ease }}>
        <div data-studio-native-object="object:envelope:letter-paper" className="bi-letter">
          <BotanicalRomanceMark objectKey="object:envelope:ring-ornament" className="bi-letter-rings" />
          <p data-studio-native-object="object:envelope:letter-names">{names}</p>
          <span aria-hidden="true" className="bi-letter-rule" />
        </div>
      </motion.div>
      <div data-studio-native-object="object:envelope:fold-left" className="bi-fold bi-fold-left" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-right" className="bi-fold bi-fold-right" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-bottom" className="bi-fold bi-fold-bottom" aria-hidden="true" />
      <motion.div className="bi-band-motion" animate={{ transform: opening && !still ? "translateX(-62px) rotate(-4deg)" : "translateX(0px) rotate(0deg)", opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .38, ease }}>
        <div data-studio-native-object="object:envelope:belly-band" className="bi-belly-band" aria-hidden="true">
          <span data-studio-native-object="object:envelope:seal" className="bi-seal">&amp;</span>
        </div>
      </motion.div>
    </div>

    {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="bi-recipient">{recipientLine}</p>}
    <button type="button" data-studio-native-object="object:envelope:open-button" data-studio-system-action={preview ? "open-invitation" : undefined} className="bi-action bi-open" disabled={opening} onClick={(event) => {
      if (preview) event.stopPropagation();
      setOpening(true); onOpen();
    }}>{tr("Buka Undangan")}<ArrowRight size={19} strokeWidth={1.4} aria-hidden="true" /></button>
  </section>;

  return <section className="bi-cover" data-botanical-stage="cover">
    <p data-studio-native-object="object:cover:kicker" className="bi-cover-intro">{tr("Kami Mengundang Anda")}</p>
    <BotanicalRomanceMark objectKey="object:cover:ring-ornament" className="bi-cover-rings" />
    <h1 data-studio-native-heading="" className={`bi-cover-names ${paired ? "" : "bi-cover-single"}`}>
      {paired ? <>
        <span data-studio-native-object="object:cover:personOne-name" className="bi-name-first">{first}</span>
        <span className="bi-name-second-line"><em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em><span data-studio-native-object="object:cover:personTwo-name" className="bi-name-second">{second}</span></span>
      </> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
    </h1>
    <div className="bi-cover-meta">
      <p data-studio-native-object="object:cover:date" className="bi-cover-date">{date}</p>
      <p data-studio-native-object="object:cover:closing-copy" className="bi-cover-caption">{tr("Dua hati, satu cerita yang tumbuh pelan menuju selamanya.")}</p>
    </div>
    <BotanicalArt objectKey="object:cover:sprig-left" className="bi-cover-botanical" eager />
  </section>;
}
