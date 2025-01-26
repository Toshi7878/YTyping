-- AlterTable
ALTER TABLE "map_difficulties" ADD COLUMN     "english_total_notes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "int_total_notes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "symbol_total_notes" INTEGER NOT NULL DEFAULT 0;
