-- CreateEnum
CREATE TYPE "next_display" AS ENUM ('LYRICS', 'WORD');

-- CreateEnum
CREATE TYPE "time_offset_key" AS ENUM ('CTRL_LEFT_RIGHT', 'CTRL_ALT_LEFT_RIGHT', 'NONE');

-- CreateEnum
CREATE TYPE "toggle_input_mode_key" AS ENUM ('ALT_KANA', 'TAB', 'NONE');

-- CreateEnum
CREATE TYPE "action" AS ENUM ('LIKE', 'OVER_TAKE');

-- CreateEnum
CREATE TYPE "thumbnail_quality" AS ENUM ('mqdefault', 'maxresdefault');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('CSS', 'SPEED_SHIFT');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "results" (
    "id" SERIAL NOT NULL,
    "map_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clap_count" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_statuses" (
    "result_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "default_speed" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "kpm" INTEGER NOT NULL DEFAULT 0,
    "rkpm" INTEGER NOT NULL DEFAULT 0,
    "roma_kpm" INTEGER NOT NULL DEFAULT 0,
    "roma_type" INTEGER NOT NULL DEFAULT 0,
    "kana_type" INTEGER NOT NULL DEFAULT 0,
    "flick_type" INTEGER NOT NULL DEFAULT 0,
    "english_type" INTEGER NOT NULL DEFAULT 0,
    "symbol_type" INTEGER NOT NULL DEFAULT 0,
    "num_type" INTEGER NOT NULL DEFAULT 0,
    "miss" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "max_combo" INTEGER NOT NULL DEFAULT 0,
    "clear_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "result_statuses_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "user_typing_stats" (
    "user_id" INTEGER NOT NULL,
    "total_ranking_count" INTEGER NOT NULL DEFAULT 0,
    "total_typing_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roma_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "kana_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "flick_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "english_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "symbol_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "int_type_total_count" INTEGER NOT NULL DEFAULT 0,
    "total_play_count" INTEGER NOT NULL DEFAULT 0,
    "max_combo" INTEGER NOT NULL DEFAULT 0,
    "clap_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

-- CreateTable
CREATE TABLE "user_options" (
    "user_id" INTEGER NOT NULL,
    "map_like_notify" BOOLEAN NOT NULL DEFAULT true,
    "over_take_notify" INTEGER NOT NULL DEFAULT 5
);

-- CreateTable
CREATE TABLE "result_claps" (
    "user_id" INTEGER NOT NULL,
    "result_id" INTEGER NOT NULL,
    "is_claped" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "map_likes" (
    "user_id" INTEGER NOT NULL,
    "map_id" INTEGER NOT NULL,
    "is_liked" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "visitor_id" INTEGER NOT NULL,
    "visited_id" INTEGER NOT NULL,
    "map_id" INTEGER NOT NULL,
    "action" "action" NOT NULL DEFAULT 'OVER_TAKE',
    "old_rank" INTEGER,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maps" (
    "id" SERIAL NOT NULL,
    "video_id" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "artist_name" TEXT NOT NULL DEFAULT '',
    "music_source" TEXT NOT NULL DEFAULT '',
    "creator_comment" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creator_id" INTEGER NOT NULL,
    "preview_time" TEXT NOT NULL DEFAULT '0',
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "ranking_count" INTEGER NOT NULL DEFAULT 0,
    "category" "category"[] DEFAULT ARRAY[]::"category"[],
    "thumbnail_quality" "thumbnail_quality" NOT NULL DEFAULT 'mqdefault',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_difficulties" (
    "map_id" INTEGER NOT NULL,
    "roma_kpm_median" INTEGER NOT NULL DEFAULT 0,
    "roma_kpm_max" INTEGER NOT NULL DEFAULT 0,
    "kana_kpm_median" INTEGER NOT NULL DEFAULT 0,
    "kana_kpm_max" INTEGER NOT NULL DEFAULT 0,
    "total_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roma_total_notes" INTEGER NOT NULL DEFAULT 0,
    "kana_total_notes" INTEGER NOT NULL DEFAULT 0,
    "english_total_notes" INTEGER NOT NULL DEFAULT 0,
    "symbol_total_notes" INTEGER NOT NULL DEFAULT 0,
    "int_total_notes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "map_difficulties_pkey" PRIMARY KEY ("map_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email_hash" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "results_user_id_map_id_key" ON "results"("user_id", "map_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_typing_stats_user_id_key" ON "user_typing_stats"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_typing_options_user_id_key" ON "user_typing_options"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_options_user_id_key" ON "user_options"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "result_claps_user_id_result_id_key" ON "result_claps"("user_id", "result_id");

-- CreateIndex
CREATE UNIQUE INDEX "map_likes_user_id_map_id_key" ON "map_likes"("user_id", "map_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_created_at_key" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_visitor_id_visited_id_map_id_action_key" ON "notifications"("visitor_id", "visited_id", "map_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_hash_key" ON "users"("email_hash");

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_statuses" ADD CONSTRAINT "result_statuses_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_typing_stats" ADD CONSTRAINT "user_typing_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_typing_options" ADD CONSTRAINT "user_typing_options_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_options" ADD CONSTRAINT "user_options_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_claps" ADD CONSTRAINT "result_claps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_claps" ADD CONSTRAINT "result_claps_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_likes" ADD CONSTRAINT "map_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_likes" ADD CONSTRAINT "map_likes_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visitor_id_map_id_fkey" FOREIGN KEY ("visitor_id", "map_id") REFERENCES "results"("user_id", "map_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visited_id_map_id_fkey" FOREIGN KEY ("visited_id", "map_id") REFERENCES "results"("user_id", "map_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maps" ADD CONSTRAINT "maps_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_difficulties" ADD CONSTRAINT "map_difficulties_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
