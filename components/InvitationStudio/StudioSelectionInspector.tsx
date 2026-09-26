"use client";

import AssetLayerInspector from "@/components/InvitationStudio/AssetLayerInspector";
import CopyTextInspector from "@/components/InvitationStudio/CopyTextInspector";
import PhotoSlotInspector from "@/components/InvitationStudio/PhotoSlotInspector";
import RsvpElementInspector from "@/components/InvitationStudio/RsvpElementInspector";
import SectionElementInspector from "@/components/InvitationStudio/SectionElementInspector";
import SectionInspector from "@/components/InvitationStudio/SectionInspector";
import TextLayerInspector from "@/components/InvitationStudio/TextLayerInspector";
import type { AssetLayerPosition } from "@/components/InvitationStudio/designer-layer-order";
import type { InvitationDesignState } from "@/components/InvitationStudio/designer-types";
import { invitationCopyDefaults, type EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import type { EditableCopyMotion } from "@/lib/templates/editable-copy-motion";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import type { PhotoMotion, PhotoSlot } from "@/lib/templates/photo-slots";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionStyle } from "@/lib/templates/section-styles";
import type { StudioSectionElementKind } from "@/lib/templates/section-element-styles";

type SelectedSectionElement = {
  section: InvitationSectionKey;
  kind: StudioSectionElementKind;
} | null;

export default function StudioSelectionInspector({
  locale,
  design,
  invitationDescription,
  selectedAssetLayer,
  selectedAssetIndex,
  selectedPhotoSlot,
  selectedRsvpElementKey,
  selectedSectionElement,
  selectedCopyField,
  selectedSectionKey,
  onCloseAsset,
  onUpdateAsset,
  onPositionAsset,
  onUpdatePhotoMotion,
  onResetPhotoMotion,
  onClosePhoto,
  onUpdateRsvpConfig,
  onCloseRsvp,
  onUpdateSectionElementStyles,
  onCloseSectionElement,
  onSetNarrativeCopy,
  onUpdateCopyMotion,
  onResetNarrativeCopyAndMotion,
  onCloseCopy,
  onUpdateSectionStyle,
  onResetSectionStyle,
  onCloseSection,
}: {
  locale: string;
  design: InvitationDesignState;
  invitationDescription?: string | null;
  selectedAssetLayer: InvitationAssetLayer | null;
  selectedAssetIndex: number;
  selectedPhotoSlot: PhotoSlot | null;
  selectedRsvpElementKey: string | null;
  selectedSectionElement: SelectedSectionElement;
  selectedCopyField: EditableInvitationCopyField | null;
  selectedSectionKey: InvitationSectionKey | null;
  onCloseAsset: () => void;
  onUpdateAsset: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onPositionAsset: (id: string, position: AssetLayerPosition) => void;
  onUpdatePhotoMotion: (slot: PhotoSlot, patch: Partial<PhotoMotion>) => void;
  onResetPhotoMotion: (slot: PhotoSlot) => void;
  onClosePhoto: () => void;
  onUpdateRsvpConfig: (patch: Partial<InvitationDesignState["rsvpConfig"]>) => void;
  onCloseRsvp: () => void;
  onUpdateSectionElementStyles: (styles: InvitationDesignState["sectionElementStyles"]) => void;
  onCloseSectionElement: () => void;
  onSetNarrativeCopy: (field: EditableInvitationCopyField, value: string) => void;
  onUpdateCopyMotion: (field: EditableInvitationCopyField, patch: Partial<EditableCopyMotion>) => void;
  onResetNarrativeCopyAndMotion: (field: EditableInvitationCopyField) => void;
  onCloseCopy: () => void;
  onUpdateSectionStyle: (key: InvitationSectionKey, patch: Partial<InvitationSectionStyle>) => void;
  onResetSectionStyle: (key: InvitationSectionKey) => void;
  onCloseSection: () => void;
}) {
  if (selectedAssetLayer?.kind === "text") {
    return (
      <TextLayerInspector
        locale={locale}
        layer={selectedAssetLayer}
        selectedIndex={selectedAssetIndex}
        layerCount={design.layers.length}
        sections={design.sections}
        onClose={onCloseAsset}
        onUpdate={onUpdateAsset}
        onPosition={onPositionAsset}
      />
    );
  }

  if (selectedAssetLayer) {
    return (
      <AssetLayerInspector
        locale={locale}
        selectedAssetLayer={selectedAssetLayer}
        selectedAssetIndex={selectedAssetIndex}
        layerCount={design.layers.length}
        sections={design.sections}
        onDeselect={onCloseAsset}
        onUpdate={onUpdateAsset}
        onPosition={onPositionAsset}
      />
    );
  }

  if (selectedPhotoSlot) {
    return (
      <PhotoSlotInspector
        locale={locale}
        slot={selectedPhotoSlot}
        motion={design.photos.motion?.[selectedPhotoSlot]}
        onUpdate={(patch) => onUpdatePhotoMotion(selectedPhotoSlot, patch)}
        onReset={() => onResetPhotoMotion(selectedPhotoSlot)}
        onClose={onClosePhoto}
      />
    );
  }

  if (selectedRsvpElementKey) {
    return (
      <RsvpElementInspector
        locale={locale}
        elementKey={selectedRsvpElementKey}
        config={design.rsvpConfig}
        onConfig={onUpdateRsvpConfig}
        onClose={onCloseRsvp}
      />
    );
  }

  if (selectedSectionElement) {
    return (
      <SectionElementInspector
        locale={locale}
        section={selectedSectionElement.section}
        kind={selectedSectionElement.kind}
        styles={design.sectionElementStyles}
        onChange={onUpdateSectionElementStyles}
        onClose={onCloseSectionElement}
      />
    );
  }

  if (selectedCopyField) {
    const defaults = invitationCopyDefaults(design.template, invitationDescription);
    return (
      <CopyTextInspector
        locale={locale}
        field={selectedCopyField}
        value={design.copy[selectedCopyField] ?? defaults[selectedCopyField] ?? ""}
        defaultValue={defaults[selectedCopyField] ?? ""}
        motion={design.copyMotion[selectedCopyField]}
        onChange={(value) => onSetNarrativeCopy(selectedCopyField, value)}
        onMotion={(patch) => onUpdateCopyMotion(selectedCopyField, patch)}
        onReset={() => onResetNarrativeCopyAndMotion(selectedCopyField)}
        onClose={onCloseCopy}
      />
    );
  }

  if (selectedSectionKey) {
    return (
      <SectionInspector
        locale={locale}
        sectionKey={selectedSectionKey}
        style={design.sectionStyles[selectedSectionKey]}
        onUpdate={(patch) => onUpdateSectionStyle(selectedSectionKey, patch)}
        onReset={() => onResetSectionStyle(selectedSectionKey)}
        onClose={onCloseSection}
      />
    );
  }

  return null;
}
