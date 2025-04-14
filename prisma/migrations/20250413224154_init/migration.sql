/*
  Warnings:

  - You are about to drop the column `userId` on the `morph_convert_kana_dic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "morph_convert_kana_dic" DROP CONSTRAINT "morph_convert_kana_dic_userId_fkey";

-- AlterTable
ALTER TABLE "morph_convert_kana_dic" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "fix_word_edit_logs" (
    "lyrics" TEXT NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "fix_word_edit_logs_pkey" PRIMARY KEY ("lyrics")
);
