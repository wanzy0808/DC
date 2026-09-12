ALTER TABLE "Invitation"
ADD COLUMN "passwordProtected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "passwordHash" TEXT;
