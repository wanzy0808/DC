"use client";

import { MidnightRomanceArt } from "@/components/PublicInvitation/MidnightRomanceArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

type GalleryPhoto = { id: string; url: string };

export default function MidnightRomanceGallery({ photos, preview, onEdit }: { photos: GalleryPhoto[]; preview?: boolean; onEdit?: () => void }) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  return <div className="mr-gallery">
    {preview && onEdit && <button type="button" onClick={onEdit} className="mr-action mr-gallery-edit">{tr("Atur Foto Galeri")}</button>}
    <MidnightRomanceArt objectKey="object:gallery:garland-art" asset="garland" className="mr-gallery-garland" />
    {photos.length ? <div data-studio-native-object="object:gallery:grid" className="mr-gallery-grid">
      {photos.map((asset, index) => <figure key={asset.id} data-invitation-photo-slot="gallery" data-studio-photo-id={asset.id} className={`mr-gallery-photo mr-gallery-photo-${index + 1}`}>
        <img src={asset.url} alt={`${tr("Galeri foto")} ${index + 1}`} loading="lazy" />
      </figure>)}
    </div> : <div data-studio-native-object="object:gallery:memory-panel" className="mr-gallery-empty">
      <MidnightRomanceArt objectKey="object:gallery:chaise-art" asset="chaise" className="mr-gallery-empty-art" />
      <p data-studio-native-object="object:gallery:empty-copy">{tr("Belum ada foto galeri.")}</p>
    </div>}
    {photos.length > 0 && <MidnightRomanceArt objectKey="object:gallery:mirror-art" asset="mirror" className="mr-gallery-mirror" />}
    <p data-studio-native-object="object:gallery:memory-copy" className="mr-gallery-copy">{tr("Beberapa malam terlalu indah untuk dibiarkan berlalu tanpa dikenang.")}</p>
  </div>;
}
