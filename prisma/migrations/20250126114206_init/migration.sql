/*
  Warnings:

  - You are about to drop the `typing_option` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "typing_option" DROP CONSTRAINT "typing_option_user_id_fkey";

-- DropTable
DROP TABLE "typing_option";

-- CreateTable
CREATE TABLE "user_typing_options" (
    "user_id" INTEGER NOT NULL,
    "time_offset" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type_sound" BOOLEAN NOT NULL DEFAULT false,
    "miss_sound" BOOLEAN NOT NULL DEFAULT false,
    "line_clear_sound" BOOLEAN NOT NULL DEFAULT false,
    "next_display" "next_display" NOT NULL DEFAULT 'LYRICS',
    "time_offset_key" "time_offset_key" NOT NULL DEFAULT 'CTRL_LEFT_RIGHT',
    "toggle_input_mode_key" "toggle_input_mode_key" NOT NULL DEFAULT 'ALT_KANA',

    CONSTRAINT "user_typing_options_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_typing_options_user_id_key" ON "user_typing_options"("user_id");

-- AddForeignKey
ALTER TABLE "user_typing_options" ADD CONSTRAINT "user_typing_options_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
