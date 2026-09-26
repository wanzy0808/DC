import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("Owner and Designer use the shared Studio in Template Mode", () => {
  const owner = read("app/owner/studio/page.tsx");
  const designer = read("app/designer/studio/page.tsx");
  const editorPage = read("components/InvitationStudio/InvitationEditorPage.tsx");
  const editor = read("components/InvitationStudio/InvitationDesigner.tsx");

  assert.match(owner, /<InvitationEditorPage mode="template" backHref="\/owner"/);
  assert.match(designer, /<InvitationEditorPage mode="template" backHref="\/designer"/);
  assert.match(editorPage, /mode\?: "invitation" \| "template"/);
  assert.match(editorPage, /<InvitationDesigner mode=\{mode\}/);
  assert.match(editor, /const templateMode = mode === "template"/);
  assert.match(editor, /templateDemoInvitation/);
});

test("staff Save creates a sellable catalog template while customer Save stays event-scoped", () => {
  const editor = read("components/InvitationStudio/InvitationDesigner.tsx");
  const templateApi = read("app/api/designer/templates/route.ts");
  const invitationApi = read("app/api/invitations/route.ts");
  const persistence = read("components/InvitationStudio/designer-persistence.ts");
  const toolbar = read("components/InvitationStudio/StudioCanvasToolbar.tsx");

  assert.match(editor, /if \(templateMode\)/);
  assert.match(editor, /createStudioTemplate\(/);
  assert.match(persistence, /fetcher\("\/api\/designer\/templates"/);
  assert.match(persistence, /method: "POST"/);
  assert.match(toolbar, /Simpan Template/);
  assert.match(editor, /saveStudioInvitation\(/);
  assert.match(persistence, /fetcher\("\/api\/invitations", \{[\s\S]*?method: "PUT"/);
  assert.match(templateApi, /\["OWNER", "DESIGNER", "EDITOR"\]\.includes\(user\.role\)/);
  assert.match(templateApi, /designKey,/);
  assert.match(templateApi, /status: "PUBLISHED"/);
  assert.doesNotMatch(templateApi, /prisma\.invitation\.update/);
  assert.match(invitationApi, /isPublished: wantsPublish \|\| current\.isPublished/);
});

test("Studio-authored templates are ready in the public catalog", () => {
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20260925152000_designer_template_studio_preset/migration.sql");
  const catalog = read("app/api/templates/route.ts");
  const card = read("components/Templates/TemplateGalleryCanvas.tsx");
  const panel = read("components/InvitationStudio/TemplatePanel.tsx");

  assert.match(schema, /designKey\s+String\?\s+@db\.Text/);
  assert.match(schema, /templateFile\s+String\?/);
  assert.match(migration, /ADD COLUMN "designKey" TEXT/);
  assert.match(catalog, /const ready = Boolean\(item\.designKey/);
  assert.match(catalog, /designKey: item\.designKey \?\? undefined/);
  assert.match(card, /designKey\?: string/);
  assert.match(panel, /designKey=\{item\.designKey\}/);
});

test("staff cannot accidentally use the customer invitation save route", () => {
  const customerRoute = read("app/dashboard/editor/page.tsx");
  const ownerDashboard = read("components/Owner/OwnerDashboard.tsx");
  const designerDashboard = read("components/Designer/DesignerDashboard.tsx");

  assert.match(customerRoute, /user\.role === "OWNER"\) redirect\("\/owner\/studio"\)/);
  assert.match(customerRoute, /user\.role === "DESIGNER" \|\| user\.role === "EDITOR"/);
  assert.match(ownerDashboard, /href="\/owner\/studio"/);
  assert.match(designerDashboard, /href="\/designer\/studio"/);
});
