ALTER TABLE "DesignerTemplate"
ADD COLUMN "customInvitationId" TEXT;

CREATE INDEX "DesignerTemplate_customInvitationId_status_idx"
ON "DesignerTemplate"("customInvitationId", "status");

ALTER TABLE "DesignerTemplate"
ADD CONSTRAINT "DesignerTemplate_customInvitationId_fkey"
FOREIGN KEY ("customInvitationId") REFERENCES "Invitation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
