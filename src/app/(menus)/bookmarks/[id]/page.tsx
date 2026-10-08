import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { MapList } from "@/shared/map/list/list";
import { buttonVariants } from "@/ui/button";

export default async function Page({ params }: PageProps<"/bookmarks/[id]">) {
  const { id } = await params;
  await prefetchAsync(
    orpc.map.list.get.infiniteOptions({
      input: (pageParam) => ({
        bookmarkListId: Number(id),
        sort: { type: "bookmark", isDesc: true },
        cursor: pageParam,
      }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }),
  );

  return (
    <HydrateClient>
      <div className="mx-auto max-w-6xl space-y-4 lg:px-8">
        <Link
          href="/bookmarks"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "flex items-center gap-2" })}
        >
          <ArrowLeft className="size-4" />
          ブックマーク一覧に戻る
        </Link>
        <MapList filterParams={{ bookmarkListId: Number(id) }} />
      </div>
    </HydrateClient>
  );
}
