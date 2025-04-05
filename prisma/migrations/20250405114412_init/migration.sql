-- AlterTable
ALTER TABLE "user_typing_options" ADD COLUMN     "kana_word_top_position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roma_word_top_position" INTEGER NOT NULL DEFAULT 0;
