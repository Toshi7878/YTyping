import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCaller } from "@/trpc/server";
import { toLocaleDateString } from "@/utils/date";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { Content } from "../_feature/content";
import { JotaiProvider } from "../_feature/provider";
import { UserScriptInit } from "../_feature/user-script";

const getMapInfo = cache(async (caller: ReturnType<typeof getCaller>, mapId: number) => {
  return await caller.map.getById({ mapId });
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const caller = getCaller();
  const mapInfo = await getMapInfo(caller, Number(id));
  const thumbnailUrl = buildYouTubeThumbnailUrl(mapInfo.media.videoId, mapInfo.media.thumbnailQuality);

  return {
    title: `${mapInfo.info.title} - YTyping`,
    openGraph: {
      title: mapInfo.info.title,
      type: "website",
      images: thumbnailUrl,
    },
    creator: mapInfo.creator.name,
    other: {
      "article:published_time": toLocaleDateString(mapInfo.createdAt, "ja-JP"),
      "article:modified_time": toLocaleDateString(mapInfo.updatedAt, "ja-JP"),
      "article:youtube_id": mapInfo.media.videoId,
      "article:title": mapInfo.info.title,
      "article:artist": mapInfo.info.artistName,
      "article:tag": mapInfo.info.tags,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = getCaller();
  const [mapInfo, userImeTypingOptions] = await Promise.all([
    getMapInfo(caller, Number(id)),
    caller.user.imeTypingOption.getForSession(),
  ]);
  if (!mapInfo) notFound();

  return (
    <>
      <JotaiProvider userImeTypingOptions={userImeTypingOptions} mapId={Number(id)}>
        <Content mapInfo={mapInfo} mapId={Number(id)} />
      </JotaiProvider>
      <UserScriptInit />
    </>
  );
}
