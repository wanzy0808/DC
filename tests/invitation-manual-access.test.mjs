import assert from "node:assert/strict";
import test from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import { slugifyEvent } from "../lib/invitations/slug.ts";
import { hasPaidDigitalInvitation } from "../lib/packages/access.ts";
import { parsePrivateInvitationAssetKey, privateInvitationAssetUrl } from "../lib/storage/private-media.ts";
import { loadPackageAccess, loadSource } from "./helpers/package-access.mjs";

const published = (overrides = {}) => ({
  id: "invitation-a", ownerId: "owner-a", slug: "acara-keluarga", title: "Acara Keluarga",
  eventConfigured: true, templateKey: "confetti-club", isPublished: true, passwordProtected: false,
  payment: null, ...overrides,
});
const paid = { packageKey: "INVITATION_BASIC", status: "PAID" };
const manual = () => ({ "owner-a": { digital: true, guestbook: false } });

function redirectHandler({ invitation = published(), grants, grantError } = {}) {
  const packageAccess = loadPackageAccess({ grants, grantError });
  const calls = { queries: [], errors: [] };
  const route = loadSource("app/q/[invitationId]/route.ts", {
    "next/server": { NextResponse: { redirect: (url, { status }) => new Response(null, { status, headers: { Location: url.toString() } }) } },
    "@/lib/prisma": { prisma: { invitation: { findUnique: async (query) => {
      calls.queries.push(query);
      return invitation?.id === query.where.id ? invitation : null;
    } } } },
    "@/lib/packages/server-access": packageAccess.access,
  }, { env: { INVITATION_ROOT_DOMAIN: "invite.example.test" }, errors: calls.errors });
  return { calls, grantQueries: packageAccess.queries, get: (id = "invitation-a") => route.GET(
    new Request(`https://undara.example.test/q/${encodeURIComponent(id)}`),
    { params: Promise.resolve({ invitationId: id }) },
  ) };
}

test("share QR redirects paid and manually granted published invitations using their actual owner", async (t) => {
  for (const options of [{ invitation: published({ payment: paid }) }, { grants: manual() }]) {
    await t.test(options.grants ? "manual grant" : "paid event", async () => {
      const handler = redirectHandler(options);
      const response = await handler.get();
      assert.equal(response.status, 302);
      assert.equal(response.headers.get("location"), "https://acara-keluarga.invite.example.test/");
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(handler.calls.queries[0].select.ownerId, true);
      assert.deepEqual(handler.grantQueries.map((query) => query.where.entityId), options.grants ? ["owner-a"] : []);
    });
  }
});

test("share QR resolves changed slugs without changing its ID and observes grant revocation", async () => {
  const invitation = published();
  const grants = manual();
  const handler = redirectHandler({ invitation, grants });
  assert.equal((await handler.get()).status, 302);
  invitation.slug = "ulang-tahun-baru";
  assert.equal((await handler.get()).headers.get("location"), "https://ulang-tahun-baru.invite.example.test/");
  grants["owner-a"] = { digital: false, guestbook: false };
  const revoked = await handler.get();
  assert.equal(revoked.status, 404);
  assert.equal(revoked.headers.get("cache-control"), "no-store");
  invitation.payment = paid;
  assert.equal((await handler.get()).status, 302);
});

test("manual access does not bypass public QR publication, configuration, template or owner entitlement", async (t) => {
  const cases = [
    { name: "draft", invitation: published({ isPublished: false }), grants: manual() },
    { name: "unconfigured", invitation: published({ eventConfigured: false }), grants: manual() },
    { name: "no template", invitation: published({ templateKey: " " }), grants: manual() },
    { name: "missing", invitation: null, grants: manual() },
    { name: "no grant or payment" },
    { name: "grant belongs to another account", grants: { "owner-b": { digital: true } } },
    { name: "pending payment", invitation: published({ payment: { ...paid, status: "PENDING" } }) },
    { name: "unrelated paid package", invitation: published({ payment: { packageKey: "WA_BLAST", status: "PAID" } }) },
  ];
  for (const entry of cases) {
    await t.test(entry.name, async () => {
      const handler = redirectHandler(entry);
      const response = await handler.get();
      assert.equal(response.status, 404);
      assert.equal(response.headers.get("location"), null);
      assert.equal(response.headers.get("cache-control"), "no-store");
    });
  }
  const invalid = redirectHandler({ grants: manual() });
  assert.equal((await invalid.get("../invitation-a")).status, 404);
  assert.equal(invalid.calls.queries.length, 0);
});

test("public QR fails closed with a generic uncached response if manual rights cannot be read", async () => {
  const handler = redirectHandler({ grantError: new Error("private grant lookup") });
  const response = await handler.get();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(await response.text(), "Undangan belum dapat dibuka.");
  assert.equal(handler.calls.errors.length, 1);
});

function Locked() {}
function Renderer() {}
function PasswordGate() {}
function PersonalPasswordGate() {}

function publicPage(path, { invitation = published(), grants, access = false, guestPublished = true } = {}) {
  const packageAccess = loadPackageAccess({ grants });
  const views = [];
  const passwords = [];
  const guest = { id: "guest-a", name: "Tamu", personalPublished: guestPublished, personalToken: "personal-token", personalPasswordProtected: invitation?.passwordProtected, personalLanguage: "ID" };
  const route = loadSource(path, {
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": { notFound() { throw new Error("NOT_FOUND"); } },
    "@/lib/prisma": { prisma: {
      invitation: {
        findUnique: async (query) => query.select ? { id: "base-invitation", ownerId: "owner-a" } : invitation,
        findMany: async (query) => invitation && invitation.ownerId === query.where.ownerId && invitation.eventConfigured ? [invitation] : [],
        update: async (query) => views.push(query),
      },
      guest: { findFirst: async (query) => query.where.invitationId === invitation?.id && query.where.personalToken === guest.personalToken ? guest : null, update: async (query) => views.push(query) },
    } },
    "@/lib/packages/server-access": packageAccess.access,
    "@/lib/invitations/password": { hasInvitationAccess: async (key) => { passwords.push(key); return access; } },
    "@/lib/invitations/slug": { slugifyEvent },
    "@/components/PublicInvitation/PublicInvitation": { InvitationLockedState: Locked },
    "@/components/PublicInvitation/PublicInvitationRenderer": { default: Renderer, __esModule: true },
    "@/components/PublicInvitation/InvitationPasswordGate": { default: PasswordGate, __esModule: true },
    "@/components/PublicInvitation/PersonalInvitationPasswordGate": { default: PersonalPasswordGate, __esModule: true },
  });
  return { views, passwords, grantQueries: packageAccess.queries, render: () => route.default({ params: Promise.resolve({ slug: "acara-keluarga", eventSlug: "acara-keluarga", token: "personal-token" }) }) };
}

function containsRenderer(element) {
  if (!element) return false;
  if (Array.isArray(element)) return element.some(containsRenderer);
  return element.type === Renderer || containsRenderer(element.props?.children);
}

test("all public invitation URL variants render manual grants and retain publication/password gates", async (t) => {
  for (const path of ["app/invite/[slug]/page.tsx", "app/invite/[slug]/[eventSlug]/page.tsx", "app/invite/[slug]/p/[token]/page.tsx"]) {
    await t.test(path, async () => {
      for (const options of [{ grants: manual() }, { invitation: published({ payment: paid }) }]) {
        const page = publicPage(path, options);
        assert.equal(containsRenderer(await page.render()), true);
        assert.equal(page.views.length, 1);
        assert.ok(page.grantQueries.every((query) => query.where.entityId === "owner-a"));
      }
      for (const options of [{}, { grants: { "owner-b": { digital: true } } }, { invitation: published({ isPublished: false }), grants: manual() }]) {
        const page = publicPage(path, options);
        assert.equal((await page.render()).type, Locked);
        assert.equal(page.views.length, 0);
      }
      const protectedPage = publicPage(path, { invitation: published({ passwordProtected: true }), grants: manual() });
      assert.equal((await protectedPage.render()).type, path.includes("/p/") ? PersonalPasswordGate : PasswordGate);
      assert.equal(protectedPage.views.length, 0);
      const unlocked = publicPage(path, { invitation: published({ passwordProtected: true }), grants: manual(), access: true });
      assert.equal(containsRenderer(await unlocked.render()), true);
      if (path.includes("/p/")) {
        const guestDraft = publicPage(path, { grants: manual(), guestPublished: false });
        assert.equal((await guestDraft.render()).type, Locked);
        assert.equal(guestDraft.views.length, 0);
      }
    });
  }
});

function mediaHandler({ invitation = published(), grants, user = null, access = false } = {}) {
  const packageAccess = loadPackageAccess({ grants });
  const reads = [];
  const assetKey = "customer-photo.webp";
  const route = loadSource("app/api/media/invitation-assets/[assetKey]/route.ts", {
    "node:fs/promises": { readFile: async (path) => { reads.push(path); return Buffer.from("webp fixture"); } },
    "next/server": { NextResponse: Response },
    "@/lib/auth": { getCurrentUser: async () => user },
    "@/lib/invitations/password": { hasInvitationAccess: async () => access },
    "@/lib/packages/server-access": packageAccess.access,
    "@/lib/packages/access": { hasPaidDigitalInvitation },
    "@/lib/prisma": { prisma: {
      invitationAsset: { findUnique: async () => ({ id: "customer-photo", invitationId: invitation.id, ownerId: invitation.ownerId, type: "IMAGE", url: privateInvitationAssetUrl(assetKey), invitation }) },
      guest: { findFirst: async () => null },
    } },
    "@/lib/storage/private-media": { parsePrivateInvitationAssetKey, privateInvitationAssetUrl, privateInvitationAssetPath: (id, key) => `/fixture/${id}/${key}` },
  });
  return { reads, get: () => route.GET(new Request(`https://undara.example.test/api/media/invitation-assets/${assetKey}`), { params: Promise.resolve({ assetKey }) }) };
}

test("published manual-grant media loads without bypassing owner, draft or password restrictions", async (t) => {
  const granted = mediaHandler({ grants: manual() });
  const response = await granted.get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(granted.reads, ["/fixture/invitation-a/customer-photo.webp"]);
  for (const options of [{}, { grants: { "owner-b": { digital: true } } }, { invitation: published({ isPublished: false }), grants: manual() }, { invitation: published({ passwordProtected: true }), grants: manual() }]) {
    await t.test(JSON.stringify(options), async () => {
      const media = mediaHandler(options);
      assert.equal((await media.get()).status, 404);
      assert.equal(media.reads.length, 0);
    });
  }
  const paidMedia = mediaHandler({ invitation: published({ payment: paid }) });
  assert.equal((await paidMedia.get()).headers.get("cache-control"), "public, max-age=31536000, immutable");
  const ownerDraft = mediaHandler({ invitation: published({ isPublished: false }), user: { id: "owner-a" } });
  assert.equal((await ownerDraft.get()).status, 200);
});
