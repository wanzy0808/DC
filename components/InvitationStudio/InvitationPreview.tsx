"use client";

import dynamic from "next/dynamic";
import type { InvitationSections } from "@/lib/templates/sections";
import type { PhotoAssignments, PhotoSlot } from "@/lib/templates/photo-slots";
import type { FontKey, PaletteKey } from "@/lib/templates/design";
import { invitationFonts, invitationPalettes } from "@/lib/templates/design";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

const RomanticRoseTemplate = dynamic(() => import("@/components/PublicInvitation/RomanticRoseTemplate"));
const UniversalInvitationTemplate = dynamic(() => import("@/components/PublicInvitation/UniversalInvitationTemplate"));

/** Studio and public pages render identical template components; never mock RSVP as a functioning form. */
export function InvitationPreview({
  invitation,
  templateKey,
  palette,
  fontPair,
  decorUrl,
  sections,
  photoAssignments,
  onEditPhoto,
  designKey,
  musicUrl,
}: {
  invitation: InvitationDesignerInvitation | null;
  templateKey: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  dressCode: string;
  sections: InvitationSections;
  photoAssignments?: PhotoAssignments;
  onEditPhoto?: (slot: PhotoSlot) => void;
  designKey?: string;
  musicUrl?: string;
}) {
  if (!invitation) {
    return <div className="grid min-h-[560px] place-items-center rounded-2xl border border-border bg-background text-sm text-muted-foreground">Memuat pratinjau undangan…</div>;
  }
  const previewInvitation = musicUrl === undefined ? invitation : { ...invitation, musicUrl };
  if (templateKey === "romantic-rose") {
    return <RomanticRoseTemplate invitation={previewInvitation} preview sections={sections} coverUrl={decorUrl} photoAssignments={photoAssignments} onEditPhoto={onEditPhoto} />;
  }
  return (
    <UniversalInvitationTemplate
      invitation={previewInvitation}
      templateKey={templateKey}
      designKey={designKey}
      preview
      sections={sections}
      coverUrl={decorUrl}
      photoAssignments={photoAssignments}
      onEditPhoto={onEditPhoto}
    />
  );
}
