/*
  Warnings:

  - A unique constraint covering the columns `[createdAt]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_createdAt_key" ON "Notification"("createdAt");
