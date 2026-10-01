import type { PhotoSlot } from "@/lib/templates/photo-slots";
import type { FontKey, PaletteKey } from "@/lib/templates/design";
import type { InvitationTemplateLayout } from "@/components/InvitationStudio/designer-types";

export type InvitationTemplate = {
  key: string;
  name: string;
  description: string;
  descriptionEn?: string;
  previewImage: string;
  assetPath: string;
  category: string;
  previewType: "public" | "studio";
  photoSlots: PhotoSlot[];
  usesPhotos: boolean;
  preset: { layout: InvitationTemplateLayout; palette: PaletteKey; font: FontKey };
};

export const blankCanvasTemplate: InvitationTemplate = {
  key: "blank-canvas",
  category: "Studio",
  previewType: "studio",
  usesPhotos: false,
  photoSlots: [],
  preset: { layout: "editorial", palette: "pearl", font: "cinzelFauna" },
  name: "Canvas Kosong",
  description: "Canvas kosong untuk membangun desain dari nol di Studio.",
  descriptionEn: "A blank canvas for building a design from scratch in Studio.",
  previewImage: "/assets/landing/ornaments/legacy/flower.webp",
  assetPath: "",
};

export const invitationTemplates: InvitationTemplate[] = [
  {
    key: "romantic-rose",
    category: "Floral",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "editorial", palette: "blush", font: "cinzelFauna" },
    name: "Romantic Rose",
    description: "Amplop digital, galeri foto pasangan, dan 13 bagian undangan dalam nuansa rose.",
    descriptionEn: "A digital envelope, couple photo gallery, and 13 invitation sections in a romantic rose direction.",
    previewImage: "/assets/demo/invitation/couple.webp",
    assetPath: "/templates/romantic-rose",
  },
  {
    key: "botanical-ivory",
    category: "Botanical",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "botanical", palette: "botanical", font: "rufinaAverage" },
    name: "Botanical Ivory",
    description:
      "Stationery ivory romantis, tipografi editorial, simbol cincin dan pita, dengan aksen botanical yang ringan tanpa foto.",
    descriptionEn:
      "Romantic ivory stationery, editorial typography, rings and ribbon motifs, with restrained botanical accents in a photo-free invitation.",
    previewImage:
      "/templates/botanical-ivory/greenplant.webp",
    assetPath: "/templates/botanical-ivory",
  },
  {
    key: "eternal-blossom",
    category: "Floral",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "editorial", palette: "blossom", font: "playfairLora" },
    name: "Eternal Blossom",
    description: "Bunga blush, potret scallop, dan album kenangan dengan gerak lembut untuk perayaanmu.",
    descriptionEn: "Blush blossoms, scalloped portraits, and a softly animated photo album for your celebration.",
    previewImage:
      "/assets/demo/invitation/couple-03.webp",
    assetPath: "/templates/eternal-blossom",
  },
  {
    key: "modern-maroon",
    category: "Modern",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "maroon", palette: "maroon", font: "syneInter" },
    name: "Modern Maroon",
    description: "Editorial maroon asimetris dengan potret berlapis, tipografi berani, dan galeri seperti halaman majalah.",
    descriptionEn: "An asymmetric maroon editorial with layered portraits, bold typography, and a magazine-like gallery.",
    previewImage:
      "/assets/demo/invitation/couple-02.webp",
    assetPath: "/templates/modern-maroon",
  },
  {
    key: "garden-light",
    category: "Botanical",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "garden", palette: "sage", font: "playfairLora" },
    name: "Garden Light",
    description: "Botanical terang untuk acara outdoor, garden, dan daytime celebration.",
    descriptionEn: "A bright botanical direction for outdoor, garden, and daytime celebrations.",
    previewImage:
      "/assets/demo/invitation/couple-03.webp",
    assetPath: "/templates/garden-light",
  },
  {
    key: "midnight-romance",
    category: "Modern",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "midnight", palette: "midnight", font: "cinzelFauna" },
    name: "Midnight Romance",
    description: "Dramatis, intimate, dan elegan untuk acara malam hari.",
    descriptionEn: "A dramatic, intimate, and elegant direction for evening celebrations.",
    previewImage:
      "/assets/demo/invitation/couple.webp",
    assetPath: "/templates/midnight-romance",
  },
  {
    key: "classic-pearl",
    category: "Classic",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "classic", palette: "pearl", font: "playfairLora" },
    name: "Classic Pearl",
    description: "Clean classic dengan kesan timeless dan fleksibel untuk banyak tema acara.",
    descriptionEn: "A clean classic theme with a timeless feel that adapts to many event styles.",
    previewImage:
      "/assets/demo/invitation/couple-02.webp",
    assetPath: "/templates/classic-pearl",
  },
  {
    key: "golden-art-deco",
    category: "Art Deco",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "classic", palette: "champagne", font: "cinzelFauna" },
    name: "Golden Art Deco",
    description: "Komposisi geometris emas dan garis simetris, sepenuhnya tanpa foto.",
    descriptionEn: "Golden geometric composition and symmetrical lines, designed completely without photos.",
    previewImage: "/assets/landing/ornaments/legacy/flower.webp",
    assetPath: "/templates/golden-art-deco",
  },
  {
    key: "paper-cut-botanical",
    category: "Illustration",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "garden", palette: "sage", font: "cinzelFauna" },
    name: "Paper Cut Botanical",
    description: "Kolase daun dan lapisan kertas berwarna sage, tanpa foto.",
    descriptionEn: "A sage paper-cut collage of layered leaves, designed without photos.",
    previewImage: "/assets/landing/ornaments/legacy/flower.webp",
    assetPath: "/templates/paper-cut-botanical",
  },
  {
    key: "pencil-reverie",
    category: "Illustration",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "editorial", palette: "pencil", font: "playfairQuicksand" },
    name: "Pencil Reverie",
    description: "Romansa sketsa pensil, kolase kenangan vintage, dan animasi waktu, tanpa foto.",
    descriptionEn: "Pencil-sketch romance, vintage memory collage, and time-inspired motion, without photos.",
    previewImage: "/templates/pencil-reverie/bungaandlampbg.webp",
    assetPath: "/templates/pencil-reverie",
  },
  {
    key: "zen-atelier",
    category: "Zen",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "gallery"],
    preset: { layout: "botanical", palette: "zen", font: "playfairInter" },
    name: "Zen Atelier",
    description: "Sampul ilustrasi sakura dan pegunungan tinta, potret pasangan editorial, dan galeri foto.",
    descriptionEn: "An illustrated sakura and ink-mountain cover with editorial couple portraits and a photo gallery.",
    previewImage: "/api/template-preview/zen-atelier",
    assetPath: "/templates/zen-atelier",
  },
  {
    key: "celestial-ink",
    category: "Celestial",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "midnight", palette: "night", font: "cinzelFauna" },
    name: "Celestial Ink",
    description: "Langit malam, orbit dan bintang berilustrasi tanpa foto.",
    descriptionEn: "An illustrated night sky of orbits and stars, designed without photos.",
    previewImage: "/assets/landing/ornaments/legacy/flower.webp",
    assetPath: "/templates/celestial-ink",
  },
  {
    key: "serein",
    category: "Editorial",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "editorial", palette: "serein", font: "crimsonDmSans" },
    name: "Serein",
    description: "Surat bersegel, tipografi editorial, dan album foto hitam-putih di atas kertas ivory.",
    descriptionEn: "Sealed stationery, editorial typography, and a monochrome photo album on ivory paper.",
    previewImage: "/assets/demo/invitation/couple.webp",
    assetPath: "/templates/serein",
  },
];

export function getInvitationTemplate(key: string) {
  const baseKey = key.split("::")[0];
  if (baseKey === blankCanvasTemplate.key) return blankCanvasTemplate;
  return (
    invitationTemplates.find((template) => template.key === baseKey) ??
    invitationTemplates[0]
  );
}
