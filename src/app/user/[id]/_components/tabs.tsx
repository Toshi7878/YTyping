"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/provider";
import { type TABS, useTabQueryState } from "../_lib/search-params";
import { UserBookmarkLists } from "./bookmark-lists";
import { UserCreatedMapList, UserLikedMapList } from "./map-list";
import { UserResultList } from "./user-result-list";
import { UserStatsCard } from "./user-stats/card";

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
      <TabsContent value="stats">
        <UserStatsCard />
      </TabsContent>
      <TabsContent value="bookmarks">
        <UserBookmarkLists id={id} />
      </TabsContent>
      <TabsContent value="maps">
        <UserCreatedMapList id={id} />
      </TabsContent>
      <TabsContent value="results">
        <UserResultList id={id} />
      </TabsContent>
      <TabsContent value="liked">
        <UserLikedMapList id={id} />
      </TabsContent>
    </Tabs>
  );
};

const MapTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: mapCount } = useSuspenseQuery(trpc.mapList.getCount.queryOptions({ creatorId: Number(id) }));
  return <LabelWithCount label="制作譜面" count={mapCount} />;
};

const LikedMapTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: mapCount } = useSuspenseQuery(trpc.mapList.getCount.queryOptions({ likerId: Number(id) }));
  return <LabelWithCount label="いいねした譜面" count={mapCount} />;
};

const ResultTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: resultCount } = useSuspenseQuery(
    trpc.resultList.getWithMapCount.queryOptions({ playerId: Number(id) }),
  );

  return <LabelWithCount label="ランキング履歴" count={resultCount} />;
};

const BookmarkTabLabelWithCount = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: bookmarkCount } = useSuspenseQuery(trpc.bookmarkList.getCount.queryOptions({ userId: Number(id) }));
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
