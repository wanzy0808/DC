-- Templates belong to an individual invitation; deleting the event removes its drafts.
CREATE TABLE "WaBlastTemplate" (
  "id" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WaBlastTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WaBlastTemplate_invitationId_category_idx" ON "WaBlastTemplate"("invitationId", "category");
ALTER TABLE "WaBlastTemplate"
ADD CONSTRAINT "WaBlastTemplate_invitationId_fkey"
FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
