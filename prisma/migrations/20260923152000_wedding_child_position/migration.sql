-- Preserve existing groomChildOrder / brideChildOrder values for previously created weddings.
-- The new optional mode distinguishes youngest (not inferable from a numeric birth order)
-- from eldest and explicit numeric order, without sentinel integers.
ALTER TABLE "Invitation"
  ADD COLUMN "groomChildPosition" TEXT,
  ADD COLUMN "brideChildPosition" TEXT;

ALTER TABLE "Invitation"
  ADD CONSTRAINT "Invitation_groomChildPosition_check"
  CHECK ("groomChildPosition" IS NULL OR "groomChildPosition" IN ('ELDEST', 'YOUNGEST', 'NUMBER'));

ALTER TABLE "Invitation"
  ADD CONSTRAINT "Invitation_brideChildPosition_check"
  CHECK ("brideChildPosition" IS NULL OR "brideChildPosition" IN ('ELDEST', 'YOUNGEST', 'NUMBER'));
