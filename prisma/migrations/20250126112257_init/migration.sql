/*
  Warnings:

  - You are about to drop the column `rank` on the `result_statuses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "result_statuses" DROP COLUMN "rank";

-- AlterTable
ALTER TABLE "results" ADD COLUMN     "rank" INTEGER NOT NULL DEFAULT 1;
