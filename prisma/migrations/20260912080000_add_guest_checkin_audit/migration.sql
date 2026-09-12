ALTER TABLE "Guest"
  ADD COLUMN "checkedInAt" TIMESTAMP(3),
  ADD COLUMN "checkedInById" TEXT;

CREATE INDEX "Guest_checkedInById_idx" ON "Guest"("checkedInById");

ALTER TABLE "Guest"
  ADD CONSTRAINT "Guest_checkedInById_fkey"
  FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
