/*
  Warnings:

  - The `action` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Action" AS ENUM ('LIKE', 'OVER_TAKE');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "action",
ADD COLUMN     "action" "Action" NOT NULL DEFAULT 'OVER_TAKE';

-- CreateIndex
CREATE UNIQUE INDEX "Notification_visitor_id_visited_id_mapId_action_key" ON "Notification"("visitor_id", "visited_id", "mapId", "action");
