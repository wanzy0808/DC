"use client";

import { GardenLightArt } from "@/components/PublicInvitation/GardenLightArtwork";
import { useInvitationLanguage } from "@/components/PublicInvitation/InvitationLanguage";
import { invitationText } from "@/lib/invitations/language";

type GalleryPhoto = { id: string; url: string };

export default function GardenLightGallery({ photos, preview, onEdit }: { photos: GalleryPhoto[]; preview?: boolean; onEdit?: () => void }) {
  const language = useInvitationLanguage();
  const tr = (text: string) => invitationText(language, text);
  return <div className="gl-gallery">
    {preview && onEdit && <button type="button" onClick={onEdit} className="gl-action gl-gallery-edit">{tr("Atur Foto Galeri")}</button>}
    <GardenLightArt objectKey="object:gallery:garland-art" asset="garland" className="gl-gallery-garland" />
    {photos.length ? <div data-studio-native-object="object:gallery:grid" className="gl-gallery-grid">
      {photos.map((asset, index) => <figure key={asset.id} data-invitation-photo-slot="gallery" data-studio-photo-id={asset.id} className={`gl-gallery-photo gl-gallery-photo-${index + 1}`}>
        <img src={asset.url} alt={`${tr("Galeri foto")} ${index + 1}`} loading="lazy" />
      </figure>)}
      <GardenLightArt objectKey="object:gallery:parasol-art" asset="parasol" className="gl-gallery-parasol" />
    </div> : <div data-studio-native-object="object:gallery:memory-panel" className="gl-gallery-empty">
      <GardenLightArt objectKey="object:gallery:swing-art" asset="swing" className="gl-gallery-empty-art" />
      <p data-studio-native-object="object:gallery:empty-copy">{tr("Belum ada foto galeri.")}</p>
    </div>}
    <p data-studio-native-object="object:gallery:memory-copy" className="gl-gallery-copy">{tr("Cahaya kecil, tawa panjang, dan kenangan yang ingin kami simpan.")}</p>
  </div>;
}
