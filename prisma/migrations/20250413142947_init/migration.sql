-- CreateTable
CREATE TABLE "morph_convert_kana_dic" (
    "surface" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "morph_convert_kana_dic_pkey" PRIMARY KEY ("surface")
);

-- AddForeignKey
ALTER TABLE "morph_convert_kana_dic" ADD CONSTRAINT "morph_convert_kana_dic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
