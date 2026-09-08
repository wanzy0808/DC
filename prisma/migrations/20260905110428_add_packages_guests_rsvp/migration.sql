-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('PENDING', 'ATTENDING', 'NOT_ATTENDING', 'TENTATIVE');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "packageKey" TEXT NOT NULL DEFAULT 'INVITATION_BASIC';

-- CreateTable
CREATE TABLE "WeddingTable" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shape" TEXT NOT NULL DEFAULT 'ROUND',
    "capacity" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "tableId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "rsvpStatus" "RsvpStatus" NOT NULL DEFAULT 'PENDING',
    "plusOnes" INTEGER NOT NULL DEFAULT 0,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeddingTable_invitationId_idx" ON "WeddingTable"("invitationId");

-- CreateIndex
CREATE INDEX "Guest_invitationId_rsvpStatus_idx" ON "Guest"("invitationId", "rsvpStatus");

-- CreateIndex
CREATE INDEX "Guest_tableId_idx" ON "Guest"("tableId");

-- AddForeignKey
ALTER TABLE "WeddingTable" ADD CONSTRAINT "WeddingTable_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "WeddingTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
