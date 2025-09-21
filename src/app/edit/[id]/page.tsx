import { serverApi } from "@/trpc/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditProvider from "../_components/client-provider";
import Content from "../_components/content";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });

  return {
    title: `Edit ${mapInfo.title} - YTyping`,
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });

  if (!mapInfo) notFound();

  return (
    <EditProvider>
      <Content videoId={mapInfo.videoId} />
    </EditProvider>
  );
}
