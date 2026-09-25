import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  invitationSectionStyleCss,
  parseInvitationSectionStyles,
  sanitizeInvitationSectionStyles,
  withInvitationSectionStyles,
} from "../lib/templates/section-styles.ts";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("section style overrides round-trip safely in the invitation design key", () => {
  const base = "romantic-rose::rose::cinzelFauna";
  const styles = {
    rsvp: { paddingY: 72, opacity: 0.8, align: "left", background: "#fff0f3" },
    wishes: { align: "center" },
  };
  const key = withInvitationSectionStyles(base, styles);
  assert.deepEqual(parseInvitationSectionStyles(key), styles);
  assert.equal(withInvitationSectionStyles(key, {}), base);
  assert.deepEqual(sanitizeInvitationSectionStyles({
    rsvp: { paddingY: 999, opacity: 0, align: "wat", background: "red" },
    unknown: { opacity: 0.5 },
  }), { rsvp: { paddingY: 160, opacity: 0.2 } });
});

test("section CSS helper only emits explicit visual overrides", () => {
  assert.deepEqual(invitationSectionStyleCss(), {});
  assert.deepEqual(invitationSectionStyleCss({
    paddingY: 48,
    opacity: 0.7,
    align: "right",
    background: "#112233",
  }), {
    paddingTop: 48,
    paddingBottom: 48,
    opacity: 0.7,
    textAlign: "right",
    backgroundColor: "#112233",
  });
});

test("Studio section selection opens a right-side inspector and renderers consume saved styles", () => {
  const editor = read("components/InvitationStudio/InvitationDesigner.tsx");
  const inspector = read("components/InvitationStudio/SectionInspector.tsx");
  const state = read("components/InvitationStudio/designer-state.ts");
  const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
  const romantic = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
  const css = read("components/InvitationStudio/studio.css");

  assert.match(editor, /selectedSectionKey/);
  assert.match(editor, /target\.closest<HTMLElement>\("\[data-invitation-section\]"\)/);
  assert.match(editor, /<SectionInspector/);
  assert.match(editor, /updateSectionStyle/);
  assert.match(editor, /resetSectionStyle/);
  assert.match(editor, /data\.studioSectionSelected = "true"/);
  assert.match(inspector, /Perataan/);
  assert.match(inspector, /Ruang vertikal/);
  assert.match(inspector, /Opasitas/);
  assert.match(inspector, /Warna latar section/);
  assert.match(inspector, /Fungsi terlindungi/);
  assert.match(state, /withInvitationSectionStyles/);
  assert.match(state, /parseInvitationSectionStyles/);
  assert.match(universal, /parseInvitationSectionStyles\(activeDesignKey\)/);
  assert.match(universal, /data-invitation-section="envelope"/);
  assert.match(universal, /data-invitation-section="cover"/);
  assert.match(romantic, /parseInvitationSectionStyles\(designKey \|\| invitation\.templateKey\)/);
  assert.match(css, /\.dc-studio-section-side \{[^}]*justify-self: end/);
  assert.match(css, /\[data-studio-section-selected="true"\]/);
});

test("functional section inspector stays visual-only and names protected functions", () => {
  const inspector = read("components/InvitationStudio/SectionInspector.tsx");
  assert.match(inspector, /rsvp: \["Nama tamu", "WhatsApp", "Status hadir", "Jumlah pendamping", "Submit RSVP"\]/);
  assert.match(inspector, /wishes: \["Nama tamu", "Ucapan", "Kirim ucapan"\]/);
  assert.match(inspector, /gift: \["Bank", "Nama rekening", "Nomor rekening", "Salin rekening"\]/);
  assert.doesNotMatch(inspector, /fetch\(|\/api\/invite|onSubmit/);
});
