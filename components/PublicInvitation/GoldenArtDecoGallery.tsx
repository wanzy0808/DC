"use client";

import { GoldenArtDecoArt } from "@/components/PublicInvitation/GoldenArtDecoArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

export default function GoldenArtDecoGallery() {
  const language = useInvitationLanguage();
  const tr = (value: string) => invitationText(language, value);

  return <div className="gd-gallery" aria-label={tr("Vignette Malam")}>
    <GoldenArtDecoArt objectKey="object:gallery:garland-art" asset="garland" className="gd-gallery-garland" />

    <article data-studio-native-object="object:gallery:toast-group" className="gd-vignette gd-vignette-toast">
      <div className="gd-vignette-copy">
        <span aria-hidden className="gd-vignette-index">01</span>
        <h3 data-studio-native-object="object:gallery:toast-title" className="gd-vignette-title">{tr("Sebuah Kilau")}</h3>
        <p data-studio-native-object="object:gallery:toast-copy" className="gd-vignette-text">{tr("Cahaya keemasan menjadi aksen, sementara cerita tetap menjadi pusat malam.")}</p>
      </div>
      <GoldenArtDecoArt objectKey="object:gallery:champagne-art" asset="champagne" className="gd-vignette-art gd-vignette-champagne" />
    </article>

    <article data-studio-native-object="object:gallery:rhythm-group" className="gd-vignette gd-vignette-rhythm">
      <GoldenArtDecoArt objectKey="object:gallery:gramophone-art" asset="gramophone" className="gd-vignette-art gd-vignette-gramophone" />
      <div className="gd-vignette-copy">
        <span aria-hidden className="gd-vignette-index">02</span>
        <h3 data-studio-native-object="object:gallery:rhythm-title" className="gd-vignette-title">{tr("Sebuah Irama")}</h3>
        <p data-studio-native-object="object:gallery:rhythm-copy" className="gd-vignette-text">{tr("Ritme, tawa, dan jeda kecil membentuk suasana yang ingin dikenang.")}</p>
      </div>
    </article>

    <article data-studio-native-object="object:gallery:reflection-group" className="gd-vignette gd-vignette-reflection">
      <GoldenArtDecoArt objectKey="object:gallery:mirror-art" asset="mirror" className="gd-vignette-mirror" />
      <div className="gd-vignette-reflection-copy">
        <span aria-hidden className="gd-vignette-index">03</span>
        <h3 data-studio-native-object="object:gallery:reflection-title" className="gd-vignette-title">{tr("Sebuah Pantulan")}</h3>
        <p data-studio-native-object="object:gallery:reflection-copy" className="gd-vignette-text">{tr("Yang paling berharga bukan dekorasinya, melainkan siapa yang hadir di dalam cerita.")}</p>
      </div>
    </article>
  </div>;
}
