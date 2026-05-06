"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapList } from "@/shared/map/list/list";
import { ResultList } from "@/shared/result/list/list";
import { useTRPC } from "@/trpc/provider";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { UserBookmarkLists } from "./bookmark-lists/list";
import { UserPlaySummary } from "./play-summary/summary";
import { UserTopPpList } from "./play-summary/top-pp-list";
import { ResultSummary } from "./result-list/result-summary";
import { type TABS, useTabQueryState } from "./search-params";

const TAB_OPTIONS = [
  { label: "タイピング統計情報", value: "stats" },
  { label: "制作譜面", value: "maps" },
  { label: "ランキング履歴", value: "results" },
  { label: "いいねした譜面", value: "liked" },
  { label: "ブックマークリスト", value: "bookmarks" },
] satisfies { label: string; value: (typeof TABS)[number] }[];

export const UserTabs = ({ id }: { id: string }) => {
  const [tab, setTab] = useTabQueryState();

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as (typeof TABS)[number])}>
      <TabsList variant="underline" className="flex h-fit w-full flex-wrap">
        {TAB_OPTIONS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} variant="underline">
            {tab.value === "maps" ? (
              <MapTabLabelWithCount id={id} />
            ) : tab.value === "liked" ? (
              <LikedMapTabLabelWithCount id={id} />
            ) : tab.value === "results" ? (
              <ResultTabLabelWithCount id={id} />
            ) : tab.value === "bookmarks" ? (
              <BookmarkTabLabelWithCount id={id} />
            ) : (
              tab.label
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="stats" className="space-y-6">
        <UserTopPpList id={id} />
        <UserPlaySummary id={id} />
      </TabsContent>
      <TabsContent value="bookmarks">
        <UserBookmarkLists id={id} />
      </TabsContent>
      <TabsContent value="maps">
        <MapList filterParams={{ creatorId: Number(id) }} />
      </TabsContent>
      <TabsContent value="results" className="space-y-2">
        <ResultSummary userId={id} />
        <ResultList filterParams={{ playerId: Number(id) }} />
      </TabsContent>
      <TabsContent value="liked">
        <MapList filterParams={{ likerId: Number(id) }} sortParams={{ type: "like", isDesc: true }} />
      </TabsContent>
    </Tabs>
  );
};

const MapTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: mapCount } = useSuspenseQuery(trpc.map.list.getCount.queryOptions({ creatorId: Number(id) }));
  return <LabelWithCount label="制作譜面" count={mapCount} />;
};

const LikedMapTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: mapCount } = useSuspenseQuery(trpc.map.list.getCount.queryOptions({ likerId: Number(id) }));
  return <LabelWithCount label="いいねした譜面" count={mapCount} />;
};

const ResultTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: resultCount } = useSuspenseQuery(trpc.result.list.getCount.queryOptions({ playerId: Number(id) }));

  return <LabelWithCount label="ランキング履歴" count={resultCount} />;
};

const BookmarkTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: bookmarkCount } = useSuspenseQuery(
    trpc.map.bookmark.lists.getCount.queryOptions({ userId: Number(id) }),
  );
  return <LabelWithCount label="ブックマークリスト" count={bookmarkCount} />;
};

const LabelWithCount = ({ label, count }: { label: string; count: number }) => {
  return (
    <div className="flex items-center gap-1.5">
      <span>{label}</span>
      <Badge variant="accent-dark" className="h-4.5 rounded-full px-2 text-xs">
        {count}
      </Badge>
    </div>
  );
};
