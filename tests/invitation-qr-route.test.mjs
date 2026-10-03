import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import QRCode from "qrcode";
import { invitationQrTarget } from "../lib/invitations/qr.ts";
import { loadPackageAccess } from "./helpers/package-access.mjs";

const source = readFileSync(new URL("../app/api/invitations/qr/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

// Exercise the real handler with authentication/database boundaries replaced;
// the PNG encoder and entitlement/target helpers remain the production code.
function loadHandler({ user = { id: "owner-a" }, invitation, appUrl = "https://undara.example.test/base", render = QRCode.toBuffer, grants, grantError } = {}) {
  const record = invitation === undefined
    ? { id: "invitation-a", ownerId: "owner-a", payment: { packageKey: "INVITATION_BASIC", status: "PAID" } }
    : invitation;
  const calls = { queries: [], renders: [], fetches: [], errors: [] };
  const packageAccess = loadPackageAccess({ grants, grantError });
  calls.grantQueries = packageAccess.queries;
  const modules = {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    qrcode: { toBuffer: (...args) => { calls.renders.push(structuredClone(args)); return render(...args); } },
    "@/lib/auth": { getCurrentUser: async () => user },
    "@/lib/prisma": { prisma: { invitation: { findFirst: async (query) => {
      calls.queries.push(query);
      return record?.id === query.where.id && record?.ownerId === query.where.ownerId ? record : null;
    } } } },
    "@/lib/invitations/qr": { invitationQrTarget },
    "@/lib/packages/server-access": packageAccess.access,
  };
  const routeModule = { exports: {} };
  const run = new Function("require", "exports", "module", "process", "console", "fetch", compiled);
  run((id) => {
    assert.ok(Object.hasOwn(modules, id), `Unexpected route dependency: ${id}`);
    return modules[id];
  }, routeModule.exports, routeModule, { env: { APP_URL: appUrl } }, {
    error: (...args) => calls.errors.push(args),
  }, (...args) => {
    calls.fetches.push(args);
    throw new Error("QR generation must not call an external renderer");
  });
  return { GET: routeModule.exports.GET, calls };
}

test("invitation QR rejects unauthenticated, malformed, missing, other-owner and unpaid requests before rendering", async (t) => {
  const cases = [
    { name: "unauthenticated", options: { user: null }, status: 401 },
    { name: "malformed ID", id: "../another", status: 400 },
    { name: "missing invitation", options: { invitation: null }, status: 404 },
    { name: "different owner", options: { user: { id: "owner-b" } }, status: 404 },
    { name: "different owner with a manual grant", options: { user: { id: "owner-b" }, grants: { "owner-b": { digital: true } } }, status: 404 },
    { name: "unpaid", payment: { packageKey: "INVITATION_BASIC", status: "PENDING" }, status: 402 },
    { name: "no payment", payment: null, status: 402 },
    { name: "wrong package", payment: { packageKey: "WA_BLAST", status: "PAID" }, status: 402 },
  ];
  for (const entry of cases) {
    await t.test(entry.name, async () => {
      const options = entry.payment !== undefined
        ? { invitation: { id: "invitation-a", ownerId: "owner-a", payment: entry.payment } }
        : entry.options;
      const { GET, calls } = loadHandler(options);
      const response = await GET(new Request(`https://undara.example.test/api/invitations/qr?invitationId=${encodeURIComponent(entry.id ?? "invitation-a")}`));
      assert.equal(response.status, entry.status);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal(typeof (await response.json()).error, "string");
      assert.equal(calls.renders.length, 0);
      assert.equal(calls.fetches.length, 0);
    });
  }
});

test("paid owner gets a real 640px PNG for the stable app URL without a provider request", async (t) => {
  for (const download of [false, true]) {
    await t.test(download ? "download" : "preview", async () => {
      const { GET, calls } = loadHandler();
      const response = await GET(new Request(`https://request.example.test/api/invitations/qr?invitationId=invitation-a${download ? "&download=1" : ""}`));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "image/png");
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(response.headers.get("content-disposition"), `${download ? "attachment" : "inline"}; filename="undara-undangan-invitation-a-qr.png"`);
      const png = Buffer.from(await response.arrayBuffer());
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(png.readUInt32BE(16), 640);
      assert.equal(png.readUInt32BE(20), 640);
      assert.equal(Number(response.headers.get("content-length")), png.byteLength);
      assert.deepEqual(calls.queries[0].where, { id: "invitation-a", ownerId: "owner-a" });
      assert.deepEqual(calls.renders, [["https://undara.example.test/q/invitation-a", {
        type: "png", width: 640, margin: 4, errorCorrectionLevel: "M",
      }]]);
      assert.equal(calls.fetches.length, 0);
      assert.equal(calls.errors.length, 0);
    });
  }
});

test("Owner-granted Digital Invitation and Guestbook access allow preview and download without payment", async (t) => {
  for (const metadata of [{ digital: true, guestbook: false }, { digital: false, guestbook: true }]) {
    for (const download of [false, true]) {
      await t.test(`${metadata.guestbook ? "Guestbook" : "Digital"} ${download ? "download" : "preview"}`, async () => {
        const { GET, calls } = loadHandler({
          invitation: { id: "invitation-a", ownerId: "owner-a", payment: null },
          grants: { "owner-a": metadata },
        });
        const response = await GET(new Request(`https://undara.example.test/api/invitations/qr?invitationId=invitation-a${download ? "&download=1" : ""}`));
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "private, no-store");
        assert.equal(response.headers.get("content-type"), "image/png");
        assert.ok(response.headers.get("content-disposition").startsWith(download ? "attachment;" : "inline;"));
        const png = Buffer.from(await response.arrayBuffer());
        assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
        assert.equal(calls.renders[0][0], "https://undara.example.test/q/invitation-a");
        assert.deepEqual(calls.grantQueries[0], {
          where: { action: "OWNER_PACKAGE_ACCESS_UPDATED", entity: "User", entityId: "owner-a" },
          select: { metadata: true }, orderBy: { createdAt: "desc" },
        });
        assert.equal(calls.fetches.length, 0);
      });
    }
  }
});

test("revoking a manual grant blocks the next QR request while leaving a paid event accessible", async () => {
  const grants = { "owner-a": { digital: true } };
  const { GET, calls } = loadHandler({ invitation: { id: "invitation-a", ownerId: "owner-a", payment: null }, grants });
  const request = () => new Request("https://undara.example.test/api/invitations/qr?invitationId=invitation-a");
  assert.equal((await GET(request())).status, 200);
  grants["owner-a"] = { digital: false, guestbook: false };
  assert.equal((await GET(request())).status, 402);
  assert.equal(calls.renders.length, 1);
  const paid = loadHandler({ grants });
  assert.equal((await paid.GET(request())).status, 200);
  assert.equal(paid.calls.grantQueries.length, 0);
});

test("another account's grant and malformed manual access do not authorize an unpaid invitation", async (t) => {
  for (const grants of [{ "owner-b": { digital: true } }, { "owner-a": { digital: "true", guestbook: false } }]) {
    await t.test(JSON.stringify(grants), async () => {
      const { GET, calls } = loadHandler({ invitation: { id: "invitation-a", ownerId: "owner-a", payment: null }, grants });
      const response = await GET(new Request("https://undara.example.test/api/invitations/qr?invitationId=invitation-a"));
      assert.equal(response.status, 402);
      assert.equal(calls.renders.length, 0);
    });
  }
});

test("grant lookup failures return a private generic error before rendering", async () => {
  const { GET, calls } = loadHandler({ invitation: { id: "invitation-a", ownerId: "owner-a", payment: null }, grantError: new Error("private audit failure") });
  const response = await GET(new Request("https://undara.example.test/api/invitations/qr?invitationId=invitation-a"));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), { error: "QR belum dapat dibuat. Coba lagi." });
  assert.equal(calls.renders.length, 0);
});

test("local invitation QR falls back to the request origin when APP_URL is blank", async () => {
  const { GET, calls } = loadHandler({ appUrl: "  " });
  const response = await GET(new Request("http://localhost:3000/api/invitations/qr?invitationId=invitation-a"));
  assert.equal(response.status, 200);
  assert.equal(calls.renders[0][0], "http://localhost:3000/q/invitation-a");
});

test("QR encoder failure returns a private generic error without exposing details", async () => {
  const { GET, calls } = loadHandler({ render: async () => { throw new Error("private encoder detail"); } });
  const response = await GET(new Request("https://undara.example.test/api/invitations/qr?invitationId=invitation-a"));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), { error: "QR belum dapat dibuat. Coba lagi." });
  assert.equal(calls.errors.length, 1);
  assert.equal(calls.fetches.length, 0);
});
