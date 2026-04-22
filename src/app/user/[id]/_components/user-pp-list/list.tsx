"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PPResultCard } from "@/components/shared/pp-card/card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/provider";

export function PPResultCardList({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    trpc.result.list.getPp.infiniteQueryOptions(
      { playerId: Number(id) },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
    ),
  );

  return (
    <Card aria-label="ベストパフォーマンス" className="px-24">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">ベストパフォーマンス</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {data.pages.map((page, pageIndex) =>
            page.items.map((result) => (
              <PPResultCard key={result.id} result={result} initialInView={data.pages.length - 1 === pageIndex} />
            )),
          )}
        </div>
        {hasNextPage ? (
          <div className="flex justify-center pt-1">
            <Button type="button" variant="secondary" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  読み込み中…
                </>
              ) : (
                "もっと見る"
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
