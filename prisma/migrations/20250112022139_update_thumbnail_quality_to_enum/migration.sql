/*
  Warnings:

  - The `thumbnailQuality` column on the `Map` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ThumbnailQuality" AS ENUM ('mqdefault', 'maxresdefault');

-- 既存のデータを新しいenumタイプにキャスト
ALTER TABLE "Map" ALTER COLUMN "thumbnailQuality" DROP DEFAULT;

ALTER TABLE "Map"
  ALTER COLUMN "thumbnailQuality" TYPE "ThumbnailQuality"
  USING ("thumbnailQuality"::text::"ThumbnailQuality");

  ALTER TABLE "Map"
ALTER COLUMN "thumbnailQuality" SET DEFAULT 'mqdefault'::"ThumbnailQuality";