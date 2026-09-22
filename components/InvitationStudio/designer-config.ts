import { invitationTemplates } from "@/lib/templates/catalog";
import { invitationFonts, invitationPalettes, type FontKey, type PaletteKey } from "@/lib/templates/design";
import type { InvitationTemplatePreset } from "@/components/InvitationStudio/designer-types";

export const invitationDecorOptions = [
  "/couple.jpg",
  "/couple2.jpg",
  "/couple3.jpg",
];

export const invitationTemplatePresets: Record<string, InvitationTemplatePreset> = Object.fromEntries(
  invitationTemplates.map((template) => [template.key, template.preset]),
);

export const invitationPaletteOptions = Object.entries(invitationPalettes) as [
  PaletteKey,
  (typeof invitationPalettes)[PaletteKey],
][];

export const invitationFontOptions = (
  Object.entries(invitationFonts) as [
    FontKey,
    (typeof invitationFonts)[FontKey],
  ][]
).sort((a, b) => a[1].name.localeCompare(b[1].name));
