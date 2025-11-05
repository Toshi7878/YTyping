import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrateClient, prefetch, serverApi, trpc } from "@/trpc/server";
import { Content } from "../_components/content";
import { ClientProvider, JotaiProvider } from "../_components/provider";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });

  const thumbnailUrl =
    mapInfo.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${mapInfo.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${mapInfo.videoId}/mqdefault.jpg`;

  return {
    title: `${mapInfo.title} - YTyping`,
    openGraph: {
      title: mapInfo.title,
      type: "website",
      images: thumbnailUrl,
    },
    creator: mapInfo.creator.name,
    other: {
      "article:published_time": mapInfo.createdAt.toISOString(),
      "article:modified_time": mapInfo.updatedAt.toISOString(),
      "article:youtube_id": mapInfo.videoId,
      "article:title": mapInfo.title,
      "article:artist": mapInfo.artistName,
      "article:tag": mapInfo.tags,
    },
  };
}

export default async function Page({ params }: PageProps<"/type/[id]">) {
  const { id: mapId } = await params;
  const userTypingOptions = await serverApi.userOption.getUserTypingOptions();
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(mapId) });
  if (!mapInfo) {
    notFound();
  }

  prefetch(trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }));
  return (
    <HydrateClient>
      <JotaiProvider userTypingOptions={userTypingOptions} mapId={mapId}>
        <ClientProvider>
          <Content videoId={mapInfo.videoId} />
        </ClientProvider>
      </JotaiProvider>
    </HydrateClient>
  );
}
