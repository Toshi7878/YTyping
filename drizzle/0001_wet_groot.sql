ALTER TABLE "maps" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "maps" ALTER COLUMN "creator_comment" SET DATA TYPE varchar(512);--> statement-breakpoint
ALTER TABLE "maps" ALTER COLUMN "creator_comment" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "ime_results" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "finger_chart_url" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "finger_chart_url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "keyboard" SET DATA TYPE varchar(1024);--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "keyboard" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;