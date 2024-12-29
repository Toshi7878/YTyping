import { serverApi } from "@/trpc/server";
import { Metadata } from "next";
import Content from "../_components/Content";
import EditProvider from "../_components/EditProvider";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });

  return {
    title: `Edit ${mapInfo!.title} - YTyping`,
  };
}
export default async function Page({ params }: { params: { id: string } }) {
  const mapInfo = await serverApi.map.getMapInfo({ mapId: Number(params.id) });

  return (
    <EditProvider mapInfo={mapInfo}>
      <Content />
    </EditProvider>
  );
}
