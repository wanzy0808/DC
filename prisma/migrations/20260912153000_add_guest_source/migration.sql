CREATE TYPE "GuestSource" AS ENUM ('RSVP', 'MANUAL');

ALTER TABLE "Guest" ADD COLUMN "source" "GuestSource" NOT NULL DEFAULT 'MANUAL';

CREATE INDEX "Guest_invitationId_source_idx" ON "Guest"("invitationId", "source");
