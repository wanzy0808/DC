"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { CelestialInkArt } from "@/components/PublicInvitation/CelestialInkArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import "./celestial-ink.css";

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

export default function CelestialInkScene({
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
  const tr = (text: string) => invitationText(language, text);
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const still = reduced || !motionEnabled;
  const ease = [.22, 1, .36, 1] as const;
  const paired = couple && names.includes(" & ");
  const [first, ...rest] = names.split(" & ");
  const second = rest.join(" & ");
  const sceneKicker = language === "EN" ? "A moonlit invitation" : "Undangan di bawah cahaya bulan";
  const coverNote = language === "EN"
    ? "An evening written in indigo, light, and quiet promises."
    : "Sebuah malam yang ditulis dalam indigo, cahaya, dan janji yang tenang.";

  if (stage === "envelope") return (
    <section className="ci-envelope" data-celestial-stage="envelope">
      <div aria-hidden="true" data-studio-native-object="object:envelope:sky-field" className="ci-sky-field" />
      <CelestialInkArt objectKey="object:envelope:drapery-art" asset="drapery" className="ci-envelope-drapery" eager />
      <CelestialInkArt objectKey="object:envelope:pillars-art" asset="pillars" className="ci-envelope-pillars" eager />
      <CelestialInkArt objectKey="object:envelope:calligraphy-art" asset="calligraphy" className="ci-envelope-calligraphy" eager />
      <p data-studio-native-object="object:envelope:kicker" className="ci-envelope-kicker">{sceneKicker}</p>

      <div data-studio-native-object="object:envelope:letter-stage" className="ci-envelope-stage">
        <motion.div
          data-studio-native-object="object:envelope:letter-paper"
          className="ci-envelope-letter"
          animate={{
            y: opening && !still ? -56 : 0,
            rotate: opening && !still ? -1.5 : 0,
            opacity: opening ? 0 : 1,
          }}
          transition={{ duration: still ? 0 : .72, delay: still ? 0 : .08, ease }}
        >
          <span aria-hidden="true" className="ci-letter-orbit" />
          <p data-studio-native-object="object:envelope:letter-kicker" className="ci-letter-kicker">{tr("Untuk momen istimewa")}</p>
          {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="ci-recipient">{recipientLine}</p>}
          <h1 data-studio-native-heading="" data-studio-native-object="object:envelope:letter-names" className="ci-envelope-names">{names}</h1>
          <p data-studio-native-object="object:envelope:date" className="ci-envelope-date">{date}</p>
          <motion.span
            aria-hidden="true"
            data-studio-native-object="object:envelope:seal"
            className="ci-envelope-seal"
            animate={{ scale: opening && !still ? .82 : 1, opacity: opening ? 0 : 1 }}
            transition={{ duration: still ? 0 : .24, ease }}
          >☾</motion.span>
        </motion.div>
      </div>

      <button
        type="button"
        className="ci-action ci-open"
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
    </section>
  );

  return (
    <section className="ci-cover" data-celestial-stage="cover">
      <div aria-hidden="true" data-studio-native-object="object:cover:sky-field" className="ci-sky-field ci-cover-sky" />
      <CelestialInkArt objectKey="object:cover:drapery-art" asset="drapery" className="ci-cover-drapery" eager />
      <CelestialInkArt objectKey="object:cover:screen-art" asset="screen" className="ci-cover-screen" eager />
      <CelestialInkArt objectKey="object:cover:moon-gate-art" asset="moonGate" className="ci-cover-moon-gate" eager />
      <CelestialInkArt objectKey="object:cover:lantern-art" asset="lantern" className="ci-cover-lantern" eager />
      <span aria-hidden="true" data-studio-native-object="object:cover:orbit-line" className="ci-cover-orbit" />

      <div data-studio-native-object="object:cover:copy-panel" className="ci-cover-copy">
        <p data-studio-native-object="object:cover:kicker" className="ci-cover-kicker">{sceneKicker}</p>
        <h1 data-studio-native-heading="" className={`ci-cover-names ${paired ? "" : "ci-cover-single"}`}>
          {paired ? <>
            <span data-studio-native-object="object:cover:personOne-name">{first}</span>
            <em data-studio-native-object="object:cover:ampersand-symbol">&amp;</em>
            <span data-studio-native-object="object:cover:personTwo-name">{second}</span>
          </> : <span data-studio-native-object="object:cover:event-name">{names}</span>}
        </h1>
        <div className="ci-cover-meta">
          <p data-studio-native-object="object:cover:date" className="ci-cover-date">{date}</p>
          <p data-studio-native-object="object:cover:closing-copy" className="ci-cover-note">{coverNote}</p>
        </div>
      </div>

      <p aria-hidden="true" data-studio-native-object="object:cover:side-label" className="ci-cover-side">CELESTIAL / INK / NIGHT</p>
    </section>
  );
}
