import { serverApi } from "@/trpc/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Content from "./Content";
import ImeTypeProvider from "./ImeTypeProvider";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });

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

export default async function Page({ params }: { params: { id: string } }) {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });
  const userImeTypingOptions = await serverApi.userTypingOption.getUserImeTypingOptions();

  if (!mapInfo) {
    notFound();
  }

  return (
    <ImeTypeProvider userImeTypingOptions={userImeTypingOptions}>
      <Content mapInfo={mapInfo} />
    </ImeTypeProvider>
  );
}
