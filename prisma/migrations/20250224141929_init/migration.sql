-- CreateEnum
CREATE TYPE "line_completed_display" AS ENUM ('HIGH_LIGHT', 'NEXT_WORD');

-- AlterTable
ALTER TABLE "user_typing_options" ADD COLUMN     "line_completed_display" "line_completed_display" NOT NULL DEFAULT 'HIGH_LIGHT';
