/*
  Warnings:

  - The primary key for the `user_daily_type_counts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `user_daily_type_counts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_daily_type_counts" DROP CONSTRAINT "user_daily_type_counts_pkey",
DROP COLUMN "date",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "user_daily_type_counts_pkey" PRIMARY KEY ("user_id", "created_at");
