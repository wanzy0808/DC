-- Optional parent identity for wedding invitations.
ALTER TABLE "Invitation"
ADD COLUMN "groomFatherName" TEXT,
ADD COLUMN "groomMotherName" TEXT,
ADD COLUMN "brideFatherName" TEXT,
ADD COLUMN "brideMotherName" TEXT;
