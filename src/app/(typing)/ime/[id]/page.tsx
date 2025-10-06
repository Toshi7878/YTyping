import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverApi } from "@/trpc/server";
import { ImeTypeProvider } from "../_components/client-provider";
import { Content } from "../_components/content";

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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });
  const userImeTypingOptions = await serverApi.userOption.getUserImeTypingOptions();

  if (!mapInfo) notFound();

  return (
    <ImeTypeProvider userImeTypingOptions={userImeTypingOptions}>
      <Content mapInfo={mapInfo} />
    </ImeTypeProvider>
  );
}
