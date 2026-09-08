-- CreateEnum
CREATE TYPE "InvitationAssetType" AS ENUM ('IMAGE', 'AUDIO');

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "brideName" TEXT NOT NULL DEFAULT 'Lyvia',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "groomName" TEXT NOT NULL DEFAULT 'Rio',
ADD COLUMN     "musicUrl" TEXT,
ADD COLUMN     "venue" TEXT NOT NULL DEFAULT 'Gedung Pernikahan';

-- CreateTable
CREATE TABLE "InvitationAsset" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "type" "InvitationAssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "InvitationAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvitationAsset_invitationId_type_idx" ON "InvitationAsset"("invitationId", "type");

-- CreateIndex
CREATE INDEX "InvitationAsset_ownerId_idx" ON "InvitationAsset"("ownerId");

-- AddForeignKey
ALTER TABLE "InvitationAsset" ADD CONSTRAINT "InvitationAsset_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationAsset" ADD CONSTRAINT "InvitationAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
