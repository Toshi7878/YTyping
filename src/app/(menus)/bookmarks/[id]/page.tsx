import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { BookmarkListDetailView } from "./_components/map-list";

export default async function Page({ params }: PageProps<"/bookmarks/[id]">) {
  const { id } = await params;
  prefetch(
    trpc.map.list.get.infiniteQueryOptions({ bookmarkListId: Number(id), sort: { value: "bookmark", desc: true } }),
  );

  return (
    <HydrateClient>
      <div className="mx-auto max-w-6xl space-y-4 lg:px-8">
        <BookmarkListDetailView id={id} />
      </div>
    </HydrateClient>
  );
}
