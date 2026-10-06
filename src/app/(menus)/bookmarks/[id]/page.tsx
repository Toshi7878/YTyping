import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MapList } from "@/shared/map/list/list";
import { HydrateClient, prefetchAsync, trpc } from "@/trpc/server";
import { buttonVariants } from "@/ui/button";

export default async function Page({ params }: PageProps<"/bookmarks/[id]">) {
  const { id } = await params;
  await prefetchAsync(
    trpc.map.list.get.infiniteQueryOptions(
      { bookmarkListId: Number(id), sort: { type: "bookmark", isDesc: true } },
      { getNextPageParam: ({ nextCursor }) => nextCursor },
    ),
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
