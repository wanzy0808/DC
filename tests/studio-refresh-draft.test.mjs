import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  STUDIO_REFRESH_DRAFT_KEY, makeStudioRefreshDraft, recoverStudioRefreshDraft,
} from "../lib/templates/studio-refresh-draft.ts";

const baseline = JSON.stringify(["original-design", "original-music", "", ""]);
const state = JSON.stringify(["edited-design", "edited-music", "new hashtag", "formal"]);
const draft = JSON.stringify(makeStudioRefreshDraft("event-A", baseline, state));

test("unsaved Studio changes are recoverable only after reloading the same event and saved revision", () => {
  assert.ok(STUDIO_REFRESH_DRAFT_KEY.includes("studio"));
  assert.deepEqual(recoverStudioRefreshDraft(draft, "reload", "event-A", baseline),
    ["edited-design", "edited-music", "new hashtag", "formal"]);
  for (const navigationType of ["navigate", "back_forward", "prerender"]) {
    assert.equal(recoverStudioRefreshDraft(draft, navigationType, "event-A", baseline), null, navigationType);
  }
  assert.equal(recoverStudioRefreshDraft(draft, "reload", "event-B", baseline), null,
    "never move draft to another invitation");
  assert.equal(recoverStudioRefreshDraft(draft, "reload", "event-A",
    JSON.stringify(["server-edited-design", "", "", ""])), null,
    "never overwrite server edits saved elsewhere");
});

test("saved, invalid and oversized snapshots are not resurrected", () => {
  assert.equal(recoverStudioRefreshDraft(null, "reload", "event-A", baseline), null);
  assert.equal(recoverStudioRefreshDraft("{broken", "reload", "event-A", baseline), null);
  assert.equal(recoverStudioRefreshDraft(JSON.stringify(makeStudioRefreshDraft("event-A", baseline, baseline)),
    "reload", "event-A", baseline), null);
  assert.equal(recoverStudioRefreshDraft(JSON.stringify({
    version: 1, invitationId: "event-A", baseline, state: JSON.stringify(["one", 3, "", ""]),
  }), "reload", "event-A", baseline), null);
  assert.equal(recoverStudioRefreshDraft("x".repeat(120001), "reload", "event-A", baseline), null);
});

test("Studio keeps drafts only in tab sessionStorage and discards them on save or navigation", () => {
  const code = readFileSync(new URL("../components/InvitationStudio/InvitationDesigner.tsx", import.meta.url), "utf8");
  const persistence = readFileSync(new URL("../components/InvitationStudio/designer-persistence.ts", import.meta.url), "utf8");
  assert.match(code, /window\.sessionStorage\.setItem\(STUDIO_REFRESH_DRAFT_KEY/);
  assert.match(code, /recoverStudioRefreshDraft\(raw, sameStudioEntry \? navigationType : "navigate", next\.id, serverBaseline\)/);
  assert.match(code, /historyState\?\.__dcStudioDraftEntry === next\.id/);
  assert.match(code, /window\.history\.replaceState\(\{ \.\.\.historyState, __dcStudioDraftEntry: next\.id \}/);
  assert.match(code, /const serverBaseline = makeStudioServerRevision\(next\)/);
  assert.match(persistence, /return JSON\.stringify\(\[[\s\S]*invitation\.templateKey \|\| ""/);
  assert.match(code, /else window\.sessionStorage\.removeItem\(STUDIO_REFRESH_DRAFT_KEY\)/);
  assert.match(code, /setSavedState\(currentState\);\s*setServerRevision\(/);
  assert.match(code, /try \{ window\.sessionStorage\.removeItem\(STUDIO_REFRESH_DRAFT_KEY\); \} catch/);
  assert.match(code, /document\.addEventListener\("click", onLinkClick, true\)/);
  assert.match(code, /window\.addEventListener\("popstate", clearDraft\)/);
  assert.match(code, /window\.addEventListener\("pageshow", onPageShow\)/);
  assert.doesNotMatch(code, /window\.localStorage\.setItem\(STUDIO_REFRESH_DRAFT_KEY/);
});
