ALTER TABLE "Invitation"
ADD COLUMN "waBlastQuota" INTEGER NOT NULL DEFAULT 100;

ALTER TABLE "Guest"
ADD COLUMN "waBlastSelected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "waBlastSentAt" TIMESTAMP(3),
ADD COLUMN "personalToken" TEXT,
ADD COLUMN "personalPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "personalPasswordProtected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "personalPasswordHash" TEXT,
ADD COLUMN "personalViewCount" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "Guest_personalToken_key" ON "Guest"("personalToken");
CREATE INDEX "Guest_invitationId_waBlastSelected_idx" ON "Guest"("invitationId", "waBlastSelected");
CREATE INDEX "Guest_invitationId_personalPublished_idx" ON "Guest"("invitationId", "personalPublished");