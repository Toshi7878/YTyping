import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { H1 } from "@/ui/typography";
import { BookmarkListView } from "./_components/bookmark-list";

export default async function Page() {
  prefetch(trpc.map.bookmark.lists.getAll.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-6xl space-y-4 lg:px-8">
        <H1>公開ブックマーク一覧</H1>
        <BookmarkListView />
      </div>
    </HydrateClient>
  );
}
