import { ORPCError } from "@orpc/server";
import z from "zod";
import { downloadPublicFile } from "@/server/api/lib/storage";
import type { TypingLineResult } from "@/validator/result/result";
import { publicProcedure } from "../../orpc";
import { gzipDecompress } from "../../utils/gzip";
import { resultClapRouter } from "./clap";
import { resultInvalidationRouter } from "./invalidation";
import { resultListRouter } from "./list";
import { resultPpRouter } from "./pp";
import { resultRankingRouter } from "./ranking";

export const resultRouter = {
  getJsonById: publicProcedure
    .input(z.object({ resultId: z.number().nullable() }))
    .handler(async ({ input, context }) => {
      const { db, session } = context;

      // 無効な記録のリプレイは、本人と管理者だけが取得できる
      if (input.resultId !== null) {
        const result = await db.query.results.findFirst({
          columns: { userId: true, invalidatedAt: true },
          where: { id: input.resultId },
        });
        const canViewInvalid = session?.user.role === "ADMIN" || session?.user.id === result?.userId;
        if (result?.invalidatedAt && !canViewInvalid) throw new ORPCError("NOT_FOUND");
      }

      const data = await downloadPublicFile(`result-json/${input.resultId}.json.gz`);
      if (!data) throw new ORPCError("NOT_FOUND");

      const jsonString = new TextDecoder().decode(await gzipDecompress(data));
      const jsonData: TypingLineResult[] = JSON.parse(jsonString);

      return jsonData;
    }),

  list: resultListRouter,
  ranking: resultRankingRouter,
  pp: resultPpRouter,
  clap: resultClapRouter,
  invalidation: resultInvalidationRouter,
};
