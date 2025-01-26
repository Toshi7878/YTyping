/*
  Warnings:

  - You are about to drop the column `clearRate` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSpeed` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `englishType` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `flickType` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `kanaType` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `kpm` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `lost` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `maxCombo` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `miss` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `numType` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `rkpm` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `romaKpm` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `romaType` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `symbolType` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Result" DROP COLUMN "clearRate",
DROP COLUMN "defaultSpeed",
DROP COLUMN "englishType",
DROP COLUMN "flickType",
DROP COLUMN "kanaType",
DROP COLUMN "kpm",
DROP COLUMN "lost",
DROP COLUMN "maxCombo",
DROP COLUMN "miss",
DROP COLUMN "numType",
DROP COLUMN "rank",
DROP COLUMN "rkpm",
DROP COLUMN "romaKpm",
DROP COLUMN "romaType",
DROP COLUMN "score",
DROP COLUMN "symbolType";

-- CreateTable
CREATE TABLE "ResultStats" (
    "resultId" INTEGER NOT NULL,
    "defaultSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 0,
    "kpm" INTEGER NOT NULL DEFAULT 0,
    "rkpm" INTEGER NOT NULL DEFAULT 0,
    "romaKpm" INTEGER NOT NULL DEFAULT 0,
    "romaType" INTEGER NOT NULL DEFAULT 0,
    "kanaType" INTEGER NOT NULL DEFAULT 0,
    "flickType" INTEGER NOT NULL DEFAULT 0,
    "englishType" INTEGER NOT NULL DEFAULT 0,
    "symbolType" INTEGER NOT NULL DEFAULT 0,
    "numType" INTEGER NOT NULL DEFAULT 0,
    "miss" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "maxCombo" INTEGER NOT NULL DEFAULT 0,
    "clearRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE UNIQUE INDEX "ResultStats_resultId_key" ON "ResultStats"("resultId");
