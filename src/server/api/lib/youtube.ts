import { ORPCError } from "@orpc/server";
import { google } from "googleapis";
import { ENV } from "varlock/env";

export const getYouTubeInfo = async (videoId: string) => {
  const apiKey = ENV.GCP_AUTH_KEY;
  if (!apiKey) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "YouTube情報の取得に失敗しました" });
  }

  try {
    const youtube = google.youtube({ version: "v3", auth: apiKey });
    const res = await youtube.videos.list({ part: ["snippet"], id: [videoId] });

    const snippet = res.data.items?.[0]?.snippet;
    if (!snippet) {
      throw new ORPCError("NOT_FOUND", { message: "動画が見つかりませんでした" });
    }

    return {
      channelTitle: snippet.channelTitle ?? "",
      description: snippet.description ?? "",
      title: snippet.title ?? "",
      tags: snippet.tags ?? [],
    };
  } catch (error) {
    if (error instanceof ORPCError) throw error;

    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "YouTube情報の取得に失敗しました" });
  }
};

export type YouTubeInfo = Awaited<ReturnType<typeof getYouTubeInfo>>;
