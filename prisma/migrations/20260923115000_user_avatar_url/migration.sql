-- Profile photos are owned by accounts, not invitation/event assets.
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
