import {
  getEventCategory,
  normalizeEventCategory,
} from "@/lib/events/catalog";
import {
  makeDesignKey,
  parseDesignKey,
} from "@/lib/templates/design";
import {
  parseInvitationSections,
  withInvitationSections,
} from "@/lib/templates/sections";
import { parsePhotoAssignments, withPhotoAssignments } from "@/lib/templates/photo-slots";
import { parseEditableCopy, withEditableCopy } from "@/lib/templates/editable-copy";
import { invitationTemplatePresets } from "@/components/InvitationStudio/designer-config";
import { parseAssetLayers, withAssetLayers } from "@/lib/templates/asset-layers";
import { parseInvitationSectionStyles, withInvitationSectionStyles } from "@/lib/templates/section-styles";
import { parseInvitationRsvpConfig, withInvitationRsvpConfig } from "@/lib/templates/rsvp-config";
import type {
  InvitationDesignerInvitation,
  InvitationDesignState,
} from "@/components/InvitationStudio/designer-types";

export function getInvitationEventIdentity(
  invitation: InvitationDesignerInvitation | null,
) {
  if (!invitation) {
    return {
      category: normalizeEventCategory("OTHER"),
      label: "Event",
      primary: "Nama acara",
      secondary: "",
    };
  }

  const category = normalizeEventCategory(invitation.eventCategory);
  const info = getEventCategory(category);

  if (info.nameMode === "couple") {
    return {
      category,
      label: info.label,
      primary: invitation.groomName || invitation.title || "Nama pertama",
      secondary: invitation.brideName || "Nama kedua",
    };
  }

  if (info.nameMode === "single") {
    return {
      category,
      label: info.label,
      primary: invitation.groomName || invitation.title || "Nama utama",
      secondary: "",
    };
  }

  return {
    category,
    label: info.label,
    primary: invitation.title || "Nama acara",
    secondary: "",
  };
}

export function formatInvitationEventDate(
  invitation: InvitationDesignerInvitation | null,
) {
  if (!invitation?.eventDate) return "Tanggal acara belum diatur";
  const date = new Date(invitation.eventDate);
  if (Number.isNaN(date.getTime())) return "Tanggal acara belum diatur";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: invitation.timezone || "Asia/Jakarta",
  }).format(date);
}

export function makeInvitationDesignStateKey(state: InvitationDesignState) {
  return withInvitationRsvpConfig(withInvitationSectionStyles(withAssetLayers(withEditableCopy(
    withPhotoAssignments(
      withInvitationSections(
        makeDesignKey(state.template, state.palette, state.font, state.decor),
        state.sections,
      ),
      state.photos,
    ),
    state.copy,
  ), state.layers), state.sectionStyles), state.rsvpConfig);
}

export function invitationDesignStateFromKey(
  key: string,
  fallbackDecor: string,
): InvitationDesignState {
  const parsed = parseDesignKey(key);
  const preset =
    invitationTemplatePresets[parsed.template] ||
    invitationTemplatePresets["botanical-ivory"];

  return {
    template: parsed.template,
    palette: parsed.palette || preset.palette,
    font: parsed.font || preset.font,
    decor: parsed.decor || fallbackDecor,
    sections: parseInvitationSections(key),
    photos: parsePhotoAssignments(key),
    copy: parseEditableCopy(key),
    layers: parseAssetLayers(key),
    sectionStyles: parseInvitationSectionStyles(key),
    rsvpConfig: parseInvitationRsvpConfig(key),
  };
}
