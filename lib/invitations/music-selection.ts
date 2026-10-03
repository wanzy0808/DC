import { PRIVATE_INVITATION_MEDIA_PREFIX } from "@/lib/storage/private-media";

type MusicAssetScope = {
  invitationId: string;
  ownerId: string;
  type: "AUDIO";
  url: string;
};

export class MissingMusicAssetError extends Error {
  constructor() {
    super("Musik sudah dihapus atau tidak tersedia untuk acara ini. Pilih lagu yang tersedia, lalu simpan lagi.");
  }
}

/** Call under the Invitation row lock shared with upload/delete. */
export async function assertInvitationMusicAsset(
  musicUrl: string | null,
  invitationId: string,
  ownerId: string,
  findAsset: (scope: MusicAssetScope) => Promise<unknown>,
) {
  if (!musicUrl || !(
    musicUrl.startsWith(PRIVATE_INVITATION_MEDIA_PREFIX)
    || musicUrl.startsWith("/uploads/music/")
  )) return;

  const asset = await findAsset({ invitationId, ownerId, type: "AUDIO", url: musicUrl });
  if (!asset) throw new MissingMusicAssetError();
}
