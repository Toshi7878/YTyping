"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Small } from "@/components/ui/typography";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";

type PublicBookmarkList = RouterOutputs["map"]["bookmark"]["list"]["getAll"][number];

export const BookmarkListView = () => {
  const trpc = useTRPC();
  const { data: lists } = useSuspenseQuery(trpc.map.bookmark.list.getAll.queryOptions());

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {lists.map((list) => (
        <BookmarkListCard key={list.id} list={list} />
      ))}
    </section>
  );
};

const BookmarkListCard = ({ list }: { list: PublicBookmarkList }) => {
  return (
    <Card className="hover-card-shadow-primary relative cursor-pointer py-0 transition-shadow">
      <Link href={`/bookmarks/${list.id}`} className="absolute size-full" />
      <CardContent className="flex items-center gap-3 p-4">
        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-sm">
          <Image
            src={buildYouTubeThumbnailUrl(list.firstMapVideoId ?? "", "mqdefault")}
            alt={list.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="truncate font-medium text-sm">{list.title}</div>
          <Small className="text-muted-foreground">{list.count}件</Small>
          <Link
            href={`/user/${list.userId}`}
            className="z-10 text-muted-foreground text-xs hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {list.userName}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
