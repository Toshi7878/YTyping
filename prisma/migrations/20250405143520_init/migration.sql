-- CreateTable
CREATE TABLE "user_daily_type_counts" (
    "user_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roma_type_count" INTEGER NOT NULL DEFAULT 0,
    "kana_type_count" INTEGER NOT NULL DEFAULT 0,
    "flick_type_count" INTEGER NOT NULL DEFAULT 0,
    "english_type_count" INTEGER NOT NULL DEFAULT 0,
    "other_type_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_daily_type_counts_pkey" PRIMARY KEY ("user_id","date")
);

-- AddForeignKey
ALTER TABLE "user_daily_type_counts" ADD CONSTRAINT "user_daily_type_counts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
