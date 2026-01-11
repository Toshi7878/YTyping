import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverApi } from "@/trpc/server";
import { Content } from "../_components/content";
import { PermissionToast } from "../_components/permission-toast";
import { JotaiProvider } from "../_components/provider";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await serverApi.map.getInfoById({ mapId: Number(id) });

  return {
    title: `Edit ${mapInfo.info.title} - YTyping`,
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mapInfo = await serverApi.map.getInfoById({ mapId: Number(id) });

  if (!mapInfo) notFound();

  return (
    <JotaiProvider mapId={id} videoId={mapInfo.media.videoId} creatorId={mapInfo.creator.id}>
      <PermissionToast />
      <Content type="edit" />
    </JotaiProvider>
  );
}
