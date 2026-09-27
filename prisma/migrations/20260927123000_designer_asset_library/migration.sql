CREATE TABLE "DesignerAsset" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DesignerAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DesignerAsset_ownerId_createdAt_idx" ON "DesignerAsset"("ownerId", "createdAt");

ALTER TABLE "DesignerAsset"
ADD CONSTRAINT "DesignerAsset_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
