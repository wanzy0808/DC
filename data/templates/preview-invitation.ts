import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

/**
 * Isolated gallery/QA fixture. Never read from or write to a customer's invitation.
 * The following photos are existing local public demo assets, not customer uploads.
 */
export const templateDemoPhoto = "/couple.jpg";

export const templateDemoInvitation: InvitationDesignerInvitation = {
  id: "gallery-preview-only",
  slug: "gallery-preview-only",
  type: "WEDDING",
  title: "Pernikahan Denny & Christine",
  eventCategory: "WEDDING",
  groomName: "Denny",
  brideName: "Christine",
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
    { id: "gallery-demo-second", type: "IMAGE", url: "/man.jpg", title: "Foto contoh mempelai pertama" },
    { id: "gallery-demo-third", type: "IMAGE", url: "/female.jpg", title: "Foto contoh mempelai kedua" },
    { id: "gallery-demo-fourth", type: "IMAGE", url: "/couple2.jpg", title: "Foto contoh pasangan" },
    { id: "gallery-demo-fifth", type: "IMAGE", url: "/couple3.jpg", title: "Foto contoh pasangan" },
  ],
};
