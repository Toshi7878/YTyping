/*
  Warnings:

  - The `nextDisplay` column on the `TypingOption` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "NextDisplay" AS ENUM ('LYRICS', 'WORD');

-- AlterTable
ALTER TABLE "TypingOption" DROP COLUMN "nextDisplay",
ADD COLUMN     "nextDisplay" "NextDisplay" NOT NULL DEFAULT 'LYRICS';
