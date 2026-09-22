import type { PhotoSlot } from "@/lib/templates/photo-slots";
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
  photoSlots: PhotoSlot[];
  preset: { layout: InvitationTemplateLayout; palette: PaletteKey; font: FontKey };
};

export const invitationTemplates: InvitationTemplate[] = [
  {
    key: "romantic-rose",
    category: "Floral",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "editorial", palette: "blush", font: "cinzelFauna" },
    name: "Romantic Rose",
    description: "Amplop digital, galeri foto pasangan, dan 13 bagian undangan dalam nuansa rose.",
    previewImage: "/couple.jpg",
    assetPath: "/templates/romantic-rose",
  },
  {
    key: "botanical-ivory",
    category: "Botanical",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "botanical", palette: "pearl", font: "cinzelFauna" },
    name: "Botanical Ivory",
    description:
      "Ivory botanical bergaya editorial dengan susunan RSVP, Wishes, dan Gift seperti undangan mobile klasik.",
    previewImage:
      "/couple2.jpg",
    assetPath: "/templates/botanical-ivory",
  },
  {
    key: "eternal-blossom",
    category: "Floral",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "editorial", palette: "blush", font: "playfairLora" },
    name: "Eternal Blossom",
    description: "Floral editorial yang lembut untuk perayaan personal dan intimate.",
    previewImage:
      "/couple3.jpg",
    assetPath: "/templates/eternal-blossom",
  },
  {
    key: "modern-maroon",
    category: "Modern",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "maroon", palette: "maroon", font: "cinzelFauna" },
    name: "Modern Maroon",
    description: "Editorial modern dengan aksen berani untuk berbagai jenis acara.",
    previewImage:
      "/couple2.jpg",
    assetPath: "/templates/modern-maroon",
  },
  {
    key: "garden-light",
    category: "Botanical",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "garden", palette: "sage", font: "playfairLora" },
    name: "Garden Light",
    description: "Botanical terang untuk acara outdoor, garden, dan daytime celebration.",
    previewImage:
      "/couple3.jpg",
    assetPath: "/templates/garden-light",
  },
  {
    key: "midnight-romance",
    category: "Modern",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "midnight", palette: "midnight", font: "cinzelFauna" },
    name: "Midnight Romance",
    description: "Dramatis, intimate, dan elegan untuk acara malam hari.",
    previewImage:
      "/couple.jpg",
    assetPath: "/templates/midnight-romance",
  },
  {
    key: "classic-pearl",
    category: "Classic",
    previewType: "public",
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "classic", palette: "pearl", font: "playfairLora" },
    name: "Classic Pearl",
    description: "Clean classic dengan kesan timeless dan fleksibel untuk banyak tema acara.",
    previewImage:
      "/couple2.jpg",
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
