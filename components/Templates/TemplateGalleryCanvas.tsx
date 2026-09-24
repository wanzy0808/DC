"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { invitationTemplatePresets } from "@/components/InvitationStudio/designer-config";
import { invitationFonts, invitationPalettes } from "@/lib/templates/design";
import { defaultInvitationSections, invitationSectionItems, type InvitationSections } from "@/lib/templates/sections";
import { templateDemoInvitation, templateDemoPhoto } from "@/data/templates/preview-invitation";

const InvitationPreview = dynamic(
  () => import("@/components/InvitationStudio/InvitationPreview").then((module) => module.InvitationPreview),
  { loading: () => <div className="min-h-[550px] bg-[#fcf7f6]" /> },
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
  // A single isolated fixture powers every catalog and full template preview.
  // Do not replace or save actual customer invitation names in Studio.
  const demo = templateDemoInvitation;
  return (
    <InvitationPreview
      invitation={{ ...demo, templateKey }}
      templateKey={templateKey}
      palette={invitationPalettes[preset.palette]}
      fontPair={invitationFonts[preset.font]}
      decorUrl={templateDemoPhoto}
      eventTag={demo.weddingHashtag || ""}
      dressCode=""
      sections={sections}
    />
  );
}

/** A catalog card shows the real Cover/Hero, while opening its full preview still starts at the digital envelope. */
const catalogCoverSections: InvitationSections = Object.fromEntries(
  invitationSectionItems.map(({ key }) => [key, key === "cover"]),
) as InvitationSections;

/** Lazily render the actual Studio canvas for each visible card (not a stock-image mockup). */
export function TemplateCardCanvas({ templateKey, phone = false, studio = false }: { templateKey: string; phone?: boolean; studio?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [studioWidth, setStudioWidth] = useState(240);

  useEffect(() => {
    if (!studio || !root.current) return;
    const element = root.current;
    const resize = () => setStudioWidth(element.getBoundingClientRect().width);
    resize();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [studio]);

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
      className={studio ? "relative aspect-[9/19.5] w-full overflow-hidden bg-background" : phone ? "relative h-full w-full overflow-hidden bg-background" : "relative h-[340px] w-full overflow-hidden bg-background"}
      aria-hidden="true"
      inert
    >
      {visible ? (
        <div
          className={studio || phone ? "pointer-events-none absolute left-1/2 top-0 w-[390px]" : "pointer-events-none absolute left-1/2 top-[-90px] w-[390px]"}
          style={{ transform: studio ? `translateX(-50%) scale(${studioWidth / 390})` : phone ? "translateX(-50%) scale(0.55)" : "translateX(-50%) scale(0.77)", transformOrigin: "top center" }}
        >
          <TemplateCanvas templateKey={templateKey} sections={catalogCoverSections} />
        </div>
      ) : (
        <div className="h-full w-full bg-background" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/15 to-transparent" />
    </div>
  );
}

