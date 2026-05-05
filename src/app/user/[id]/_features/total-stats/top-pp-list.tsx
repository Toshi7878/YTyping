"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PPResultCard } from "@/components/shared/result/pp-card/card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group/radio-group";
import { TOTAL_PP_TOP_N } from "@/lib/pp";
import { useTRPC } from "@/trpc/provider";
import { usePpOrderQueryState } from "../search-params";

export function UserTopPpList({ id }: { id: string }) {
  const trpc = useTRPC();
  const [order, setOrder] = usePpOrderQueryState();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    trpc.result.pp.userTopList.infiniteQueryOptions(
      { playerId: Number(id), order },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
    ),
  );

  return (
    <Card aria-label="ベストパフォーマンス" className="gap-0 px-0 sm:px-24">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-base">ベストパフォーマンス TOP{TOTAL_PP_TOP_N}</CardTitle>
          <RadioGroup value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")} className="flex gap-3">
            {(["desc", "asc"] as const).map((v) => {
              const id = `pp-order-${v}`;
              return (
                <div key={v} className="flex items-center gap-1.5">
                  <RadioGroupItem value={v} id={id} />
                  <Label htmlFor={id} className="cursor-pointer text-xs">
                    {v === "desc" ? "降順" : "昇順"}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-sm:px-0">
        <div className="grid grid-cols-1 gap-3">
          {data.pages.map((page, pageIndex) =>
            page.items.map((result) => (
              <PPResultCard key={result.id} result={result} initialInView={data.pages.length - 1 === pageIndex} />
            )),
          )}
        </div>
        {hasNextPage ? (
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              size="sm"
              className="w-full"
              variant="secondary"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
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
