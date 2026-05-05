"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MapList } from "@/components/shared/map/list";
import { Button } from "@/components/ui/button";

export const BookmarkListDetailView = ({ id }: { id: string }) => {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/bookmarks" className="flex items-center gap-2">
          <ArrowLeft className="size-4" />
          ブックマーク一覧に戻る
        </Link>
      </Button>
      <MapList filterParams={{ bookmarkListId: Number(id) }} />
    </div>
  );
};
