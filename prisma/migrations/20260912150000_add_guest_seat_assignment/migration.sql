ALTER TABLE "Guest" ADD COLUMN "seatNumber" INTEGER;

CREATE UNIQUE INDEX "Guest_tableId_seatNumber_key" ON "Guest"("tableId", "seatNumber");
