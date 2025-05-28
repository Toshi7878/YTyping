-- CreateTable
CREATE TABLE "user_ime_typing_options" (
    "user_id" INTEGER NOT NULL,
    "enable_add_symbol" BOOLEAN NOT NULL DEFAULT false,
    "enable_eng_space" BOOLEAN NOT NULL DEFAULT false,
    "enable_eng_upper_case" BOOLEAN NOT NULL DEFAULT false,
    "add_symbol_list" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "user_ime_typing_options_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_ime_typing_options" ADD CONSTRAINT "user_ime_typing_options_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
