import assert from "node:assert/strict";
import test from "node:test";
import { changeOwnerGrant, ownerAccessState } from "../components/Owner/owner-account-access.ts";

test("purchased rights stay active and locked while Owner grants remain separate", () => {
  const purchase = { purchasedDigital: true, purchasedGuestbook: false };
  const initial = ownerAccessState(purchase, { digital: false, guestbook: false });
  assert.deepEqual(initial, { digital: true, guestbook: false, digitalLocked: true, guestbookLocked: false });

  const granted = changeOwnerGrant({ digital: false, guestbook: false }, "guestbook", true);
  assert.deepEqual(granted, { digital: true, guestbook: true });
  assert.equal(ownerAccessState(purchase, granted).guestbook, true);
  assert.equal(ownerAccessState(purchase, granted).digitalLocked, true);
});

test("removing a manual Guest Book grant leaves its separately granted Digital right", () => {
  const grant = changeOwnerGrant({ digital: true, guestbook: true }, "guestbook", false);
  assert.deepEqual(grant, { digital: true, guestbook: false });
  assert.deepEqual(ownerAccessState({ purchasedDigital: false, purchasedGuestbook: false }, grant), {
    digital: true, guestbook: false, digitalLocked: false, guestbookLocked: false,
  });
});

test("purchased Guest Book cannot be removed through manual grant changes", () => {
  const access = ownerAccessState(
    { purchasedDigital: true, purchasedGuestbook: true },
    { digital: false, guestbook: false },
  );
  assert.equal(access.guestbook, true);
  assert.equal(access.guestbookLocked, true);
  assert.equal(access.digital, true);
});
