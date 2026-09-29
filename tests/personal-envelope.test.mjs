import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formatPersonalEnvelopeAddress } from "../lib/guests/personal-envelope.ts";
import { parsePersonalGuestFields } from "../lib/guests/personal-profile.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("personal envelope formats Indonesian and English couple greetings with Title Case", () => {
  assert.equal(formatPersonalEnvelopeAddress({
    name: "andi & sari",
    recipientType: "COUPLE",
    personalEnvelopeEnabled: true,
    personalLanguage: "ID",
  }), "Kepada Yth : Bapak Andi dan Ibu Sari");

  assert.equal(formatPersonalEnvelopeAddress({
    name: "guest fallback",
    personalAddressee: "mr budi and mrs rina",
    recipientType: "COUPLE",
    personalEnvelopeEnabled: true,
    personalLanguage: "EN",
  }), "Dear : Mr Budi and Mrs Rina");

  assert.equal(formatPersonalEnvelopeAddress({
    name: "keluarga wijaya",
    recipientType: "FAMILY",
    personalEnvelopeEnabled: true,
    personalLanguage: "ID",
  }), "Kepada Yth : Keluarga Wijaya");

  assert.equal(formatPersonalEnvelopeAddress({
    name: "andi & sari",
    recipientType: "COUPLE",
    personalEnvelopeEnabled: false,
    personalLanguage: "ID",
  }), "");
});

test("personal invitation profile validates envelope toggle and language", () => {
  assert.deepEqual(parsePersonalGuestFields({
    personalEnvelopeEnabled: false,
    personalLanguage: "EN",
  }), {
    personalEnvelopeEnabled: false,
    personalLanguage: "EN",
  });
  assert.throws(() => parsePersonalGuestFields({ personalEnvelopeEnabled: "yes" }), /amplop/);
  assert.throws(() => parsePersonalGuestFields({ personalLanguage: "JP" }), /Bahasa amplop/);
});

test("dashboard and every ready envelope path receive the personal recipient line", () => {
  const fields = read("components/Dashboard/PersonalInvitationGuestFields.tsx");
  const publicPage = read("app/invite/[slug]/p/[token]/page.tsx");
  const previewPage = read("app/dashboard/personal-invitation/[guestId]/page.tsx");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const rose = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const scenes = read("components/PublicInvitation/InvitationThemeScenes.tsx");
  const pencil = read("components/PublicInvitation/PencilReverieScene.tsx");
  const zen = read("components/PublicInvitation/ZenAtelierScene.tsx");

  assert.match(fields, /personalEnvelopeEnabled/);
  assert.match(fields, /personalLanguage/);
  assert.match(fields, /Bahasa sapaan amplop/);
  assert.match(publicPage, /personalEnvelopeEnabled: guest\.personalEnvelopeEnabled/);
  assert.match(previewPage, /<PublicInvitationRenderer/);
  assert.match(universal, /formatPersonalEnvelopeAddress\(personalGuest\)/);
  assert.match(universal, /recipientLine=\{personalEnvelopeAddress\}/);
  assert.match(rose, /data-personal-envelope-address/);
  assert.match(scenes, /data-personal-envelope-address/);
  assert.match(pencil, /data-personal-envelope-address/);
  assert.match(zen, /data-personal-envelope-address/);
});
