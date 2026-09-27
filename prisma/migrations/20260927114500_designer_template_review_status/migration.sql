-- Add a review gate between editable drafts and public catalog publication.
ALTER TYPE "TemplateStatus" ADD VALUE IF NOT EXISTS 'REVIEW';
