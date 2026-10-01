"use client";

import { PaperCutBotanicalArt } from "@/components/PublicInvitation/PaperCutBotanicalArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

export default function PaperCutBotanicalGallery() {
  const language = useInvitationLanguage();
  const tr = (value: string) => invitationText(language, value);

  return (
    <div className="pcb-gallery" aria-label={tr("Kolase Kertas")}>
      <article data-studio-native-object="object:gallery:keepsake-group" className="pcb-collage pcb-collage-keepsake">
        <span aria-hidden className="pcb-tape pcb-tape-one" />
        <PaperCutBotanicalArt objectKey="object:gallery:ticket-art" asset="ticket" className="pcb-collage-art pcb-ticket-art" />
        <div className="pcb-collage-copy">
          <span aria-hidden className="pcb-collage-index">01</span>
          <h3 data-studio-native-object="object:gallery:keepsake-title">{tr("Selembar Cerita")}</h3>
          <p data-studio-native-object="object:gallery:keepsake-copy">{tr("Setiap perayaan dimulai dari hal kecil yang ingin disimpan lebih lama.")}</p>
        </div>
      </article>

      <article data-studio-native-object="object:gallery:note-group" className="pcb-collage pcb-collage-note">
        <div className="pcb-collage-copy">
          <span aria-hidden className="pcb-collage-index">02</span>
          <h3 data-studio-native-object="object:gallery:note-title">{tr("Catatan Kecil")}</h3>
          <p data-studio-native-object="object:gallery:note-copy">{tr("Nama, doa, dan waktu berkumpul seperti potongan kertas yang akhirnya menemukan tempat.")}</p>
        </div>
        <PaperCutBotanicalArt objectKey="object:gallery:polaroid-art" asset="polaroid" className="pcb-collage-art pcb-polaroid-art" />
      </article>

      <article data-studio-native-object="object:gallery:journey-group" className="pcb-collage pcb-collage-journey">
        <PaperCutBotanicalArt objectKey="object:gallery:balloon-art" asset="balloon" className="pcb-balloon-art" />
        <div className="pcb-collage-copy">
          <span aria-hidden className="pcb-collage-index">03</span>
          <h3 data-studio-native-object="object:gallery:journey-title">{tr("Ruang untuk Tumbuh")}</h3>
          <p data-studio-native-object="object:gallery:journey-copy">{tr("Yang kami rayakan bukan kesempurnaan, melainkan cerita yang terus bertumbuh.")}</p>
        </div>
      </article>
    </div>
  );
}
