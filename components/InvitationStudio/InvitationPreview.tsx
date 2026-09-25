"use client";

import dynamic from "next/dynamic";
import type { InvitationSectionKey, InvitationSections } from "@/lib/templates/sections";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
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
  onEnvelopeOpened,
  designKey,
  musicUrl,
  selectedAssetLayerId,
  onSelectAssetLayer,
  onMoveAssetLayer,
  onUpdateAssetLayer,
  eventTag,
  dressCode,
  selectedSectionInstanceId,
  onSelectSectionInstance,
  onMoveSectionInstance,
  onToggleSectionInstance,
  onDuplicateSectionInstance,
  onDeleteSectionInstance,
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
  /** Studio canvas only: the guest has finished opening the envelope. */
  onEnvelopeOpened?: () => void;
  designKey?: string;
  musicUrl?: string;
  selectedAssetLayerId?: string | null;
  onSelectAssetLayer?: (id: string) => void;
  onMoveAssetLayer?: (id: string, x: number, y: number) => void;
  onUpdateAssetLayer?: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  selectedSectionInstanceId?: string | null;
  onSelectSectionInstance?: (id: string, key: InvitationSectionKey) => void;
  onMoveSectionInstance?: (id: string, direction: -1 | 1) => void;
  onToggleSectionInstance?: (id: string) => void;
  onDuplicateSectionInstance?: (id: string) => void;
  onDeleteSectionInstance?: (id: string) => void;
}) {
  if (!invitation) {
    return <div className="grid min-h-[560px] place-items-center rounded-2xl border border-border bg-background text-sm text-muted-foreground">Memuat pratinjau undangan…</div>;
  }
  const previewInvitation = { ...invitation, weddingHashtag: eventTag, dressCode, ...(musicUrl === undefined ? {} : { musicUrl }) };
  if (templateKey === "romantic-rose") {
    return <RomanticRoseTemplate invitation={previewInvitation} designKey={designKey} preview sections={sections} coverUrl={decorUrl} photoAssignments={photoAssignments} onEditPhoto={onEditPhoto} onEnvelopeOpened={onEnvelopeOpened} selectedAssetLayerId={selectedAssetLayerId} onSelectAssetLayer={onSelectAssetLayer} onMoveAssetLayer={onMoveAssetLayer} onUpdateAssetLayer={onUpdateAssetLayer} selectedSectionInstanceId={selectedSectionInstanceId} onSelectSectionInstance={onSelectSectionInstance} onMoveSectionInstance={onMoveSectionInstance} onToggleSectionInstance={onToggleSectionInstance} onDuplicateSectionInstance={onDuplicateSectionInstance} onDeleteSectionInstance={onDeleteSectionInstance} />;
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
      onEnvelopeOpened={onEnvelopeOpened}
      selectedAssetLayerId={selectedAssetLayerId}
      onSelectAssetLayer={onSelectAssetLayer}
      onMoveAssetLayer={onMoveAssetLayer}
      onUpdateAssetLayer={onUpdateAssetLayer}
      selectedSectionInstanceId={selectedSectionInstanceId}
      onSelectSectionInstance={onSelectSectionInstance}
      onMoveSectionInstance={onMoveSectionInstance}
      onToggleSectionInstance={onToggleSectionInstance}
      onDuplicateSectionInstance={onDuplicateSectionInstance}
      onDeleteSectionInstance={onDeleteSectionInstance}
    />
  );
}
