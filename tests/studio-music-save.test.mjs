import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertInvitationMusicAsset, MissingMusicAssetError } from "../lib/invitations/music-selection.ts";
import { saveStudioInvitation } from "../components/InvitationStudio/designer-persistence.ts";

const owned = {
  invitationId: "event-a", ownerId: "customer-a", type: "AUDIO",
  url: "/api/media/invitation-assets/asset_12345678.mp3",
};
const lookup = (assets) => async (scope) => assets.find((asset) =>
  Object.entries(scope).every(([key, value]) => asset[key] === value),
) ?? null;
const validate = (url, assets) => assertInvitationMusicAsset(url, owned.invitationId, owned.ownerId, lookup(assets));

test("Studio can save its own private or legacy uploaded audio", async () => {
  await validate(owned.url, [owned]);
  const legacy = { ...owned, url: "/uploads/music/11111111-1111-1111-1111-111111111111.mp3" };
  await validate(legacy.url, [legacy]);
});

test("a stale Studio draft cannot restore audio removed after it was loaded", async () => {
  const assets = [owned];
  await validate(owned.url, assets);
  assets.pop();
  await assert.rejects(validate(owned.url, assets), MissingMusicAssetError);
  await assert.rejects(validate("/uploads/music/deleted.mp3", assets), MissingMusicAssetError);
});

test("music from another event of the same owner or another customer is rejected", async () => {
  await assert.rejects(validate(owned.url, [{ ...owned, invitationId: "event-b" }]), MissingMusicAssetError);
  await assert.rejects(validate(owned.url, [{ ...owned, ownerId: "customer-b" }]), MissingMusicAssetError);
});

test("private images and unavailable private URLs cannot be saved as music", async () => {
  const image = { ...owned, type: "IMAGE", url: "/api/media/invitation-assets/image_12345678.webp" };
  await assert.rejects(validate(image.url, [image]), MissingMusicAssetError);
  await assert.rejects(validate("/api/media/invitation-assets/missing.mp3", []), MissingMusicAssetError);
});

test("clearing music and shared or external legacy songs do not require a customer upload", async () => {
  for (const url of [null, "/assets/audio/white-petals.mp3", "https://example.org/old-song.mp3"]) {
    await assertInvitationMusicAsset(url, owned.invitationId, owned.ownerId, async () => {
      assert.fail("shared/default music must not consume or require an upload slot");
    });
  }
});

test("Studio surfaces a rejected music save and sends the current event and song", async () => {
  const message = new MissingMusicAssetError().message;
  await assert.rejects(saveStudioInvitation({ id: owned.invitationId }, "botanical-ivory", owned.url, "", "", async (url, init) => {
    assert.equal(url, "/api/invitations");
    assert.equal(init.method, "PUT");
    const body = JSON.parse(init.body);
    assert.equal(body.id, owned.invitationId);
    assert.equal(body.musicUrl, owned.url);
    return Response.json({ error: message }, { status: 409 });
  }), { message });
});

test("save validates uploaded music after acquiring the deletion lock and before updating", () => {
  const source = readFileSync(new URL("../app/api/invitations/route.ts", import.meta.url), "utf8");
  const put = source.split("export async function PUT")[1];
  const lock = put.indexOf("FOR UPDATE");
  const validation = put.indexOf("await assertInvitationMusicAsset");
  const update = put.indexOf("return tx.invitation.update");
  assert.ok(lock >= 0 && lock < validation && validation < update);
  assert.match(put, /tx\.invitationAsset\.findFirst\(\{ where \}\)/);
  assert.match(put, /error instanceof MissingMusicAssetError.*status: 409/);
});
