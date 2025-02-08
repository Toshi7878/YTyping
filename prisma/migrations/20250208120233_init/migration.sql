/*
  Warnings:

  - You are about to drop the `user_typing_stats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_typing_stats" DROP CONSTRAINT "user_typing_stats_user_id_fkey";

-- DropTable
DROP TABLE "user_typing_stats";

-- CreateTable
CREATE TABLE "user_stats" (
    "user_id" INTEGER NOT NULL,
    "total_ranking_count" INTEGER NOT NULL DEFAULT 0,
    "total_typing_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roma_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "kana_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "flick_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "english_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "symbol_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "int_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "total_play_count" INTEGER NOT NULL DEFAULT 0,
    "max_combo" INTEGER NOT NULL DEFAULT 0,
    "clap_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
