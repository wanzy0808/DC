import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  buildPrivateInvitationAssetKey,
  getUndaraDataRoot,
  parsePrivateInvitationAssetKey,
  parsePrivateInvitationAssetUrl,
  privateInvitationAssetPath,
  privateInvitationAssetUrl,
} from "../lib/storage/private-media.ts";

const repo = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, repo), "utf8");

test("private invitation media keys are opaque and preserve safe content types", () => {
  const imageKey = buildPrivateInvitationAssetKey(
    "12345678-1234-1234-1234-123456789abc",
    "IMAGE",
    "image/png",
  );
  const audioKey = buildPrivateInvitationAssetKey(
    "abcdef12-1234-1234-1234-123456789abc",
    "AUDIO",
    "audio/mpeg",
  );

  assert.equal(imageKey, "12345678-1234-1234-1234-123456789abc.webp");
  assert.equal(audioKey, "abcdef12-1234-1234-1234-123456789abc.mp3");
  assert.equal(parsePrivateInvitationAssetKey(imageKey)?.contentType, "image/webp");
  assert.equal(parsePrivateInvitationAssetKey(audioKey)?.contentType, "audio/mpeg");
  assert.equal(parsePrivateInvitationAssetKey("../secret.webp"), null);
});

test("private invitation media URLs route through authorization instead of public/uploads", () => {
  const key = "12345678-1234-1234-1234-123456789abc.webp";
  const url = privateInvitationAssetUrl(key);
  assert.equal(url, `/api/media/invitation-assets/${key}`);
  assert.equal(parsePrivateInvitationAssetUrl(url), key);
  assert.equal(parsePrivateInvitationAssetUrl("/uploads/images/event/photo.webp"), null);
});

test("development storage stays outside public and production requires an explicit persistent path", () => {
  const previousDataDir = process.env.UNDARA_DATA_DIR;
  const previousNodeEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = "test";
    delete process.env.UNDARA_DATA_DIR;
    assert.equal(getUndaraDataRoot(), path.join(process.cwd(), ".undara-data"));

    process.env.UNDARA_DATA_DIR = path.join(process.cwd(), "tmp-private-media");
    const filePath = privateInvitationAssetPath(
      "invitation_12345678",
      "12345678-1234-1234-1234-123456789abc.webp",
    );
    assert.ok(filePath.startsWith(path.resolve(process.env.UNDARA_DATA_DIR)));
    assert.equal(filePath.includes(`${path.sep}public${path.sep}`), false);

    process.env.NODE_ENV = "production";
    delete process.env.UNDARA_DATA_DIR;
    assert.throws(() => getUndaraDataRoot(), /UNDARA_DATA_DIR/);
  } finally {
    if (previousDataDir === undefined) delete process.env.UNDARA_DATA_DIR;
    else process.env.UNDARA_DATA_DIR = previousDataDir;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("upload and media routes enforce the private-storage boundary", () => {
  const upload = read("app/api/invitations/assets/upload/route.ts");
  const media = read("app/api/media/invitation-assets/[assetKey]/route.ts");
  const ignore = read(".gitignore");

  assert.doesNotMatch(upload, /process\.cwd\(\), "public", "uploads"/);
  assert.match(upload, /ensurePrivateInvitationAssetDirectory/);
  assert.match(upload, /privateInvitationAssetUrl/);
  assert.match(media, /user\.id === asset\.ownerId/);
  assert.match(media, /!invitation\.isPublished/);
  assert.match(media, /hasPaidDigitalInvitation/);
  assert.match(media, /hasInvitationAccess/);
  assert.match(media, /personalPublished: true/);
  assert.match(ignore, /\/\.undara-data\//);
  assert.match(ignore, /\/public\/uploads\//);
});
