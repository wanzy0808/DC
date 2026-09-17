ALTER TABLE "Guest" ADD COLUMN "category" TEXT;
ALTER TABLE "Guest" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE INDEX "Guest_invitationId_category_idx" ON "Guest"("invitationId", "category");
