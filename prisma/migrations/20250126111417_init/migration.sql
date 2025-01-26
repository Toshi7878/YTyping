/*
  Warnings:

  - You are about to drop the column `kana_kpm_max` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the column `kana_kpm_median` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the column `kana_total_notes` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the column `roma_kpm_max` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the column `roma_kpm_median` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the column `roma_total_notes` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the column `total_time` on the `maps` table. All the data in the column will be lost.
  - You are about to drop the `user_option` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "maps" DROP COLUMN "kana_kpm_max",
DROP COLUMN "kana_kpm_median",
DROP COLUMN "kana_total_notes",
DROP COLUMN "roma_kpm_max",
DROP COLUMN "roma_kpm_median",
DROP COLUMN "roma_total_notes",
DROP COLUMN "total_time";

-- DropTable
DROP TABLE "user_option";

-- CreateTable
CREATE TABLE "user_options" (
    "user_id" INTEGER NOT NULL,
    "map_like_notify" BOOLEAN NOT NULL DEFAULT true,
    "over_take_notify" INTEGER NOT NULL DEFAULT 5
);

-- CreateTable
CREATE TABLE "map_difficulties" (
    "map_id" INTEGER NOT NULL,
    "roma_kpm_median" INTEGER NOT NULL DEFAULT 0,
    "roma_kpm_max" INTEGER NOT NULL DEFAULT 0,
    "kana_kpm_median" INTEGER NOT NULL DEFAULT 0,
    "kana_kpm_max" INTEGER NOT NULL DEFAULT 0,
    "total_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roma_total_notes" INTEGER NOT NULL DEFAULT 0,
    "kana_total_notes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "map_difficulties_pkey" PRIMARY KEY ("map_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_options_user_id_key" ON "user_options"("user_id");

-- AddForeignKey
ALTER TABLE "user_options" ADD CONSTRAINT "user_options_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_difficulties" ADD CONSTRAINT "map_difficulties_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
