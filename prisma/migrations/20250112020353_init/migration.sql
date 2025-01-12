/*
  Warnings:

  - The `timeOffsetKey` column on the `TypingOption` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TimeOffsetKey" AS ENUM ('CTRL_LEFT_RIGHT', 'CTRL_ALT_LEFT_RIGHT', 'NONE');

-- AlterTable
ALTER TABLE "TypingOption" DROP COLUMN "timeOffsetKey",
ADD COLUMN     "timeOffsetKey" "TimeOffsetKey" NOT NULL DEFAULT 'CTRL_LEFT_RIGHT';
