ALTER TABLE "Invitation"
ADD COLUMN "groomChildOrder" INTEGER,
ADD COLUMN "brideChildOrder" INTEGER;

ALTER TABLE "Invitation"
ADD CONSTRAINT "Invitation_groomChildOrder_positive" CHECK ("groomChildOrder" IS NULL OR "groomChildOrder" > 0),
ADD CONSTRAINT "Invitation_brideChildOrder_positive" CHECK ("brideChildOrder" IS NULL OR "brideChildOrder" > 0);
