/*
  Warnings:

  - You are about to drop the column `active_user_state` on the `user_options` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "custom_user_active_state" AS ENUM ('ONLINE', 'ASK_ME', 'HIDE_ONLINE');

-- AlterTable
ALTER TABLE "user_options" DROP COLUMN "active_user_state",
ADD COLUMN     "custom_user_active_state" "custom_user_active_state" NOT NULL DEFAULT 'ONLINE';

-- DropEnum
DROP TYPE "active_user_state";
