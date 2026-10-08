import { ORPCError } from "@orpc/server";
import z from "zod";
import { env } from "@/env";
import { generateMapInfoWithGemini } from "../lib/google-ai";
import { getYouTubeInfo } from "../lib/youtube";
import { protectedProcedure } from "../orpc";

const apiKey = env.GCP_AUTH_KEY;

export const aiRouter = {
  generateMapInfo: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).handler(async ({ input }) => {
    if (!apiKey) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "譜面情報の生成に失敗しました" });
    }

    try {
      const youtubeInfo = await getYouTubeInfo(input.videoId);
      const responseText = await generateMapInfoWithGemini(youtubeInfo);
      return parseMapInfoResponseText(responseText);
    } catch (error) {
      if (error instanceof ORPCError) throw error;

      throw new ORPCError("BAD_REQUEST", { message: "譜面情報の生成に失敗しました" });
    }
  }),
};

const parseMapInfoResponseText = (responseText: string) => {
  const parsed = JSON.parse(responseText.trim()) as {
    title: string;
    source: string;
    artistName: string;
    otherTags: string[];
    originalTitle: string;
  };

  return {
    title: parsed?.title ?? "",
    source: parsed?.source ?? "",
    artistName: parsed?.artistName ?? "",
    otherTags: parsed?.otherTags ?? [],
    originalTitle: parsed?.originalTitle ?? "",
  };
};
