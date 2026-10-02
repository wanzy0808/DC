import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const repo = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, repo), "utf8");

test("guest workspace requires an explicit owned event instead of silently falling back", () => {
  const source = read("app/api/guests/route.ts");
  assert.match(source, /if \(!invitationId\) return null/);
  assert.match(source, /where: \{ id: invitationId, ownerId: userId \}/);
  assert.match(source, /Acara wajib dipilih/);
  assert.doesNotMatch(source, /orderBy: \{ createdAt: "asc" \}/);
  assert.match(source, /isTrustedMutationOrigin\(request\)/);
});

test("guest export is scoped to the requested owned invitation", () => {
  const source = read("app/api/guests/export/route.ts");
  assert.match(source, /searchParams\.get\("invitationId"\)/);
  assert.match(source, /where: \{ id: invitationId, ownerId: user\.id \}/);
  assert.match(source, /where: \{ invitationId: invitation\.id \}/);
  assert.doesNotMatch(source, /findFirst\(\{ where: \{ ownerId: user\.id \}/);
});

test("legacy wedding-table mutations derive access from the target event or table", () => {
  const source = read("app/api/wedding-tables/route.ts");
  assert.match(source, /where: \{ id: invitationId, ownerId: userId \}/);
  assert.match(source, /where: \{ id: tableId, invitation: \{ ownerId: userId \} \}/);
  assert.match(source, /where: \{ id: current\.id, invitationId: current\.invitationId \}/);
  assert.doesNotMatch(source, /where: \{ ownerId: userId, type: "WEDDING" \}/);
  assert.match(source, /isTrustedMutationOrigin\(request\)/);
});

test("finance role cannot enter broad admin operations", () => {
  const source = read("app/api/admin/operations/route.ts");
  assert.match(source, /\["OWNER", "ADMIN"\]\.includes\(user\.role\)/);
  assert.doesNotMatch(source, /\["ADMIN", "FINANCE"\]\.includes\(user\.role\)/);
  assert.match(source, /Akses Owner\/Admin diperlukan/);
});
