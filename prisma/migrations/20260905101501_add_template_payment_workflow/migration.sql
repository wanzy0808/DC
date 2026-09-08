-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "templateKey" TEXT NOT NULL DEFAULT 'eternal-blossom';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedById" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "proofUrl" TEXT,
ALTER COLUMN "amount" SET DEFAULT 0;
