import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const repo = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, repo), "utf8");

test("custom template jobs are explicitly bound to one customer invitation", () => {
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20261002103500_custom_template_invitation_access/migration.sql");
  const ownerRoute = read("app/api/owner/custom-templates/route.ts");

  assert.match(schema, /customInvitationId\s+String\?/);
  assert.match(schema, /customInvitation\s+Invitation\?/);
  assert.match(schema, /CustomInvitationEvent/);
  assert.match(schema, /@@index\(\[customInvitationId, status\]\)/);
  assert.match(migration, /FOREIGN KEY \("customInvitationId"\) REFERENCES "Invitation"\("id"\)/);
  assert.match(ownerRoute, /action === "CREATE_REQUEST"/);
  assert.match(ownerRoute, /customInvitationId: invitation\.id/);
  assert.match(ownerRoute, /status: \{ in: \["DRAFT", "REVIEW"\] \}/);
  assert.match(ownerRoute, /FOR UPDATE/);
});

test("customer media access is limited to the assigned active custom job", () => {
  const media = read("app/api/media/invitation-assets/[assetKey]/route.ts");

  assert.match(media, /user\.role === "OWNER" \|\| user\.role === "ADMIN" \|\| user\.role === "DESIGNER"/);
  assert.match(media, /customInvitationId: asset\.invitationId/);
  assert.match(media, /status: \{ in: \["DRAFT", "REVIEW"\] \}/);
  assert.match(media, /user\.role === "DESIGNER" \? \{ designerId: user\.id \} : \{\}/);
  assert.match(media, /authenticatedPrivateAccess = ownerAccess \|\| customStaffAccess/);
  assert.doesNotMatch(media, /user\.role === "DESIGNER"\)\s*return true/);
});

test("Template Studio uses customer event data for custom jobs without copying uploads into Designer library", () => {
  const route = read("app/api/designer/templates/route.ts");
  const designer = read("components/InvitationStudio/InvitationDesigner.tsx");

  assert.match(route, /customInvitation: \{ select: studioInvitationSelect \}/);
  assert.match(route, /Custom request terikat ke satu event user dan tidak boleh dipublish ke katalog/);
  assert.match(designer, /const customInvitation = savedDraft\?\.customInvitation \?\? null/);
  assert.match(designer, /customInvitation\?\.assets\.find/);
  assert.match(designer, /templateCustomInvitationId\s*\?\s*design/);
  assert.match(designer, /Foto tetap milik event user dan tidak disalin ke Library Designer/);
  assert.match(designer, /onUpload=\{templateMode \? undefined/);
});

test("handoff archives the custom job so staff media access stops automatically", () => {
  const ownerRoute = read("app/api/owner/custom-templates/route.ts");
  assert.match(ownerRoute, /data: \{ status: "ARCHIVED" \}/);
  assert.match(ownerRoute, /Akses media Designer otomatis ditutup/);
  assert.match(ownerRoute, /template\.customInvitationId && template\.customInvitationId !== invitationId/);
});

test("Owner UI creates the binding before Designer starts editing", () => {
  const owner = read("components/Owner/OwnerTemplateReview.tsx");
  const dashboard = read("components/Designer/DesignerDashboard.tsx");

  assert.match(owner, /action: "CREATE_REQUEST"/);
  assert.match(owner, /Buat & Beri Akses Custom/);
  assert.match(owner, /Dikerjakan oleh/);
  assert.match(dashboard, /Custom Studio · khusus event yang ditugaskan/);
  assert.match(dashboard, /akses data user ditutup/);
});
