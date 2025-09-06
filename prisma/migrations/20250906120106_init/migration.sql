-- AlterTable
ALTER TABLE "public"."user_typing_options" ADD COLUMN     "kana_word_spacing" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "roma_word_spacing" DOUBLE PRECISION NOT NULL DEFAULT 0;
