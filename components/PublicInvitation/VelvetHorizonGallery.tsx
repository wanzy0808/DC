"use client";

import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";
import { VelvetHorizonArt } from "@/components/PublicInvitation/VelvetHorizonArtwork";

type GalleryPhoto = { id: string; url: string };

export default function VelvetHorizonGallery({
  photos,
  preview,
  onEdit,
}: {
  photos: GalleryPhoto[];
  preview?: boolean;
  onEdit?: () => void;
}) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);

  return (
    <div className="vh-gallery">
      {preview && onEdit && (
        <button type="button" onClick={onEdit} className="vh-action vh-gallery-edit">
          {tr("Atur Foto Galeri")}
        </button>
      )}

      <VelvetHorizonArt objectKey="object:gallery:velvet-art" asset="garland" className="vh-gallery-garland" />

      {photos.length ? (
        <div data-studio-native-object="object:gallery:grid" className="vh-gallery-grid">
          {photos.map((asset, index) => (
            <figure
              key={asset.id}
              data-invitation-photo-slot="gallery"
              data-studio-photo-id={asset.id}
              className={`vh-gallery-card vh-gallery-card-${index + 1}`}
            >
              <img src={asset.url} alt={`${tr("Galeri foto")} ${index + 1}`} loading="lazy" />
              <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div data-studio-native-object="object:gallery:memory-panel" className="vh-gallery-empty">
          <VelvetHorizonArt objectKey="object:gallery:empty-arch-art" asset="arch" className="vh-gallery-empty-arch" />
          <p data-studio-native-object="object:gallery:empty-copy">{tr("Belum ada foto galeri.")}</p>
        </div>
      )}

      <p data-studio-native-object="object:gallery:memory-copy" className="vh-gallery-copy">
        {tr("Potongan senja, tawa kecil, dan cerita yang ingin selalu kami simpan.")}
      </p>
    </div>
  );
}
