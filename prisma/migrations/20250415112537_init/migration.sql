-- CreateEnum
CREATE TYPE "morph_convert_kana_dic_type" AS ENUM ('DICTIONARY', 'REGEX');

-- AlterTable
ALTER TABLE "morph_convert_kana_dic" ADD COLUMN     "type" "morph_convert_kana_dic_type" NOT NULL DEFAULT 'DICTIONARY';
