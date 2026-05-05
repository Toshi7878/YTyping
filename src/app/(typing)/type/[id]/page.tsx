import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { caller, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { toLocaleDateString } from "@/utils/date";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { Content } from "../_feature/content";
import { JotaiProvider } from "../_feature/provider";

const getMapInfo = cache(async (mapId: number) => await caller.map.getById({ mapId }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await getMapInfo(Number(id));

  const thumbnailUrl = getYouTubeThumbnailUrl(mapInfo.media.videoId, mapInfo.media.thumbnailQuality);

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
  const [userTypingOptions, mapInfo] = await Promise.all([
    caller.user.typingOption.getForSession(),
    getMapInfo(Number(mapId)),
  ]);
  if (!mapInfo) notFound();
  prefetch(trpc.map.getById.queryOptions({ mapId: Number(mapId) }, { initialData: mapInfo }));

  return (
    <HydrateClient>
      <JotaiProvider userTypingOptions={userTypingOptions} mapId={Number(mapId)}>
        <Content videoId={mapInfo.media.videoId} mapId={Number(mapId)} />
      </JotaiProvider>
    </HydrateClient>
  );
}
