import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

/**
 * Isolated gallery/QA fixture. Never read from or write to a customer's invitation.
 * The following images are illustrative stock photos, not customer uploads.
 */
export const templateDemoPhoto = "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=900";

export const templateDemoInvitation: InvitationDesignerInvitation = {
  id: "gallery-preview-only",
  slug: "gallery-preview-only",
  type: "WEDDING",
  title: "Pernikahan Alya & Bima",
  eventCategory: "WEDDING",
  groomName: "Bima",
  brideName: "Alya",
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
    { id: "gallery-demo-second", type: "IMAGE", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800", title: "Foto contoh" },
    { id: "gallery-demo-third", type: "IMAGE", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800", title: "Foto contoh" },
  ],
};
