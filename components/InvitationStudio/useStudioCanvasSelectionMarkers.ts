"use client";

import { useEffect, type RefObject } from "react";

type StudioCanvasSelectionMarkers = {
  section?: string | null;
  rsvpElement?: string | null;
  sectionElement?: string | null;
  copyField?: string | null;
  photoSlot?: string | null;
};

function syncMarker(
  root: HTMLElement,
  selector: string,
  sourceKey: string,
  selected: string | null | undefined,
  markerKey: string,
) {
  for (const node of root.querySelectorAll<HTMLElement>(selector)) {
    if (selected && node.dataset[sourceKey] === selected) {
      node.dataset[markerKey] = "true";
    } else {
      delete node.dataset[markerKey];
    }
  }
}

export function useStudioCanvasSelectionMarkers(
  rootRef: RefObject<HTMLElement | null>,
  markers: StudioCanvasSelectionMarkers,
  revision: string,
) {
  const sectionElement = markers.sectionElement ?? "";
  const section = markers.section === "rsvp" ? null : markers.section;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    syncMarker(root, "[data-invitation-section]", "invitationSection", section, "studioSectionSelected");
    syncMarker(root, "[data-studio-rsvp-element]", "studioRsvpElement", markers.rsvpElement, "studioRsvpSelected");
    syncMarker(root, "[data-studio-section-element]", "studioSectionElement", sectionElement, "studioSectionElementSelected");
    syncMarker(root, "[data-studio-copy-field]", "studioCopyField", markers.copyField, "studioCopySelected");
    syncMarker(root, "[data-invitation-photo-slot]", "invitationPhotoSlot", markers.photoSlot, "studioPhotoSelected");
  }, [
    rootRef,
    revision,
    section,
    markers.rsvpElement,
    sectionElement,
    markers.copyField,
    markers.photoSlot,
  ]);
}
