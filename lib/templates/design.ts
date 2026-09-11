export const invitationPalettes = {
  rose: { name: "Rose", bg: "#fbf2f0", surface: "#fffaf8", ink: "#2d2020", accent: "#7a1c25", soft: "#e8b7b1" },
  blush: { name: "Blush", bg: "#fff4f6", surface: "#fffafb", ink: "#34242a", accent: "#a44f62", soft: "#e9a9b9" },
  sage: { name: "Sage", bg: "#f3f5ee", surface: "#fcfcf8", ink: "#273027", accent: "#65775f", soft: "#b8c9ae" },
  night: { name: "Night", bg: "#171318", surface: "#211b22", ink: "#f8f2ee", accent: "#e7a9b1", soft: "#9b7079" },
  pearl: { name: "Pearl", bg: "#f5f1ea", surface: "#fffdf8", ink: "#292522", accent: "#806a5a", soft: "#cdbba8" },
} as const;

export const invitationFonts = {
  classic: { name: "Cinzel + Fauna One", heading: "var(--font-cinzel)", body: "var(--font-fauna)" },
  editorial: { name: "Cinzel + Fauna One", heading: "var(--font-cinzel)", body: "var(--font-fauna)" },
} as const;

export type PaletteKey = keyof typeof invitationPalettes;
export type FontKey = keyof typeof invitationFonts;

export function makeDesignKey(template: string, palette: PaletteKey, font: FontKey) {
  return `${template}::${palette}::${font}`;
}

export function parseDesignKey(key: string) {
  const [template = "eternal-blossom", palette = "rose", font = "classic"] = key.split("::");
  return {
    template,
    palette: (palette in invitationPalettes ? palette : "rose") as PaletteKey,
    font: (font in invitationFonts ? font : "classic") as FontKey,
  };
}
