import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { HydrateClient, prefetch, serverApi, trpc } from "@/trpc/server";
import { toLocaleDateString } from "@/utils/date";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { Content } from "../_components/content";
import { JotaiProvider } from "../_components/provider";

// React cache でメモ化：同じmapIdでの複数回の呼び出しでもDBクエリは1回のみ
const getMapInfo = cache(async (mapId: number) => {
  return await serverApi.map.detail.get({ mapId });
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await getMapInfo(Number(id));

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

export default async function Page({ params }: PageProps<"/type/[id]">) {
  const { id: mapId } = await params;
  prefetch(trpc.map.detail.getJson.queryOptions({ mapId: Number(mapId) }));
  const userTypingOptions = await serverApi.user.typingOption.getForSession();
  const mapInfo = await getMapInfo(Number(mapId));
  if (!mapInfo) {
    notFound();
  }
  prefetch(trpc.map.detail.get.queryOptions({ mapId: Number(mapId) }, { initialData: mapInfo }));

  return (
    <HydrateClient>
      <JotaiProvider userTypingOptions={userTypingOptions} mapId={Number(mapId)}>
        <Content videoId={mapInfo.media.videoId} mapId={Number(mapId)} />
      </JotaiProvider>
    </HydrateClient>
  );
}
