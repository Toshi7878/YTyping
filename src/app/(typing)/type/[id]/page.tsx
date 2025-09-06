import { serverApi } from "@/trpc/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Content from "../_components/Content";
import ClientProvider from "../_components/client-provider";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });

  const thumbnailUrl =
    mapInfo?.thumbnail_quality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${mapInfo.video_id}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${mapInfo?.video_id}/mqdefault.jpg`;

  return {
    title: `${mapInfo!.title} - YTyping`,
    openGraph: {
      title: mapInfo!.title,
      type: "website",
      images: thumbnailUrl,
    },
    creator: mapInfo!.creatorName,
    other: {
      "article:published_time": mapInfo!.created_at.toISOString(),
      "article:modified_time": mapInfo!.updated_at.toISOString(),
      "article:youtube_id": mapInfo!.video_id,
      "article:title": mapInfo!.title,
      "article:artist": mapInfo!.artist_name,
      "article:tag": mapInfo!.tags,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: mapId } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(mapId) });
  const userTypingOptions = await serverApi.userTypingOption.getUserTypingOptions();

  if (!mapInfo) {
    notFound();
  }

  return (
    <ClientProvider mapInfo={mapInfo} userTypingOptions={userTypingOptions} mapId={mapId}>
      <Content video_id={mapInfo.video_id} mapId={mapId} />
    </ClientProvider>
  );
}
