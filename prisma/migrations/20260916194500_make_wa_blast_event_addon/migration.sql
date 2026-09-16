ALTER TABLE "Invitation"
ALTER COLUMN "waBlastQuota" SET DEFAULT 0;

-- Previous builds granted 100 free WA Blast credits. The new product model
-- makes WA Blast an explicit paid add-on, so existing invitations start at 0.
UPDATE "Invitation"
SET "waBlastQuota" = 0;
