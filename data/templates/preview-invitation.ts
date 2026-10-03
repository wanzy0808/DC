import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

/**
 * Isolated gallery/QA fixture. Never read from or write to a customer's invitation.
 * The following photos are existing local public demo assets, not customer uploads.
 */
export const templateDemoPhoto = "/assets/demo/invitation/couple.webp";

export const templateDemoInvitation: InvitationDesignerInvitation = {
  id: "gallery-preview-only",
  slug: "gallery-preview-only",
  type: "WEDDING",
  title: "Pernikahan Una & Dara",
  eventCategory: "WEDDING",
  groomName: "Una",
  brideName: "Dara",
  venue: "Taman Senja",
  address: "Jakarta, Indonesia",
  mapUrl: null,
  timezone: "Asia/Jakarta",
  eventDate: "2027-06-12T10:00:00+07:00",
  ceremonyTime: "10:00",
  receptionTime: "12:00",
  description: "Dengan penuh sukacita, kami mengundang Anda untuk hadir dan merayakan hari istimewa bersama kami.",
  weddingHashtag: null,
  dressCode: null,
  eventNotes: null,
  musicUrl: null,
  templateKey: "",
  isPublished: false,
  accessPaid: false,
  giftBankName: null,
  giftAccountName: null,
  giftAccountNumber: null,
  assets: [
    { id: "gallery-demo-cover", type: "IMAGE", url: templateDemoPhoto, title: "Foto contoh" },
    { id: "gallery-demo-second", type: "IMAGE", url: "/assets/demo/invitation/person-one.webp", title: "Foto contoh mempelai pertama" },
    { id: "gallery-demo-third", type: "IMAGE", url: "/assets/demo/invitation/person-two.webp", title: "Foto contoh mempelai kedua" },
    { id: "gallery-demo-fourth", type: "IMAGE", url: "/assets/demo/invitation/couple-02.webp", title: "Foto contoh pasangan" },
    { id: "gallery-demo-fifth", type: "IMAGE", url: "/assets/demo/invitation/couple-03.webp", title: "Foto contoh pasangan" },
  ],
};

/** Birthday previews have one honoree; the persistence type is a legacy field. */
export const birthdayTemplateDemoInvitation: InvitationDesignerInvitation = {
  ...templateDemoInvitation,
  id: "birthday-gallery-preview-only",
  slug: "birthday-gallery-preview-only",
  title: "Ulang Tahun Dara",
  eventCategory: "BIRTHDAY",
  groomName: "Dara",
  brideName: "",
  venue: "Rumah Cerita",
  eventDate: "2027-06-12T16:00:00+07:00",
  ceremonyTime: "16:00",
  receptionTime: "END",
  description: null,
  assets: [
    { id: "birthday-demo-cover", type: "IMAGE", url: "/assets/demo/invitation/person-two.webp", title: "Potret contoh" },
    { id: "birthday-demo-memory", type: "IMAGE", url: "/assets/demo/invitation/person-one.webp", title: "Kenangan bersama teman" },
  ],
};

export function getTemplateDemoInvitation(templateKey: string): InvitationDesignerInvitation {
  return templateKey.split("::")[0] === "confetti-club"
    ? birthdayTemplateDemoInvitation
    : templateDemoInvitation;
}
