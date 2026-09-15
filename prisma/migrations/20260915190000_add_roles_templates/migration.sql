ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DESIGNER';

CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "AccountActionToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountActionToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DesignerTemplate" (
  "id" TEXT NOT NULL,
  "templateNo" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "previewUrl" TEXT NOT NULL,
  "templateFile" TEXT NOT NULL,
  "status" "TemplateStatus" NOT NULL DEFAULT 'PUBLISHED',
  "designerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DesignerTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccountActionToken_tokenHash_key" ON "AccountActionToken"("tokenHash");
CREATE INDEX "AccountActionToken_userId_action_idx" ON "AccountActionToken"("userId", "action");
CREATE UNIQUE INDEX "DesignerTemplate_templateNo_key" ON "DesignerTemplate"("templateNo");
CREATE INDEX "DesignerTemplate_designerId_createdAt_idx" ON "DesignerTemplate"("designerId", "createdAt");
CREATE INDEX "DesignerTemplate_status_createdAt_idx" ON "DesignerTemplate"("status", "createdAt");

ALTER TABLE "AccountActionToken" ADD CONSTRAINT "AccountActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DesignerTemplate" ADD CONSTRAINT "DesignerTemplate_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
