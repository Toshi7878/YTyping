import { HydrateClient, prefetch, serverApi, trpc } from "@/trpc/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Content from "../_components/Content";
import ClientProvider from "../_components/client-provider";

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

  prefetch(trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }));
  if (!mapInfo) {
    notFound();
  }

  return (
    <HydrateClient>
      <ClientProvider userTypingOptions={userTypingOptions} mapId={mapId}>
        <Content videoId={mapInfo.videoId} mapId={mapId} />
      </ClientProvider>
    </HydrateClient>
  );
}
