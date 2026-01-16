import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { HydrateClient, prefetch, serverApi, trpc } from "@/trpc/server";
import { Content } from "../_components/content";
import { PermissionToast } from "../_components/permission-toast";
import { JotaiProvider } from "../_components/provider";

const getMapInfo = cache(async (mapId: number) => {
  return await serverApi.map.detail.get({ mapId });
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await getMapInfo(Number(id));

  return {
    title: `Edit ${mapInfo.info.title} - YTyping`,
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mapInfo = await getMapInfo(Number(id));

  if (!mapInfo) notFound();

  prefetch(trpc.map.detail.get.queryOptions({ mapId: Number(id) }, { initialData: mapInfo }));

  return (
    <HydrateClient>
      <JotaiProvider mapId={id} videoId={mapInfo.media.videoId} creatorId={mapInfo.creator.id}>
        <PermissionToast />
        <Content type="edit" />
      </JotaiProvider>
    </HydrateClient>
  );
}
