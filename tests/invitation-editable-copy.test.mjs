import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  availableEditableCopyFields,
  invitationCopyDefaults,
  parseEditableCopy,
  resolveEditableCopy,
  withEditableCopy,
  sanitizeEditableCopy,
} from "../lib/templates/editable-copy.ts";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const studio = read("components/InvitationStudio/InvitationDesigner.tsx");
const panel = read("components/InvitationStudio/DesignerPanels.tsx");
const state = read("components/InvitationStudio/designer-state.ts");
const preview = read("components/InvitationStudio/InvitationPreview.tsx");
const universal = read("components/PublicInvitation/UniversalInvitationTemplate.tsx");
const romantic = read("components/PublicInvitation/RomanticRoseTemplate.tsx");
const selectionInspector = read("components/InvitationStudio/StudioSelectionInspector.tsx");
const selectionResolver = read("components/InvitationStudio/studio-canvas-selection.ts");
const persistence = read("components/InvitationStudio/designer-persistence.ts");

test("Isi keeps narrative slots in the renderer and edits them directly from canvas", () => {
  assert.deepEqual(availableEditableCopyFields("zen-atelier", true), ["greeting", "closing", "ourStory", "zenQuote"]);
  assert.deepEqual(availableEditableCopyFields("zen-atelier", false), ["greeting", "closing"]);
  assert.deepEqual(availableEditableCopyFields("romantic-rose"), ["greeting", "closing", "ourStory"]);
  assert.deepEqual(availableEditableCopyFields("botanical-ivory"), ["greeting", "closing", "ourStory"]);
  const content = panel.split("export function ContentPanel(")[1]?.split("export function ColorPanel(")[0] || "";
  assert.match(content, /<Heading title="Isi" description="" \/>/);
  assert.match(content, /sectionFunctionalElements/);
  assert.doesNotMatch(content, /<textarea/);
  assert.match(selectionResolver, /target\.closest<HTMLElement>\("\[data-studio-copy-field\]"\)/);
  assert.match(studio, /<StudioSelectionInspector/);
  assert.match(selectionInspector, /<CopyTextInspector/);
  assert.match(universal, /data-studio-copy-field="greeting"/);
  assert.match(universal, /data-studio-copy-field="closing"/);
});

test("copy overrides round-trip within the event-scoped design key without mutating event data", () => {
  const original = "zen-atelier::zen::cinzelFauna::sections=rsvp,wishes,gift";
  const text = {
    greeting: "Kami memohon doa dan kehadiran Anda.",
    closing: "Terima kasih atas restu yang diberikan.",
    zenQuote: "Langkah kita adalah sebuah cerita.",
    ourStory: "Kami berkenalan di perpustakaan.\\nBeberapa tahun kemudian, kami memutuskan menikah.",
    venue: "INJECTED: never an editable narrative slot",
  };
  const encoded = withEditableCopy(original, text);
  assert.match(encoded, /^zen-atelier::zen::cinzelFauna::sections=/);
  assert.equal(encoded.split("::").filter((part) => part.startsWith("copy=")).length, 1);
  assert.deepEqual(parseEditableCopy(encoded), {
    greeting: text.greeting, closing: text.closing, ourStory: text.ourStory, zenQuote: text.zenQuote,
  });
  assert.equal(withEditableCopy(encoded, { greeting: "Diganti." }).split("::").filter((part) => part.startsWith("copy=")).length, 1);
  assert.deepEqual(parseEditableCopy(original), {});
  assert.equal(withEditableCopy(encoded, {}), original);
  assert.deepEqual(sanitizeEditableCopy({ greeting: "x".repeat(361), closing: "  Berkah.  " }, "romantic-rose"), { closing: "Berkah." });
  assert.deepEqual(parseEditableCopy("romantic-rose::copy=%ZZ"), {});
  assert.equal(resolveEditableCopy(original, "zen-atelier", "Teks acara lama").greeting, "Teks acara lama");
  assert.equal(resolveEditableCopy(encoded, "zen-atelier", "Teks acara lama").greeting, text.greeting);
  assert.equal(invitationCopyDefaults("romantic-rose").closing, "Kehadiran dan doa baik Anda berarti bagi kami. Sampai bertemu di hari bahagia!");
});

test("Studio's live canvas, Undo/Redo, Save and public renderer share narrative copy, not event DB fields", () => {
  assert.match(state, /withEditableCopy\(/);
  assert.match(state, /copy: parseEditableCopy\(key\)/);
  assert.match(studio, /copy: \{\},/);
  assert.match(studio, /function setNarrativeCopy\(/);
  assert.match(studio, /change\(\{ copy: \{ \.\.\.design\.copy, \[field\]: text \} \}\)/);
  assert.match(selectionInspector, /<CopyTextInspector[\s\S]*onChange=\{\(value\) => onSetNarrativeCopy\(selectedCopyField, value\)\}/);
  assert.match(persistence, /templateKey: designKey,/);
  assert.match(studio, /setDesign\(invitationDesignStateFromKey\(key, design\.decor\)\)/);
  const customerSave = persistence.split('fetcher("/api/invitations", {')[1]?.split("const data = await response.json()")[0] || "";
  assert.doesNotMatch(customerSave, /description:\s*|eventNotes:\s*|groomName:\s*|brideName:\s*|venue:\s*|eventDate:\s*/);
  assert.match(preview, /<RomanticRoseTemplate invitation=\{previewInvitation\} designKey=\{designKey\}/);
  assert.match(universal, /resolveEditableCopy\(activeDesignKey, key, invitation\.description\)/);
  assert.match(universal, /text=\{editableCopy\.greeting \?\? ""\}/);
  assert.match(universal, /text=\{editableCopy\.closing \?\? ""\}/);
  assert.match(universal, /text=\{editableCopy\.zenQuote \?\? ""\}/);
  assert.match(romantic, /resolveEditableCopy\(designKey \|\| invitation\.templateKey, "romantic-rose", invitation\.description\)/);
  assert.match(romantic, /text=\{editableCopy\.greeting \?\? ""\}/);
  assert.match(romantic, /text=\{editableCopy\.closing \?\? ""\}/);
});

test("Our Story is optional couple-owned text shown in the real Identity flow, not a new global toggle", () => {
  const story = read("components/PublicInvitation/OurStorySection.tsx");
  const sectionRegistry = read("lib/templates/sections.ts");
  assert.ok(!sectionRegistry.includes('{ key: "ourStory"'), "do not invent a 16th invitation visibility toggle");
  assert.match(story, /if \(!story\?\.trim\(\) && !preview\) return null;/);
  assert.match(story, /data-invitation-section="our-story"/);
  assert.match(story, /data-studio-copy-field="ourStory"/);
  assert.match(story, /Klik untuk menulis Our Story/);
  assert.match(story, /Tentang Kami/);
  assert.match(universal, /<OurStorySection story=\{editableCopy\.ourStory\} theme=\{key\} preview=\{preview\} motionUnit=\{copyMotions\.ourStory\?\.unit\} \/>/);
  assert.match(romantic, /<OurStorySection story=\{editableCopy\.ourStory\} theme="romantic-rose" preview=\{preview\} motionUnit=\{copyMotions\.ourStory\?\.unit\} \/>/);
  assert.deepEqual(parseEditableCopy(withEditableCopy("romantic-rose", { ourStory: "Bermula dari pertemuan sederhana." })), {
    ourStory: "Bermula dari pertemuan sederhana.",
  });
  assert.deepEqual(parseEditableCopy(withEditableCopy("zen-atelier", { ourStory: "y".repeat(1601) })), {});
  assert.equal(withEditableCopy("zen-atelier", {}), "zen-atelier");
  assert.deepEqual(availableEditableCopyFields("modern-maroon", false), ["greeting", "closing"]);
});
