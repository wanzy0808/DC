import { invitationFonts, invitationPalettes, type FontKey, type PaletteKey } from "@/lib/templates/design";
import type { InvitationTemplatePreset } from "@/components/InvitationStudio/designer-types";

export const invitationDecorOptions = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=700",
];

export const invitationTemplatePresets: Record<string, InvitationTemplatePreset> = {
  "botanical-ivory": { layout: "botanical", palette: "pearl", font: "cinzelFauna" },
  "eternal-blossom": { layout: "editorial", palette: "blush", font: "playfairLora" },
  "modern-maroon": { layout: "maroon", palette: "maroon", font: "cinzelFauna" },
  "garden-light": { layout: "garden", palette: "sage", font: "playfairLora" },
  "midnight-romance": { layout: "midnight", palette: "midnight", font: "cinzelFauna" },
  "classic-pearl": { layout: "classic", palette: "pearl", font: "playfairLora" },
};

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
