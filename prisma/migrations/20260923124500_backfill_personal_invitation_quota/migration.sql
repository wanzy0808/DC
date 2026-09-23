-- Keep already-confirmed guests within their invitation allowance when upgrading.
-- The new default is one person; prior personalized RSVP records may already
-- have recorded companions in Guest.plusOnes.
UPDATE "Guest"
SET "invitedPax" = LEAST(30, GREATEST("invitedPax", "plusOnes" + 1))
WHERE "personalToken" IS NOT NULL
  AND "rsvpStatus" = 'ATTENDING'
  AND "plusOnes" > 0;
