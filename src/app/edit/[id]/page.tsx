import { serverApi } from "@/trpc/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Content from "../_components/Content";
import EditProvider from "../_components/EditProvider";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });

  return {
    title: `Edit ${mapInfo!.title} - YTyping`,
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(id) });

  if (!mapInfo) {
    notFound();
  }

  return (
    <EditProvider mapInfo={mapInfo}>
      <Content />
    </EditProvider>
  );
}
