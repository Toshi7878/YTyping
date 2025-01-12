import { serverApi } from "@/trpc/server";
import { Metadata } from "next";
import Content from "./Content";
import TypeProvider from "./TypeProvider";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });

  return {
    title: `${mapInfo!.title} - YTyping`,
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });
  const userTypingOptions = await serverApi.userTypingOption.getUserTypingOptions();

  return (
    <TypeProvider mapInfo={mapInfo!} userTypingOptions={userTypingOptions}>
      <Content mapInfo={mapInfo!} />
    </TypeProvider>
  );
}
