CREATE TYPE "public"."category" AS ENUM('CSS', 'SPEED_SHIFT');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_quality" AS ENUM('mqdefault', 'maxresdefault');--> statement-breakpoint
CREATE TYPE "public"."morph_convert_kana_dic_type" AS ENUM('DICTIONARY', 'REGEX');--> statement-breakpoint
CREATE TYPE "public"."action" AS ENUM('LIKE', 'OVER_TAKE');--> statement-breakpoint
CREATE TYPE "public"."custom_user_active_state" AS ENUM('ONLINE', 'ASK_ME', 'HIDE_ONLINE');--> statement-breakpoint
CREATE TYPE "public"."line_completed_display" AS ENUM('HIGH_LIGHT', 'NEXT_WORD');--> statement-breakpoint
CREATE TYPE "public"."main_word_display" AS ENUM('KANA_ROMA_UPPERCASE', 'KANA_ROMA_LOWERCASE', 'ROMA_KANA_UPPERCASE', 'ROMA_KANA_LOWERCASE', 'KANA_ONLY', 'ROMA_UPPERCASE_ONLY', 'ROMA_LOWERCASE_ONLY');--> statement-breakpoint
CREATE TYPE "public"."next_display" AS ENUM('LYRICS', 'WORD');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."time_offset_key" AS ENUM('CTRL_LEFT_RIGHT', 'CTRL_ALT_LEFT_RIGHT', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."toggle_input_mode_key" AS ENUM('ALT_KANA', 'TAB', 'NONE');--> statement-breakpoint
CREATE TABLE "map_difficulties" (
	"map_id" integer PRIMARY KEY NOT NULL,
	"roma_kpm_median" integer DEFAULT 0 NOT NULL,
	"roma_kpm_max" integer DEFAULT 0 NOT NULL,
	"kana_kpm_median" integer DEFAULT 0 NOT NULL,
	"kana_kpm_max" integer DEFAULT 0 NOT NULL,
	"total_time" double precision DEFAULT 0 NOT NULL,
	"roma_total_notes" integer DEFAULT 0 NOT NULL,
	"kana_total_notes" integer DEFAULT 0 NOT NULL,
	"english_total_notes" integer DEFAULT 0 NOT NULL,
	"symbol_total_notes" integer DEFAULT 0 NOT NULL,
	"int_total_notes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_likes" (
	"user_id" integer NOT NULL,
	"map_id" integer NOT NULL,
	"is_liked" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "map_likes_user_id_map_id_pk" PRIMARY KEY("user_id","map_id")
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" char(11) NOT NULL,
	"title" varchar DEFAULT '' NOT NULL,
	"artist_name" varchar DEFAULT '' NOT NULL,
	"music_source" varchar DEFAULT '' NOT NULL,
	"creator_comment" varchar DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"creator_id" integer NOT NULL,
	"preview_time" real DEFAULT 0 NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"ranking_count" integer DEFAULT 0 NOT NULL,
	"category" "category"[] DEFAULT ARRAY[]::category[] NOT NULL,
	"thumbnail_quality" "thumbnail_quality" DEFAULT 'mqdefault' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fix_word_edit_logs" (
	"lyrics" varchar PRIMARY KEY NOT NULL,
	"word" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "morph_convert_kana_dic" (
	"surface" varchar PRIMARY KEY NOT NULL,
	"reading" varchar NOT NULL,
	"type" "morph_convert_kana_dic_type" DEFAULT 'DICTIONARY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" integer NOT NULL,
	"visited_id" integer NOT NULL,
	"map_id" integer NOT NULL,
	"action" "action" DEFAULT 'OVER_TAKE' NOT NULL,
	"old_rank" integer,
	"checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_notifications_visitor_visited_map_action" UNIQUE("visitor_id","visited_id","map_id","action")
);
--> statement-breakpoint
CREATE TABLE "ime_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"map_id" integer NOT NULL,
	"type_count" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_claps" (
	"user_id" integer NOT NULL,
	"result_id" integer NOT NULL,
	"is_claped" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "result_claps_user_id_result_id_pk" PRIMARY KEY("user_id","result_id")
);
--> statement-breakpoint
CREATE TABLE "result_statuses" (
	"result_id" integer PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"default_speed" real DEFAULT 1 NOT NULL,
	"kpm" integer DEFAULT 0 NOT NULL,
	"rkpm" integer DEFAULT 0 NOT NULL,
	"roma_kpm" integer DEFAULT 0 NOT NULL,
	"roma_rkpm" integer DEFAULT 0 NOT NULL,
	"roma_type" integer DEFAULT 0 NOT NULL,
	"kana_type" integer DEFAULT 0 NOT NULL,
	"flick_type" integer DEFAULT 0 NOT NULL,
	"english_type" integer DEFAULT 0 NOT NULL,
	"space_type" integer DEFAULT 0 NOT NULL,
	"symbol_type" integer DEFAULT 0 NOT NULL,
	"num_type" integer DEFAULT 0 NOT NULL,
	"miss" integer DEFAULT 0 NOT NULL,
	"lost" integer DEFAULT 0 NOT NULL,
	"max_combo" integer DEFAULT 0 NOT NULL,
	"clear_rate" real DEFAULT 0 NOT NULL,
	CONSTRAINT "default_speed_check" CHECK ("result_statuses"."default_speed" IN (0.25, 0.5, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00))
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"map_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"clap_count" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "uq_user_id_map_id" UNIQUE("user_id","map_id")
);
--> statement-breakpoint
CREATE TABLE "user_daily_type_counts" (
	"user_id" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"roma_type_count" integer DEFAULT 0 NOT NULL,
	"kana_type_count" integer DEFAULT 0 NOT NULL,
	"flick_type_count" integer DEFAULT 0 NOT NULL,
	"english_type_count" integer DEFAULT 0 NOT NULL,
	"ime_type_count" integer DEFAULT 0 NOT NULL,
	"other_type_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_daily_type_counts_user_id_created_at_pk" PRIMARY KEY("user_id","created_at")
);
--> statement-breakpoint
CREATE TABLE "user_ime_typing_options" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"enable_add_symbol" boolean DEFAULT false NOT NULL,
	"enable_eng_space" boolean DEFAULT false NOT NULL,
	"enable_eng_upper_case" boolean DEFAULT false NOT NULL,
	"enable_next_lyrics" boolean DEFAULT true NOT NULL,
	"add_symbol_list" varchar DEFAULT '' NOT NULL,
	"enable_large_video_display" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_options" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"map_like_notify" boolean DEFAULT true NOT NULL,
	"over_take_notify" integer DEFAULT 5 NOT NULL,
	"custom_user_active_state" "custom_user_active_state" DEFAULT 'ONLINE' NOT NULL,
	"hide_user_stats" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"finger_chart_url" varchar DEFAULT '' NOT NULL,
	"my_keyboard" varchar DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"total_ranking_count" integer DEFAULT 0 NOT NULL,
	"total_typing_time" real DEFAULT 0 NOT NULL,
	"roma_type_total_count" integer DEFAULT 0 NOT NULL,
	"kana_type_total_count" integer DEFAULT 0 NOT NULL,
	"flick_type_total_count" integer DEFAULT 0 NOT NULL,
	"english_type_total_count" integer DEFAULT 0 NOT NULL,
	"space_type_total_count" integer DEFAULT 0 NOT NULL,
	"symbol_type_total_count" integer DEFAULT 0 NOT NULL,
	"num_type_total_count" integer DEFAULT 0 NOT NULL,
	"total_play_count" integer DEFAULT 0 NOT NULL,
	"ime_type_total_count" integer DEFAULT 0 NOT NULL,
	"max_combo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_typing_options" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"time_offset" real DEFAULT 0 NOT NULL,
	"kana_word_scroll" integer DEFAULT 10 NOT NULL,
	"roma_word_scroll" integer DEFAULT 16 NOT NULL,
	"kana_word_font_size" integer DEFAULT 100 NOT NULL,
	"roma_word_font_size" integer DEFAULT 100 NOT NULL,
	"kana_word_top_position" real DEFAULT 0 NOT NULL,
	"roma_word_top_position" real DEFAULT 0 NOT NULL,
	"kana_word_spacing" real DEFAULT 0.08 NOT NULL,
	"roma_word_spacing" real DEFAULT 0.08 NOT NULL,
	"type_sound" boolean DEFAULT false NOT NULL,
	"miss_sound" boolean DEFAULT false NOT NULL,
	"line_clear_sound" boolean DEFAULT false NOT NULL,
	"next_display" "next_display" DEFAULT 'LYRICS' NOT NULL,
	"line_completed_display" "line_completed_display" DEFAULT 'NEXT_WORD' NOT NULL,
	"time_offset_key" time_offset_key DEFAULT 'CTRL_LEFT_RIGHT' NOT NULL,
	"toggle_input_mode_key" "toggle_input_mode_key" DEFAULT 'ALT_KANA' NOT NULL,
	"main_word_display" "main_word_display" DEFAULT 'KANA_ROMA_UPPERCASE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"email_hash" varchar NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_email_hash_unique" UNIQUE("email_hash")
);
--> statement-breakpoint
ALTER TABLE "map_difficulties" ADD CONSTRAINT "map_difficulties_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_likes" ADD CONSTRAINT "map_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_likes" ADD CONSTRAINT "map_likes_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visitor_id_users_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visitor_result_fk" FOREIGN KEY ("visitor_id","map_id") REFERENCES "public"."results"("user_id","map_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visited_result_fk" FOREIGN KEY ("visited_id","map_id") REFERENCES "public"."results"("user_id","map_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ime_results" ADD CONSTRAINT "ime_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ime_results" ADD CONSTRAINT "ime_results_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_claps" ADD CONSTRAINT "result_claps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_claps" ADD CONSTRAINT "result_claps_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_statuses" ADD CONSTRAINT "result_statuses_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_type_counts" ADD CONSTRAINT "user_daily_type_counts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ime_typing_options" ADD CONSTRAINT "user_ime_typing_options_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_options" ADD CONSTRAINT "user_options_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_typing_options" ADD CONSTRAINT "user_typing_options_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;