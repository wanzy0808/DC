import type { EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import type { PhotoSlot } from "@/lib/templates/photo-slots";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { StudioSectionElementKind } from "@/lib/templates/section-element-styles";

export type StudioCanvasSelectionTarget =
  | { kind: "rsvp-element"; key: string }
  | { kind: "section-element"; section: InvitationSectionKey; elementKind: StudioSectionElementKind }
  | { kind: "copy"; field: EditableInvitationCopyField }
  | { kind: "photo"; slot: PhotoSlot }
  | { kind: "section"; section: InvitationSectionKey; instanceId: string }
  | { kind: "clear" }
  | { kind: "ignore" };

const photoSlots: ReadonlySet<PhotoSlot> = new Set(["cover", "personOne", "personTwo", "gallery"]);

export function resolveStudioCanvasSelection(
  target: Element,
  canvasRoot: HTMLElement,
): StudioCanvasSelectionTarget {
  const rsvpElement = target.closest<HTMLElement>("[data-studio-rsvp-element]");
  if (rsvpElement?.dataset.studioRsvpElement) {
    return { kind: "rsvp-element", key: rsvpElement.dataset.studioRsvpElement };
  }

  const sectionElement = target.closest<HTMLElement>("[data-studio-section-element]");
  if (sectionElement?.dataset.studioSectionElement) {
    const [section, elementKind] = sectionElement.dataset.studioSectionElement.split(":");
    if (section && (elementKind === "input" || elementKind === "button")) {
      return {
        kind: "section-element",
        section: section as InvitationSectionKey,
        elementKind,
      };
    }
  }

  const copyElement = target.closest<HTMLElement>("[data-studio-copy-field]");
  if (copyElement?.dataset.studioCopyField) {
    return {
      kind: "copy",
      field: copyElement.dataset.studioCopyField as EditableInvitationCopyField,
    };
  }

  if (target.closest("[data-studio-photo-crop]")) return { kind: "ignore" };

  const photoElement = target.closest<HTMLElement>("[data-invitation-photo-slot]");
  const photoSlot = photoElement?.dataset.invitationPhotoSlot as PhotoSlot | undefined;
  if (photoSlot && photoSlots.has(photoSlot)) {
    return { kind: "photo", slot: photoSlot };
  }

  if (target.closest(
    "[data-studio-design-object], .dc-studio-layer-side, .dc-studio-section-side, button, a, input, select, textarea, [contenteditable], [role=button]",
  )) {
    return { kind: "ignore" };
  }

  const section = target.closest<HTMLElement>("[data-invitation-section]");
  if (section?.dataset.invitationSection) {
    if (section.dataset.invitationSection === "rsvp" && target.closest("img")) {
      return { kind: "clear" };
    }
    const sectionKey = section.dataset.invitationSection as InvitationSectionKey;
    const instance = target.closest<HTMLElement>("[data-section-instance-id]");
    return {
      kind: "section",
      section: sectionKey,
      instanceId: instance?.dataset.sectionInstanceId || sectionKey,
    };
  }

  if (
    target === canvasRoot ||
    target.closest(".dc-studio-preview-surface") ||
    target.closest(".dc-studio-preview-workspace")
  ) {
    return { kind: "clear" };
  }

  return { kind: "ignore" };
}
