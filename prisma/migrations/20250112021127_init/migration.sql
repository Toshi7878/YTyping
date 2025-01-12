/*
  Warnings:

  - The `toggleInputModeKey` column on the `TypingOption` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ToggleInputModeKey" AS ENUM ('ALT_KANA', 'TAB', 'NONE');

-- AlterTable
ALTER TABLE "TypingOption" DROP COLUMN "toggleInputModeKey",
ADD COLUMN     "toggleInputModeKey" "ToggleInputModeKey" NOT NULL DEFAULT 'ALT_KANA';
