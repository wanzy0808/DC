import type { FontKey, PaletteKey } from "@/lib/templates/design";
import type { InvitationTemplateLayout } from "@/components/InvitationStudio/designer-types";

export type InvitationTemplate = {
  key: string;
  name: string;
  description: string;
  previewImage: string;
  assetPath: string;
  category: string;
  previewType: "public" | "studio";
  preset: { layout: InvitationTemplateLayout; palette: PaletteKey; font: FontKey };
};

export const invitationTemplates: InvitationTemplate[] = [
  {
    key: "romantic-rose",
    category: "Floral",
    previewType: "public",
    preset: { layout: "editorial", palette: "blush", font: "cinzelFauna" },
    name: "Romantic Rose",
    description: "Amplop digital, galeri foto pasangan, dan 13 bagian undangan dalam nuansa rose.",
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/romantic-rose",
  },
  {
    key: "botanical-ivory",
    category: "Botanical",
    previewType: "studio",
    preset: { layout: "botanical", palette: "pearl", font: "cinzelFauna" },
    name: "Botanical Ivory",
    description:
      "Ivory botanical bergaya editorial dengan susunan RSVP, Wishes, dan Gift seperti undangan mobile klasik.",
    previewImage:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/botanical-ivory",
  },
  {
    key: "eternal-blossom",
    category: "Floral",
    previewType: "studio",
    preset: { layout: "editorial", palette: "blush", font: "playfairLora" },
    name: "Eternal Blossom",
    description: "Floral editorial yang lembut untuk perayaan personal dan intimate.",
    previewImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/eternal-blossom",
  },
  {
    key: "modern-maroon",
    category: "Modern",
    previewType: "studio",
    preset: { layout: "maroon", palette: "maroon", font: "cinzelFauna" },
    name: "Modern Maroon",
    description: "Editorial modern dengan aksen berani untuk berbagai jenis acara.",
    previewImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/modern-maroon",
  },
  {
    key: "garden-light",
    category: "Botanical",
    previewType: "studio",
    preset: { layout: "garden", palette: "sage", font: "playfairLora" },
    name: "Garden Light",
    description: "Botanical terang untuk acara outdoor, garden, dan daytime celebration.",
    previewImage:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/garden-light",
  },
  {
    key: "midnight-romance",
    category: "Modern",
    previewType: "studio",
    preset: { layout: "midnight", palette: "midnight", font: "cinzelFauna" },
    name: "Midnight Romance",
    description: "Dramatis, intimate, dan elegan untuk acara malam hari.",
    previewImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/midnight-romance",
  },
  {
    key: "classic-pearl",
    category: "Classic",
    previewType: "studio",
    preset: { layout: "classic", palette: "pearl", font: "playfairLora" },
    name: "Classic Pearl",
    description: "Clean classic dengan kesan timeless dan fleksibel untuk banyak tema acara.",
    previewImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/classic-pearl",
  },
];

export function getInvitationTemplate(key: string) {
  const baseKey = key.split("::")[0];
  return (
    invitationTemplates.find((template) => template.key === baseKey) ??
    invitationTemplates[0]
  );
}
