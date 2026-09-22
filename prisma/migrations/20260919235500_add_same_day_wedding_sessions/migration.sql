-- Both wedding sessions share Invitation.eventDate and its event timezone.
-- The legacy ceremonyTime/receptionTime fields remain generic event start/end fields.
ALTER TABLE "Invitation"
 ADD COLUMN "weddingCeremonyEnabled" BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN "weddingReceptionEnabled" BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN "weddingCeremonyStart" TEXT,
 ADD COLUMN "weddingCeremonyEnd" TEXT,
 ADD COLUMN "weddingCeremonyVenue" TEXT,
 ADD COLUMN "weddingCeremonyAddress" TEXT,
 ADD COLUMN "weddingCeremonyMapUrl" TEXT,
 ADD COLUMN "weddingReceptionStart" TEXT,
 ADD COLUMN "weddingReceptionEnd" TEXT,
 ADD COLUMN "weddingReceptionVenue" TEXT,
 ADD COLUMN "weddingReceptionAddress" TEXT,
 ADD COLUMN "weddingReceptionMapUrl" TEXT;
ALTER TABLE "Guest" ADD COLUMN "weddingSessionAccess" TEXT;
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_weddingSessionAccess_check"
  CHECK ("weddingSessionAccess" IS NULL OR "weddingSessionAccess" IN ('CEREMONY', 'RECEPTION', 'BOTH'));
