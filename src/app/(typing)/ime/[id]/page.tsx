import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { serverApi } from "@/trpc/server";
import { toLocaleDateString } from "@/utils/date";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { Content } from "../_components/content";
import { JotaiProvider } from "../_components/provider";

const getMapInfo = cache(async (mapId: number) => {
  return await serverApi.map.getMapInfo({ mapId });
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await getMapInfo(Number(id));

  const thumbnailUrl = buildYouTubeThumbnailUrl(mapInfo.videoId, mapInfo.thumbnailQuality);

  return {
    title: `${mapInfo.title} - YTyping`,
    openGraph: {
      title: mapInfo.title,
      type: "website",
      images: thumbnailUrl,
    },
    creator: mapInfo.creator.name,
    other: {
      "article:published_time": toLocaleDateString(mapInfo.createdAt, "ja-JP"),
      "article:modified_time": toLocaleDateString(mapInfo.updatedAt, "ja-JP"),
      "article:youtube_id": mapInfo.videoId,
      "article:title": mapInfo.title,
      "article:artist": mapInfo.artistName,
      "article:tag": mapInfo.tags,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mapInfo = await getMapInfo(Number(id));
  const userImeTypingOptions = await serverApi.userOption.getUserImeTypingOptions();
  if (!mapInfo) notFound();

  return (
    <JotaiProvider userImeTypingOptions={userImeTypingOptions} mapId={Number(id)}>
      <Content mapInfo={mapInfo} mapId={Number(id)} />
    </JotaiProvider>
  );
}
