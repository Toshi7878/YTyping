import { ORPCError } from "@orpc/server";
import z from "zod";
import { downloadPublicFile } from "@/server/api/lib/storage";
import type { TypingLineResult } from "@/validator/result/result";
import { publicProcedure } from "../../orpc";
import { gzipDecompress } from "../../utils/gzip";
import { resultClapRouter } from "./clap";
import { resultListRouter } from "./list";
import { resultPpRouter } from "./pp";
import { resultRankingRouter } from "./ranking";

export const resultRouter = {
  getJsonById: publicProcedure.input(z.object({ resultId: z.number().nullable() })).handler(async ({ input }) => {
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
};
