import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatedMapListByVideoId } from "@/shared/map/list/created-video";
import { Content } from "../_feature/content";
import { JotaiProvider } from "../_feature/provider";
import { searchParamsLoader } from "../_feature/search-params";
import { SimilarMapListByVideoId } from "../_feature/similar-map-list";

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
      <Content type="new" />
      <CreatedMapListByVideoId videoId={videoId} disabledNotFoundText />
      <SimilarMapListByVideoId videoId={videoId} />
    </JotaiProvider>
  );
}
