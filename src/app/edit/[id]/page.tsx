import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCaller, HydrateClient, prefetch, trpc } from "@/app/_layout/trpc/server";
import { Content } from "../_components/content";
import { PermissionToast } from "../_components/permission-toast";
import { JotaiProvider } from "../_components/provider";

const getMapInfo = cache(async (caller: ReturnType<typeof getCaller>, mapId: number) => {
  return await caller.map.getById({ mapId });
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const caller = getCaller();
  const mapInfo = await getMapInfo(caller, Number(id));

  return {
    title: `Edit ${mapInfo.info.title} - YTyping`,
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = getCaller();
  const mapInfo = await getMapInfo(caller, Number(id));

  if (!mapInfo) notFound();

  prefetch(trpc.map.getById.queryOptions({ mapId: Number(id) }, { initialData: mapInfo }));

  return (
    <HydrateClient>
      <JotaiProvider mapId={id} videoId={mapInfo.media.videoId} creatorId={mapInfo.creator.id}>
        <PermissionToast />
        <Content type="edit" />
      </JotaiProvider>
    </HydrateClient>
  );
}
