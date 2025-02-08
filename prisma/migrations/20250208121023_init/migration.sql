/*
  Warnings:

  - You are about to drop the column `clap_count` on the `user_stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_stats" DROP COLUMN "clap_count",
ADD COLUMN     "receive_applaused_count" INTEGER NOT NULL DEFAULT 0;
