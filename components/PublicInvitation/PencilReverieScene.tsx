"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import { Play } from "lucide-react";
import "./pencil-reverie.css";

const assetRoot = "/templates/pencil-reverie/";

type SceneProps = {
  stage: "envelope" | "cover";
  names: string;
  date: string;
  onOpen: () => void;
  isWedding?: boolean;
  hashtag?: string | null;
  preview?: boolean;
  recipientLine?: string;
};

/**
 * The artwork is a complete drawing, not a cropped CSS background.
 * In particular bungaandlampbg.webp contains the ENTIRE lantern and its bracket.
 * The 1122x1402 paper illustrations have their own aspect ratio and remain in flow.
 */
function PaperIllustration({ file, priority = false, className = "", studioObject }: { file: string; priority?: boolean; className?: string; studioObject?: string }) {
  return <Image src={assetRoot + file} alt="" aria-hidden="true" width={1122} height={1402}
    sizes="(max-width: 640px) 100vw, 560px" priority={priority} className={className} data-studio-native-object={studioObject}/>;
}

function HeartDoodle({ studioObject }: { studioObject?: string }) {
  return <svg className="pr-heart-doodle" aria-hidden="true" viewBox="0 0 64 62" fill="none" data-studio-native-object={studioObject}>
    <path d="M31 56C16 41 3 30 6 18 10 1 25 7 32 21 41 2 56 8 59 20c3 14-17 30-28 36Z"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

export default function PencilReverieScene({
  stage, names, date, onOpen, isWedding = true, hashtag, preview = false, recipientLine,
}: SceneProps) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const couple = isWedding ? names.split(/\s*&\s*/).filter(Boolean) : [];
  const longName = names.length > 29 || couple.some((name) => name.length > 17);
  const handleOpen = () => {
    if (preview || opening) return;
    setOpening(true);
    // The shared parent starts user-selected music synchronously with this click.
    onOpen();
  };


  return <section ref={rootRef} data-invitation-section={stage} data-pr-opening={opening || undefined}
    data-pr-active={visible} data-pr-long={longName} className={"pr-scene pr-" + stage}>
    {stage === "envelope" ? <>
      <div className="pr-gate-intro" data-studio-native-object="object:envelope:intro">
        <span className="pr-overline" data-studio-native-object="object:envelope:kicker">{tr("A LITTLE STORY OF US")}</span>
        <p data-studio-native-object="object:envelope:intro-copy">{tr("Setiap cerita punya awalnya.")}</p>
      </div>
      <div className="pr-letter-illustration" data-studio-native-object="object:envelope:illustration-group">
        <PaperIllustration file="bingkai.webp" priority className="pr-letter-paper" studioObject="object:envelope:letter-art"/>
        <div className="pr-letter-copy" data-studio-native-object="object:envelope:copy-panel">
          <p data-studio-native-object="object:envelope:letter-kicker">{tr("Untuk momen istimewa")}</p>
          {recipientLine && <p data-personal-envelope-address data-studio-native-object="object:envelope:address" className="mt-2 break-words text-[10px] font-semibold leading-4">{recipientLine}</p>}
          <h1 data-studio-native-heading="">{names}</h1>
          <span data-studio-native-object="object:envelope:date">{date}</span>
        </div>
        <HeartDoodle studioObject="object:envelope:heart"/>
      </div>
      <button className="pr-open-button" type="button" onClick={handleOpen} disabled={opening} data-studio-system-action={preview ? "open-invitation" : undefined} data-studio-native-object="object:envelope:open-button">
        <Play size={15} aria-hidden="true" fill="currentColor"/> {tr("Buka Undangan")}
      </button>
    </> : <>
      <header className="pr-cover-heading" data-studio-native-object="object:cover:heading-group">
        <span className="pr-overline" data-studio-native-object="object:cover:kicker">{tr(isWedding ? "THE WEDDING OF" : "Sebuah Undangan")}</span>
      </header>
      <div className="pr-cover-illustration" data-studio-native-object="object:cover:illustration-group">
        <PaperIllustration file="bungaandlampbg.webp" priority className="pr-cover-paper" studioObject="object:cover:main-art"/>
        <div className="pr-cover-copy" data-studio-native-object="object:cover:copy-panel">
          <h1 className="pr-cover-names" data-studio-native-heading="">{couple.length === 2
            ? <><span>{couple[0]}</span><em>&amp;</em><span>{couple[1]}</span></>
            : <span>{names}</span>}</h1>
          <p className="pr-cover-date" data-studio-native-object="object:cover:date">{date}</p>
          {hashtag?.trim() && <p className="pr-cover-hashtag" data-studio-native-object="object:cover:hashtag">{hashtag}</p>}
        </div>
        <HeartDoodle studioObject="object:cover:heart"/>
      </div>
      <p className="pr-cover-end" data-studio-native-object="object:cover:ending">{tr("Every little moment matters.")}</p>
    </>}
  </section>;
}
