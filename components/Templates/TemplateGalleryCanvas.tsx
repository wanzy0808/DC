"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { invitationTemplatePresets } from "@/components/InvitationStudio/designer-config";
import { invitationFonts, invitationPalettes } from "@/lib/templates/design";
import { defaultInvitationSections, type InvitationSections } from "@/lib/templates/sections";
import { templateDemoInvitation, templateDemoPhoto } from "@/data/templates/preview-invitation";

const InvitationPreview = dynamic(
  () => import("@/components/InvitationStudio/InvitationPreview").then((module) => module.InvitationPreview),
  { loading: () => <div className="grid min-h-[550px] place-items-center bg-[#fcf7f6] text-xs text-[#916f7a]">Memuat pratinjau…</div> },
);

export function TemplateCanvas({
  templateKey,
  sections = defaultInvitationSections,
}: {
  templateKey: string;
  sections?: InvitationSections;
}) {
  const preset = invitationTemplatePresets[templateKey] ?? invitationTemplatePresets["botanical-ivory"];
  // Sample names and copy are gallery-only; Studio and published events always use owner data.
  const demo = templateKey === "zen-atelier" ? {
    ...templateDemoInvitation,
    title: "Pernikahan Aruna & Kaito",
    brideName: "Aruna",
    groomName: "Kaito",
    venue: "Masjid Al-Hikmah, Jakarta Selatan",
    eventDate: "2027-10-12T09:00:00+07:00",
    ceremonyTime: "09:00",
    receptionTime: "19:00",
    weddingHashtag: "#JourneyWithYou",
  } : templateDemoInvitation;
  return (
    <InvitationPreview
      invitation={{ ...demo, templateKey }}
      templateKey={templateKey}
      palette={invitationPalettes[preset.palette]}
      fontPair={invitationFonts[preset.font]}
      decorUrl={templateDemoPhoto}
      eventTag={templateKey === "zen-atelier" ? demo.weddingHashtag || "" : ""}
      dressCode=""
      sections={sections}
    />
  );
}

/** Lazily render the actual Studio canvas for each visible card (not a stock-image mockup). */
export function TemplateCardCanvas({ templateKey, phone = false }: { templateKey: string; phone?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={root}
      className={phone ? "relative h-full w-full overflow-hidden bg-background" : "relative h-[340px] w-full overflow-hidden bg-background"}
      aria-hidden="true"
      inert
    >
      {visible ? (
        <div
          className={phone ? "pointer-events-none absolute left-1/2 top-0 w-[390px]" : "pointer-events-none absolute left-1/2 top-[-112px] w-[390px]"}
          style={{ transform: phone ? "translateX(-50%) scale(0.55)" : "translateX(-50%) scale(0.77)", transformOrigin: "top center" }}
        >
          <TemplateCanvas templateKey={templateKey} />
        </div>
      ) : (
        <div className="grid h-full place-items-center text-xs text-[#916f7a]">Pratinjau template</div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/15 to-transparent" />
    </div>
  );
}

