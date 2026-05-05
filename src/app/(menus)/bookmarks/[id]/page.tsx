import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapList } from "@/shared/map/list";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function Page({ params }: PageProps<"/bookmarks/[id]">) {
  const { id } = await params;
  prefetch(
    trpc.map.list.get.infiniteQueryOptions({ bookmarkListId: Number(id), sort: { type: "bookmark", isDesc: true } }),
  );

  return (
    <HydrateClient>
      <div className="mx-auto max-w-6xl space-y-4 lg:px-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bookmarks" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            ブックマーク一覧に戻る
          </Link>
        </Button>
        <MapList filterParams={{ bookmarkListId: Number(id) }} />
      </div>
    </HydrateClient>
  );
}
