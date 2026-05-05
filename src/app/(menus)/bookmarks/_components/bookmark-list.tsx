"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { Card, CardContent } from "@/ui/card";
import { ThumbnailImage } from "@/ui/image";
import { Small } from "@/ui/typography";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";

type PublicBookmarkList = RouterOutputs["map"]["bookmark"]["lists"]["getAll"][number];

export const BookmarkListView = () => {
  const trpc = useTRPC();
  const { data: lists } = useSuspenseQuery(trpc.map.bookmark.lists.getAll.queryOptions());

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
      <Link href={`/bookmarks/${list.id}`} className="absolute z-1 size-full" />
      <CardContent className="flex items-center gap-3 p-4">
        <ThumbnailImage
          src={buildYouTubeThumbnailUrl(list.firstMapVideoId ?? "", "mqdefault")}
          alt={list.title}
          size="2xs"
        />
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
