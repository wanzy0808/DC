-- Add a general event taxonomy without removing legacy wedding fields.
ALTER TABLE "Invitation"
ADD COLUMN "eventCategory" TEXT NOT NULL DEFAULT 'OTHER';

-- Backfill categories only when existing data gives a reliable signal.
UPDATE "Invitation"
SET "eventCategory" = 'SILVER_WEDDING'
WHERE LOWER("title") LIKE '%silver wedding%';

UPDATE "Invitation"
SET "eventCategory" = 'GOLDEN_WEDDING'
WHERE LOWER("title") LIKE '%golden wedding%';

UPDATE "Invitation"
SET "eventCategory" = 'BIRTHDAY'
WHERE LOWER("title") LIKE '%ulang tahun%'
   OR LOWER("title") LIKE '%birthday%';

UPDATE "Invitation"
SET "eventCategory" = 'BABY_SHOWER'
WHERE LOWER("title") LIKE '%baby shower%';

UPDATE "Invitation"
SET "eventCategory" = 'WEDDING'
WHERE "eventCategory" = 'OTHER'
  AND (
    (TRIM("groomName") <> '' AND TRIM("brideName") <> '')
    OR LOWER("title") LIKE '%pernikahan%'
    OR LOWER("title") LIKE '%wedding%'
    OR LOWER("title") LIKE '%akad%'
    OR LOWER("title") LIKE '%sangjit%'
  );
