"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Leaf } from "lucide-react";
import { BotanicalArt } from "@/components/PublicInvitation/BotanicalIvoryArtwork";
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
    <h1 data-studio-native-heading="" className="bi-envelope-names">{paired ? <>{first}<span>&amp; {second}</span></> : names}</h1>
    <p data-studio-native-object="object:envelope:date" className="bi-envelope-date">{date}</p>
    <div data-studio-native-object="object:envelope:stationery-group" className="bi-stationery">
      <BotanicalArt objectKey="object:envelope:sprig-art" className="bi-envelope-sprig" eager />
      <div data-studio-native-object="object:envelope:paper-back" className="bi-envelope-back" aria-hidden="true" />
      <motion.div className="bi-letter-motion" animate={{ transform: opening && !still ? "translateY(-64px) rotate(-2deg)" : "translateY(0px) rotate(0deg)", opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .7, delay: still ? 0 : .16, ease }}>
        <div data-studio-native-object="object:envelope:letter-paper" className="bi-letter">
          <Leaf aria-hidden="true" strokeWidth={.8} />
          <p data-studio-native-object="object:envelope:letter-names">{names}</p>
        </div>
      </motion.div>
      <div data-studio-native-object="object:envelope:fold-left" className="bi-fold bi-fold-left" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-right" className="bi-fold bi-fold-right" aria-hidden="true" />
      <div data-studio-native-object="object:envelope:fold-bottom" className="bi-fold bi-fold-bottom" aria-hidden="true" />
      <motion.div className="bi-band-motion" animate={{ transform: opening && !still ? "translateX(-65px) rotate(-5deg)" : "translateX(0px) rotate(0deg)", opacity: opening ? 0 : 1 }} transition={{ duration: still ? 0 : .4, ease }}>
        <div data-studio-native-object="object:envelope:belly-band" className="bi-belly-band" aria-hidden="true"><span data-studio-native-object="object:envelope:seal" className="bi-seal"><Leaf strokeWidth={.7} /></span></div>
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
    <h1 data-studio-native-heading="" className={`bi-cover-names ${paired ? "" : "bi-cover-single"}`}>
      {paired ? <><span data-studio-native-object="object:cover:personOne-name" className="bi-name-first">{first}</span><span className="bi-name-second-line"><em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em><span data-studio-native-object="object:cover:personTwo-name" className="bi-name-second">{second}</span></span></> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
    </h1>
    <p data-studio-native-object="object:cover:date" className="bi-cover-date">{date}</p>
    <BotanicalArt objectKey="object:cover:sprig-left" className="bi-cover-botanical" eager />
    <p data-studio-native-object="object:cover:closing-copy" className="bi-cover-caption">{tr("Sebuah hari untuk bertumbuh bersama.")}</p>
  </section>;
}
