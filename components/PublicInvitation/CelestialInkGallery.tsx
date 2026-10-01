"use client";

import { CelestialInkArt } from "@/components/PublicInvitation/CelestialInkArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";

export default function CelestialInkGallery() {
  const language = useInvitationLanguage();
  const copy = language === "EN"
    ? [
        ["A Quiet Toast", "A small ritual before the celebration begins."],
        ["The Night's Rhythm", "Music lingers between every arrival and every smile."],
        ["A Last Reflection", "What remains is the glow of the people we love."],
      ]
    : [
        ["Sebuah Jamuan", "Ritual kecil sebelum perayaan benar-benar dimulai."],
        ["Irama Malam", "Musik tinggal di antara setiap kedatangan dan setiap senyum."],
        ["Pantulan Terakhir", "Yang tersisa adalah cahaya dari orang-orang yang kita sayangi."],
      ];

  return (
    <div className="ci-gallery" data-studio-native-object="object:gallery:programme">
      <article data-studio-native-object="object:gallery:toast-group" className="ci-gallery-card ci-gallery-toast">
        <CelestialInkArt objectKey="object:gallery:tea-art" asset="tea" className="ci-gallery-art ci-gallery-tea" />
        <span aria-hidden="true" className="ci-gallery-index">I</span>
        <h3>{copy[0][0]}</h3>
        <p>{copy[0][1]}</p>
      </article>

      <article data-studio-native-object="object:gallery:rhythm-group" className="ci-gallery-card ci-gallery-rhythm">
        <CelestialInkArt objectKey="object:gallery:gramophone-art" asset="gramophone" className="ci-gallery-art ci-gallery-gramophone" />
        <span aria-hidden="true" className="ci-gallery-index">II</span>
        <h3>{copy[1][0]}</h3>
        <p>{copy[1][1]}</p>
      </article>

      <article data-studio-native-object="object:gallery:reflection-group" className="ci-gallery-card ci-gallery-reflection">
        <CelestialInkArt objectKey="object:gallery:mirror-art" asset="mirror" className="ci-gallery-art ci-gallery-mirror" />
        <span aria-hidden="true" className="ci-gallery-index">III</span>
        <h3>{copy[2][0]}</h3>
        <p>{copy[2][1]}</p>
      </article>
    </div>
  );
}
