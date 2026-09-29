import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { invitationText, localizedEditableCopy, localizedWeddingParentLine } from "../lib/invitations/language.ts";
import { parseEnglishEditableCopy, withEditableCopy, withEnglishEditableCopy } from "../lib/templates/editable-copy.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("English translates built-in content and dates while preserving customer copy", () => {
  assert.equal(invitationText("EN", "Buka Undangan"), "Open Invitation");
  assert.equal(invitationText("ID", "The Wedding Of"), "Pernikahan");
  assert.equal(localizedEditableCopy("romantic-rose", "romantic-rose", null, "EN").greeting, "With great joy, we share this happy news with you.");
  const custom = withEditableCopy("romantic-rose", { greeting: "Cerita pribadi kami." });
  assert.equal(localizedEditableCopy(custom, "romantic-rose", null, "EN").greeting, "Cerita pribadi kami.");
  const bilingual = withEnglishEditableCopy(custom, { greeting: "Our personal story." });
  assert.equal(parseEnglishEditableCopy(bilingual).greeting, "Our personal story.");
  assert.equal(localizedEditableCopy(bilingual, "romantic-rose", null, "EN").greeting, "Our personal story.");
  assert.equal(localizedEditableCopy(bilingual, "romantic-rose", null, "ID").greeting, "Cerita pribadi kami.");
  assert.equal(localizedWeddingParentLine("EN", "chandra", "juni", 2, "putra", "NUMBER"), "2nd Son of Mr Chandra & Mrs Juni");
});

test("Studio canvas and published invitation offer a language switch; private links start at guest language", () => {
  const studio = read("components/InvitationStudio/InvitationDesigner.tsx");
  const stage = read("components/InvitationStudio/StudioStageControls.tsx");
  const published = read("components/PublicInvitation/PublicInvitationRenderer.tsx");
  const content = read("components/InvitationStudio/DesignerPanels.tsx");
  assert.match(studio, /<StudioStageControls[\s\S]*onInvitationLanguage=\{setInvitationLanguage\}/);
  assert.match(stage, /undara-studio-language-toggle/);
  assert.match(published, /personalGuest\?\.personalLanguage === "EN" \? "EN" : "ID"/);
  assert.match(published, /<InvitationLanguageProvider language=\{language\}>/);
  assert.match(content, /englishNarrativeCopy\[field\]/);
});
