"use client";

import { ClassicPearlArt } from "@/components/PublicInvitation/ClassicPearlArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

const keepsakes = [
  {
    id: "promise",
    eyebrow: "Sebuah Janji",
    title: "Yang tetap tinggal",
    copy: "Bukan hanya tentang satu hari, tetapi tentang pilihan untuk terus berjalan bersama.",
    asset: "tiara" as const,
    objectKey: "object:gallery:tiara-art",
  },
  {
    id: "memory",
    eyebrow: "Sebuah Kenangan",
    title: "Yang ingin dikenang",
    copy: "Ada detail kecil yang suatu hari akan membawa kita kembali pada rasa hari ini.",
    asset: "perfume" as const,
    objectKey: "object:gallery:perfume-art",
  },
  {
    id: "reflection",
    eyebrow: "Sebuah Perjalanan",
    title: "Yang tumbuh bersama",
    copy: "Dua cerita tidak harus sama untuk dapat saling mencerminkan dan saling menjaga.",
    asset: "mirror" as const,
    objectKey: "object:gallery:mirror-art",
  },
];

export default function ClassicPearlGallery() {
  const language = useInvitationLanguage();
  const tr = (value: string) => invitationText(language, value);
  return <div className="cp-gallery" aria-label={tr("Galeri Kenangan")}>
    <ClassicPearlArt objectKey="object:gallery:garland-art" asset="garland" className="cp-gallery-garland" />
    <div data-studio-native-object="object:gallery:keepsake-grid" className="cp-gallery-grid">
      {keepsakes.map((item, index) => <article key={item.id} data-studio-native-object={`object:gallery:keepsake-${index + 1}`} className="cp-keepsake-card">
        <p data-studio-native-object={`object:gallery:${item.id}-eyebrow`} className="cp-keepsake-eyebrow">{tr(item.eyebrow)}</p>
        <ClassicPearlArt objectKey={item.objectKey} asset={item.asset} className="cp-keepsake-art" />
        <h3 data-studio-native-object={`object:gallery:${item.id}-title`} className="cp-keepsake-title">{tr(item.title)}</h3>
        <p data-studio-native-object={`object:gallery:${item.id}-copy`} className="cp-keepsake-copy">{tr(item.copy)}</p>
      </article>)}
    </div>
  </div>;
}
