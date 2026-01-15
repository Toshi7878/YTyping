import { TRPCError } from "@trpc/server";
import { google } from "googleapis";
import { env } from "@/env";

export const getYouTubeInfo = async (videoId: string) => {
  const apiKey = env.GCP_AUTH_KEY;
  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "YouTube情報の取得に失敗しました",
    });
  }

  try {
    const youtube = google.youtube({ version: "v3", auth: apiKey });
    const res = await youtube.videos.list({ part: ["snippet"], id: [videoId] });

    const snippet = res.data.items?.[0]?.snippet;
    if (!snippet) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "動画が見つかりませんでした",
      });
    }

    return {
      channelTitle: snippet.channelTitle ?? "",
      description: snippet.description ?? "",
      title: snippet.title ?? "",
      tags: snippet.tags ?? [],
    };
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "YouTube情報の取得に失敗しました",
    });
  }
};

export type YouTubeInfo = Awaited<ReturnType<typeof getYouTubeInfo>>;
