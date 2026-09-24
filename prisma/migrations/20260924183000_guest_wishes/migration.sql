-- Event-owned messages are separate from the canonical Guest (RSVP / recipient) records.
-- A visitor may write a wish without creating an RSVP or altering attendance.
CREATE TABLE "GuestWish" (
  "id" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "authorName" VARCHAR(80) NOT NULL,
  "message" VARCHAR(600) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuestWish_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GuestWish_invitationId_createdAt_idx"
  ON "GuestWish"("invitationId", "createdAt");

ALTER TABLE "GuestWish" ADD CONSTRAINT "GuestWish_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
