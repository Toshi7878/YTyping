-- DropForeignKey
ALTER TABLE "result_statuses" DROP CONSTRAINT "result_statuses_result_id_fkey";

-- AlterTable
ALTER TABLE "result_statuses" ADD CONSTRAINT "result_statuses_pkey" PRIMARY KEY ("result_id");

-- DropIndex
DROP INDEX "result_statuses_result_id_key";

-- AddForeignKey
ALTER TABLE "result_statuses" ADD CONSTRAINT "result_statuses_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
