ALTER TABLE "Invitation"
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  ADD COLUMN "address" TEXT,
  ADD COLUMN "mapUrl" TEXT;
