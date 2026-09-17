-- DropIndex
DROP INDEX "Guest_checkedInById_idx";

-- DropIndex
DROP INDEX "Guest_invitationId_source_idx";

-- DropIndex
DROP INDEX "Guest_tableId_idx";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "templateKey" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "provider" SET DEFAULT 'manual';

-- CreateIndex
CREATE INDEX "Guest_invitationId_tableId_idx" ON "Guest"("invitationId", "tableId");
