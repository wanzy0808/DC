-- Personal Invitation envelope preferences stay on the canonical Guest row.
ALTER TABLE "Guest"
  ADD COLUMN "personalEnvelopeEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "personalLanguage" TEXT NOT NULL DEFAULT 'ID';

ALTER TABLE "Guest" ADD CONSTRAINT "Guest_personalLanguage_check"
  CHECK ("personalLanguage" IN ('ID', 'EN'));
