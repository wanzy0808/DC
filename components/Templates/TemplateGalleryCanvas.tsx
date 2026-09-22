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
  return (
    <InvitationPreview
      invitation={{ ...templateDemoInvitation, templateKey }}
      templateKey={templateKey}
      palette={invitationPalettes[preset.palette]}
      fontPair={invitationFonts[preset.font]}
      decorUrl={templateDemoPhoto}
      eventTag=""
      dressCode=""
      sections={sections}
    />
  );
}

/** Lazily render the actual Studio canvas for each visible card (not a stock-image mockup). */
export function TemplateCardCanvas({ templateKey }: { templateKey: string }) {
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
    <div ref={root} className="relative h-[340px] w-full overflow-hidden bg-[#fcf7f6]" aria-hidden="true">
      {visible ? (
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-[390px]"
          style={{ transform: "translateX(-50%) scale(0.77)", transformOrigin: "top center" }}
        >
          <TemplateCanvas templateKey={templateKey} />
        </div>
      ) : (
        <div className="grid h-full place-items-center text-xs text-[#916f7a]">Pratinjau template</div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fcf7f6] to-transparent" />
    </div>
  );
}

