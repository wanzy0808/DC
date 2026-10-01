"use client";

import { ClassicPearlArt } from "@/components/PublicInvitation/ClassicPearlArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

export default function ClassicPearlGallery() {
  const language = useInvitationLanguage();
  const tr = (value: string) => invitationText(language, value);

  return <div className="cp-gallery" aria-label={tr("Galeri Kenangan")}>
    <ClassicPearlArt objectKey="object:gallery:garland-art" asset="garland" className="cp-gallery-garland" />

    <article data-studio-native-object="object:gallery:promise-group" className="cp-keepsake cp-keepsake-promise">
      <ClassicPearlArt objectKey="object:gallery:tiara-art" asset="tiara" className="cp-keepsake-art cp-keepsake-tiara" />
      <div className="cp-keepsake-copy-block">
        <h3 data-studio-native-object="object:gallery:promise-title" className="cp-keepsake-title">{tr("Yang tetap tinggal")}</h3>
        <p data-studio-native-object="object:gallery:promise-copy" className="cp-keepsake-copy">{tr("Bukan hanya tentang satu hari, tetapi tentang pilihan untuk terus berjalan bersama.")}</p>
      </div>
    </article>

    <article data-studio-native-object="object:gallery:memory-group" className="cp-keepsake cp-keepsake-memory">
      <div className="cp-keepsake-copy-block">
        <h3 data-studio-native-object="object:gallery:memory-title" className="cp-keepsake-title">{tr("Yang ingin dikenang")}</h3>
        <p data-studio-native-object="object:gallery:memory-copy" className="cp-keepsake-copy">{tr("Ada detail kecil yang suatu hari akan membawa kita kembali pada rasa hari ini.")}</p>
      </div>
      <ClassicPearlArt objectKey="object:gallery:perfume-art" asset="perfume" className="cp-keepsake-art cp-keepsake-perfume" />
    </article>

    <article data-studio-native-object="object:gallery:reflection-group" className="cp-keepsake cp-keepsake-reflection">
      <ClassicPearlArt objectKey="object:gallery:mirror-art" asset="mirror" className="cp-keepsake-art cp-keepsake-mirror" />
      <div className="cp-keepsake-copy-block cp-keepsake-reflection-copy">
        <h3 data-studio-native-object="object:gallery:reflection-title" className="cp-keepsake-title">{tr("Yang tumbuh bersama")}</h3>
        <p data-studio-native-object="object:gallery:reflection-copy" className="cp-keepsake-copy">{tr("Dua cerita tidak harus sama untuk dapat saling mencerminkan dan saling menjaga.")}</p>
      </div>
    </article>
  </div>;
}
