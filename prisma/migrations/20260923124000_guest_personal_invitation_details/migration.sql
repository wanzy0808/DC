-- Personal invitation properties live on the existing Guest record.
-- category (REGULAR/VIP/VVIP) and tags (guest groups) are already Guest fields.
-- invitedPax is the invitation limit, distinct from plusOnes (RSVP companions).
ALTER TABLE "Guest"
  ADD COLUMN "personalAddressee" TEXT,
  ADD COLUMN "recipientType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN "invitedPax" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "personalGreeting" TEXT,
  ADD COLUMN "personalSharedAt" TIMESTAMP(3);

ALTER TABLE "Guest" ADD CONSTRAINT "Guest_invitedPax_check"
  CHECK ("invitedPax" BETWEEN 1 AND 30);
