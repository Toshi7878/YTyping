import CreatedVideoMapList from "@/components/shared/created-video-map-list";
import { Metadata } from "next";
import Content from "../_components/Content";
import EditProvider from "../_components/client-provider";

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
