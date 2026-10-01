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
    preset: { layout: "garden", palette: "gardenGlow", font: "youngInstrument" },
    name: "Garden Light",
    description: "Pesta taman saat golden hour menuju senja, dengan wedding arch bercahaya, lantern, swing, fountain, dan foto editorial.",
    descriptionEn: "A golden-hour-to-twilight garden celebration with a glowing wedding arch, lanterns, swing, fountain, and editorial photography.",
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
    description: "Salon malam yang intim dengan navy velvet, burgundy, cahaya lilin, detail baroque, dan foto editorial.",
    descriptionEn: "An intimate midnight salon of navy velvet, burgundy, candlelight, baroque details, and editorial photography.",
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
    description: "Atelier klasik tanpa foto dengan porcelain ivory, champagne gold, mutiara, detail bridal, dan komposisi heirloom.",
    descriptionEn: "A photo-free classic atelier of porcelain ivory, champagne gold, pearls, bridal details, and heirloom compositions.",
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
    description: "Poster soirée 1920-an dengan noir lacquer, champagne gold, arsitektur Gatsby, dan komposisi editorial tanpa foto.",
    descriptionEn: "A 1920s soirée poster of lacquered noir, champagne gold, Gatsby architecture, and photo-free editorial composition.",
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
    description: "Teater kertas botani berlapis dengan ilustrasi pasangan, pita, tiket kenangan, dan komposisi editorial tanpa foto.",
    descriptionEn: "A layered botanical paper theatre with illustrated couple art, ribbon, keepsake tickets, and a photo-free editorial composition.",
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
    description: "Sketchbook romansa editorial dengan lembar catatan, sketsa pasangan, benda kenangan vintage, dan motion halus; tanpa foto.",
    descriptionEn: "An editorial romance sketchbook of paper notes, couple sketches, vintage keepsakes, and restrained motion, without photos.",
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
    description: "Atelier Jepang dengan cover kakemono foto asimetris, washi, mizuhiki, red sun, lanskap tinta, dan galeri editorial.",
    descriptionEn: "A Japanese atelier with an asymmetric photo kakemono cover, washi, mizuhiki, red sun, ink landscapes, and an editorial gallery.",
    previewImage: "/api/template-preview/zen-atelier",
    assetPath: "/templates/zen-atelier",
  },
  {
    key: "celestial-ink",
    category: "Celestial",
    previewType: "public",
    usesPhotos: false,
    photoSlots: [],
    preset: { layout: "midnight", palette: "celestialIndigo", font: "cinzelFauna" },
    name: "Celestial Ink",
    description: "Paviliun seremoni malam tanpa foto dengan indigo pekat, moon gate asimetris, folding screen, drapery, lentera, dan komposisi editorial.",
    descriptionEn: "A photo-free moonlit ceremonial pavilion of deep indigo, an asymmetric moon gate, folding screens, drapery, lantern light, and editorial composition.",
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
