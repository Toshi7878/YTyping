-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "englishType" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numType" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "symbolType" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserTypingStats" ADD COLUMN     "englishTypeTotalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "flickTypeTotalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intTypeTotalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "symbolTypeTotalCount" INTEGER NOT NULL DEFAULT 0;
