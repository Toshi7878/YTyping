import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatedVideoMapList } from "@/components/shared/created-video-map-list";
import { Content } from "../_components/content";
import { EditProvider, JotaiProvider } from "../_components/provider";
import { searchParamsLoader } from "../_lib/search-params";

export const metadata: Metadata = {
  title: "Edit New Map - YTyping",
  description: "",
};

export default async function Page({ searchParams }: PageProps<"/edit">) {
  const { new: videoId } = await searchParamsLoader(searchParams);
  if (!videoId) {
    notFound();
  }

  return (
    <JotaiProvider videoId={videoId}>
      <EditProvider>
        <Content />
        <CreatedVideoMapList videoId={videoId} disabledNotFoundText />
      </EditProvider>
    </JotaiProvider>
  );
}
