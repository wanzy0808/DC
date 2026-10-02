import { mkdir } from "node:fs/promises";
import path from "node:path";

export type PrivateInvitationAssetKind = "IMAGE" | "AUDIO";

export const PRIVATE_INVITATION_MEDIA_PREFIX = "/api/media/invitation-assets/";

const SAFE_IDENTIFIER = /^[A-Za-z0-9_-]{8,128}$/;
const PRIVATE_ASSET_KEY = /^([A-Za-z0-9_-]{8,128})\.(webp|mp3|wav|ogg|aac|m4a|mp4)$/i;

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".aac": "audio/aac",
  ".m4a": "audio/mp4",
  ".mp4": "audio/mp4",
};

const AUDIO_EXTENSION_BY_MIME: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/aac": ".aac",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
};

function assertSafeIdentifier(value: string, label: string) {
  if (!SAFE_IDENTIFIER.test(value)) {
    throw new Error(`Invalid ${label} for private media storage.`);
  }
}

export function getUndaraDataRoot() {
  const configured = process.env.UNDARA_DATA_DIR?.trim();

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNDARA_DATA_DIR must be configured in production.");
    }
    return path.join(process.cwd(), ".undara-data");
  }

  if (process.env.NODE_ENV === "production" && !path.isAbsolute(configured)) {
    throw new Error("UNDARA_DATA_DIR must be an absolute path in production.");
  }

  return path.resolve(configured);
}

export function buildPrivateInvitationAssetKey(
  assetId: string,
  kind: PrivateInvitationAssetKind,
  mimeType: string,
) {
  assertSafeIdentifier(assetId, "asset id");

  if (kind === "IMAGE") {
    return `${assetId}.webp`;
  }

  const extension = AUDIO_EXTENSION_BY_MIME[mimeType];
  if (!extension) {
    throw new Error("Unsupported audio type for private media storage.");
  }
  return `${assetId}${extension}`;
}

export function parsePrivateInvitationAssetKey(assetKey: string) {
  const match = PRIVATE_ASSET_KEY.exec(assetKey);
  if (!match) return null;

  const extension = `.${match[2].toLowerCase()}`;
  return {
    assetId: match[1],
    extension,
    contentType: CONTENT_TYPE_BY_EXTENSION[extension],
  };
}

export function privateInvitationAssetUrl(assetKey: string) {
  if (!parsePrivateInvitationAssetKey(assetKey)) {
    throw new Error("Invalid private invitation asset key.");
  }
  return `${PRIVATE_INVITATION_MEDIA_PREFIX}${assetKey}`;
}

export function parsePrivateInvitationAssetUrl(url: string) {
  if (!url.startsWith(PRIVATE_INVITATION_MEDIA_PREFIX)) return null;
  const assetKey = url.slice(PRIVATE_INVITATION_MEDIA_PREFIX.length);
  return parsePrivateInvitationAssetKey(assetKey) ? assetKey : null;
}

export function replaceStoredMediaUrlReferences(
  value: string,
  currentUrl: string,
  nextUrl: string,
) {
  if (!value || !currentUrl || currentUrl === nextUrl) return value;

  return value
    .replaceAll(currentUrl, nextUrl)
    .replaceAll(encodeURIComponent(currentUrl), encodeURIComponent(nextUrl));
}

export function privateInvitationAssetPath(invitationId: string, assetKey: string) {
  assertSafeIdentifier(invitationId, "invitation id");
  if (!parsePrivateInvitationAssetKey(assetKey)) {
    throw new Error("Invalid private invitation asset key.");
  }

  return path.join(
    getUndaraDataRoot(),
    "invitation-assets",
    invitationId,
    assetKey,
  );
}

export async function ensurePrivateInvitationAssetDirectory(
  invitationId: string,
  assetKey: string,
) {
  const filePath = privateInvitationAssetPath(invitationId, assetKey);
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  return filePath;
}
