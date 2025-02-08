/*
  Warnings:

  - You are about to drop the column `int_type_total_count` on the `user_stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "result_statuses" ADD COLUMN     "space_type" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_stats" DROP COLUMN "int_type_total_count",
ADD COLUMN     "num_type_total_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "space_type_total_count" INTEGER NOT NULL DEFAULT 0;
