import assert from "node:assert/strict";
import test from "node:test";
import { invitationTitleCase, isWeddingChildPosition, weddingParentLine } from "../lib/events/parents.ts";

test("existing numeric child order and parent names render in Title Case", () => {
  assert.equal(
    weddingParentLine("chandra", "juni", 2, "putra"),
    "Putra Kedua Dari Bapak Chandra & Ibu Juni",
  );
  assert.equal(
    weddingParentLine("AHMAD", "siti", 1, "putri"),
    "Putri Pertama Dari Bapak AHMAD & Ibu Siti",
  );
});

test("eldest and youngest wording does not depend on sibling count", () => {
  assert.equal(
    weddingParentLine("chandra", "juni", null, "putra", "ELDEST"),
    "Putra Sulung Dari Bapak Chandra & Ibu Juni",
  );
  assert.equal(
    weddingParentLine("chandra", "juni", null, "putra", "YOUNGEST"),
    "Putra Bungsu Dari Bapak Chandra & Ibu Juni",
  );
  assert.equal(
    weddingParentLine("chandra", "juni", null, "putri", "YOUNGEST"),
    "Putri Bungsu Dari Bapak Chandra & Ibu Juni",
  );
});

test("single parent, no parent, blank order and long order remain safe", () => {
  assert.equal(weddingParentLine("chandra", "", 2, "putra"), "Putra Kedua Dari Bapak Chandra");
  assert.equal(weddingParentLine(null, null, 3, "putra", "ELDEST"), "");
  assert.equal(weddingParentLine("chandra", "juni"), "Anak Dari Bapak Chandra & Ibu Juni");
  assert.equal(weddingParentLine("chandra", "juni", 11, "putri"), "Putri Ke-11 Dari Bapak Chandra & Ibu Juni");
});

test("formatting is display-only and child positions are constrained", () => {
  const name = "chandra";
  assert.equal(invitationTitleCase(name), "Chandra");
  assert.equal(name, "chandra");
  assert.equal(isWeddingChildPosition("ELDEST"), true);
  assert.equal(isWeddingChildPosition("YOUNGEST"), true);
  assert.equal(isWeddingChildPosition("NUMBER"), true);
  assert.equal(isWeddingChildPosition("MIDDLE"), false);
});
