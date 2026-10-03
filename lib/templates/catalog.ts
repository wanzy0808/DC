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
    description: "Rose garden klasik dengan blush pink, kelopak lembut, garis ornamental, dan sentuhan romantis yang anggun.",
    descriptionEn: "A classic rose-garden aesthetic with blush pink, soft petals, ornamental lines, and an elegant romantic mood.",
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
      "Palet ivory hangat dengan tipografi editorial, simbol cincin dan pita, serta aksen botanical yang ringan dan refined.",
    descriptionEn:
      "A warm ivory palette with editorial typography, rings and ribbon motifs, and restrained botanical accents.",
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
    description: "Bunga blush, bingkai scallop, tekstur lembut, dan ritme visual romantis dengan gerak yang halus.",
    descriptionEn: "Blush blossoms, scalloped framing, soft textures, and a romantic visual rhythm with restrained motion.",
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
    description: "Komposisi editorial maroon yang asimetris dengan layering tegas, tipografi berani, dan ritme visual ala majalah.",
    descriptionEn: "An asymmetric maroon editorial with bold layering, strong typography, and a magazine-inspired visual rhythm.",
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
    preset: { layout: "garden", palette: "gardenGlow", font: "youngInstrument" },
    name: "Garden Light",
    description: "Nuansa pesta taman dari golden hour menuju senja, dengan wedding arch bercahaya, lentera, ayunan, fountain, dan atmosfer hangat.",
    descriptionEn: "A golden-hour-to-twilight garden mood with a glowing wedding arch, lanterns, swing, fountain, and a warm atmosphere.",
    previewImage:
      "/templates/garden-light/10_romantic_lit_wedding_arch.webp",
    assetPath: "/templates/garden-light",
  },
  {
    key: "midnight-romance",
    category: "Modern",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "midnight", palette: "midnightVelvet", font: "bodoniManrope" },
    name: "Midnight Romance",
    description: "Salon malam yang intim dengan navy velvet, burgundy, cahaya lilin, detail baroque, dan komposisi editorial dramatis.",
    descriptionEn: "An intimate midnight salon of navy velvet, burgundy, candlelight, baroque details, and dramatic editorial composition.",
    previewImage:
      "/templates/midnight-romance/04_navy_rose_wedding_arch.webp",
    assetPath: "/templates/midnight-romance",
  },
  {
    key: "classic-pearl",
    category: "Classic",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "classic", palette: "pearlAtelier", font: "cormorantManrope" },
    name: "Classic Pearl",
    description: "Atelier klasik dengan porcelain ivory, champagne gold, mutiara, detail bridal, dan komposisi heirloom yang mewah.",
    descriptionEn: "A classic atelier of porcelain ivory, champagne gold, pearls, bridal details, and luxurious heirloom composition.",
    previewImage:
      "/templates/classic-pearl/08_ivory_gold_wedding_arch.webp",
    assetPath: "/templates/classic-pearl",
  },
  {
    key: "golden-art-deco",
    category: "Art Deco",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "classic", palette: "decoNoir", font: "poiretMontserrat" },
    name: "Golden Art Deco",
    description: "Poster soirée 1920-an dengan noir lacquer, champagne gold, arsitektur Gatsby, garis geometris, dan komposisi editorial glamor.",
    descriptionEn: "A 1920s soirée poster of lacquered noir, champagne gold, Gatsby architecture, geometric lines, and glamorous editorial composition.",
    previewImage: "/templates/golden-art-deco/01_gatsby_archway.webp",
    assetPath: "/templates/golden-art-deco",
  },
  {
    key: "paper-cut-botanical",
    category: "Illustration",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "garden", palette: "paperMeadow", font: "yesevaJosefin" },
    name: "Paper Cut Botanical",
    description: "Teater kertas botani berlapis dengan ilustrasi pasangan, pita, tiket kenangan, tekstur cut-paper, dan komposisi editorial puitis.",
    descriptionEn: "A layered botanical paper theatre with illustrated couple art, ribbon, keepsake tickets, cut-paper texture, and poetic editorial composition.",
    previewImage: "/templates/paper-cut-botanical/01_story_couple.webp",
    assetPath: "/templates/paper-cut-botanical",
  },
  {
    key: "pencil-reverie",
    category: "Illustration",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "editorial", palette: "pencil", font: "youngInstrument" },
    name: "Pencil Reverie",
    description: "Sketchbook romansa editorial dengan lembar catatan, sketsa pasangan, benda kenangan vintage, motion halus, dan tekstur graphite yang intim.",
    descriptionEn: "An editorial romance sketchbook of paper notes, couple sketches, vintage keepsakes, restrained motion, and intimate graphite texture.",
    previewImage: "/templates/pencil-reverie/couplesitting.webp",
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
    description: "Atelier Jepang dengan washi, mizuhiki, red sun, lanskap tinta, komposisi asimetris, dan suasana zen yang tenang.",
    descriptionEn: "A Japanese atelier of washi, mizuhiki, red sun, ink landscapes, asymmetric composition, and a calm zen atmosphere.",
    previewImage: "/api/template-preview/zen-atelier",
    assetPath: "/templates/zen-atelier",
  },
  {
    key: "velvet-horizon",
    category: "Romantic",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "personOne", "personTwo", "gallery"],
    preset: { layout: "editorial", palette: "velvetHorizon", font: "cormorantManrope" },
    name: "Velvet Horizon",
    description: "Senja Mediterranean yang hangat dengan dusty rose velvet, lengkung arsitektur klasik, cahaya lilin, florals lembut, dan komposisi editorial romantis.",
    descriptionEn: "A warm Mediterranean sunset of dusty-rose velvet, classical arches, candlelight, soft florals, and romantic editorial composition.",
    previewImage: "/api/template-preview/velvet-horizon",
    assetPath: "/templates/velvet-horizon",
  },
  {
    key: "celestial-ink",
    category: "Celestial",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "midnight", palette: "celestialIndigo", font: "cinzelFauna" },
    name: "Celestial Ink",
    description: "Paviliun seremoni malam dengan indigo pekat, moon gate asimetris, folding screen, drapery, lentera, dan komposisi editorial atmosferik.",
    descriptionEn: "A moonlit ceremonial pavilion of deep indigo, an asymmetric moon gate, folding screens, drapery, lantern light, and atmospheric editorial composition.",
    previewImage: "/templates/celestial-ink/10_celestial_moon_gate.webp",
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
    description: "Stationery bersegel dengan tipografi editorial, palet monochrome, tekstur kertas ivory, dan nuansa surat cinta klasik.",
    descriptionEn: "Sealed stationery with editorial typography, a monochrome palette, ivory paper texture, and a classic love-letter mood.",
    previewImage: "/assets/demo/invitation/couple.webp",
    assetPath: "/templates/serein",
  },
  {
    key: "confetti-club",
    category: "Birthday",
    previewType: "public",
    usesPhotos: true,
    photoSlots: ["cover", "gallery"],
    preset: { layout: "editorial", palette: "confetti", font: "syneInter" },
    name: "Confetti Club",
    description: "Undangan ulang tahun ceria dengan amplop hadiah, ilustrasi kue, tipografi besar, dan album kenangan.",
    descriptionEn: "A cheerful birthday invitation with a gift envelope, cake illustration, bold typography, and a memory album.",
    previewImage: "/templates/confetti-club/preview.svg",
    assetPath: "/templates/confetti-club",
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
