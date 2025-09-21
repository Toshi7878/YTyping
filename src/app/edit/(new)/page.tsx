import CreatedVideoMapList from "@/components/shared/created-video-map-list";
import type { Metadata } from "next";
import EditProvider from "../_components/client-provider";
import Content from "../_components/content";

export const metadata: Metadata = {
  title: `Edit New Map - YTyping`,
  description: "",
};

export default async function Home(props: { searchParams: Promise<{ new?: string }> }) {
  const searchParams = await props.searchParams;
  const videoId = searchParams.new;

  return (
    <EditProvider>
      <Content />
      {videoId && <CreatedVideoMapList videoId={videoId} disabledNotFoundText />}
    </EditProvider>
  );
}
