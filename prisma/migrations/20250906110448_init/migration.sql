-- CreateEnum
CREATE TYPE "public"."main_word_display" AS ENUM ('KANA_ROMA_UPPERCASE', 'KANA_ROMA_LOWERCASE', 'ROMA_KANA_UPPERCASE', 'ROMA_KANA_LOWERCASE');

-- AlterTable
ALTER TABLE "public"."user_typing_options" ADD COLUMN     "main_word_display" "public"."main_word_display" NOT NULL DEFAULT 'KANA_ROMA_UPPERCASE';

-- CreateTable
CREATE TABLE "public"."ime_results" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "map_id" INTEGER NOT NULL,
    "type_count" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ime_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ime_results" ADD CONSTRAINT "ime_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_results" ADD CONSTRAINT "ime_results_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
