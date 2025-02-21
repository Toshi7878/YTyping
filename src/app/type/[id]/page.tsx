import { serverApi } from "@/trpc/server";
import { Box } from "@chakra-ui/react";
import { Metadata } from "next";
import Content from "./Content";
import TypeProvider from "./TypeProvider";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });

  const thumbnailUrl =
    mapInfo?.thumbnail_quality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${mapInfo.video_id}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${mapInfo?.video_id}/mqdefault.jpg`;

  return {
    title: `${mapInfo!.title} - YTyping`,
    openGraph: {
      title: `${mapInfo!.title} - YTyping`,
      type: "website",
      images: thumbnailUrl,
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });
  const userTypingOptions = await serverApi.userTypingOption.getUserTypingOptions();

  return (
    <TypeProvider mapInfo={mapInfo!} userTypingOptions={userTypingOptions}>
      <Content mapInfo={mapInfo!} />
      <Box></Box>
    </TypeProvider>
  );
}
