-- AlterTable
ALTER TABLE "user_typing_options" ADD COLUMN     "kana_word_scroll" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "roma_word_scroll" INTEGER NOT NULL DEFAULT 16;
