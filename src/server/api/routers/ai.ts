import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import z from "zod";
import { env } from "@/env";
import { generateMapInfoWithGemini } from "../lib/google-ai";
import { getYouTubeInfo } from "../lib/youtube";
import { protectedProcedure } from "../trpc";

const apiKey = env.GCP_AUTH_KEY;

export const aiRouter = {
  generateMapInfo: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input }) => {
    if (!apiKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "譜面情報の生成に失敗しました",
      });
    }

    try {
      const youtubeInfo = await getYouTubeInfo(input.videoId);
      const responseText = await generateMapInfoWithGemini(youtubeInfo);
      return parseMapInfoResponseText(responseText);
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "譜面情報の生成に失敗しました",
      });
    }
  }),
} satisfies TRPCRouterRecord;

const parseMapInfoResponseText = (responseText: string) => {
  const parsed = JSON.parse(responseText.trim()) as {
    title: string;
    source: string;
    artistName: string;
    otherTags: string[];
  };

  return {
    title: parsed?.title ?? "",
    source: parsed?.source ?? "",
    artistName: parsed?.artistName ?? "",
    otherTags: parsed?.otherTags ?? [],
  };
};
