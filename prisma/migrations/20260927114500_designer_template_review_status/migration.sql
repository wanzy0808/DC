-- Add a review gate between editable drafts and public catalog publication.
ALTER TYPE "TemplateStatus" ADD VALUE IF NOT EXISTS 'REVIEW';

ALTER TABLE "DesignerTemplate" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
