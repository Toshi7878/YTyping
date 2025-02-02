-- CreateEnum
CREATE TYPE "active_user_state" AS ENUM ('ONLINE', 'ASK_ME', 'HIDE_ONLINE');

-- DropIndex
DROP INDEX "user_typing_options_user_id_key";

-- AlterTable
ALTER TABLE "user_options" ADD COLUMN     "active_user_state" "active_user_state" NOT NULL DEFAULT 'ONLINE',
ADD CONSTRAINT "user_options_pkey" PRIMARY KEY ("user_id");

-- DropIndex
DROP INDEX "user_options_user_id_key";

-- AlterTable
ALTER TABLE "user_typing_stats" ADD CONSTRAINT "user_typing_stats_pkey" PRIMARY KEY ("user_id");

-- DropIndex
DROP INDEX "user_typing_stats_user_id_key";
