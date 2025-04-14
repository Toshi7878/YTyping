import CreatedCheck from "@/components/share-components/CreatedCheck";
import { Metadata } from "next";
import Content from "../_components/Content";
import EditProvider from "../_components/EditProvider";

export const metadata: Metadata = {
  title: `Edit New Map - YTyping`,
  description: "",
};

export default async function Home({ searchParams }: { searchParams: { new?: string } }) {
  const videoId = searchParams.new;

  return (
    <EditProvider>
      <Content />
      {videoId && <CreatedCheck videoId={videoId} disableNotFoundText />}
    </EditProvider>
  );
}
