"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { MapList } from "@/shared/map/list/list";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { UserBookmarkLists } from "./bookmark-lists/list";
import { UserPlaySummary } from "./play-summary/summary";
import { UserTopPpList } from "./play-summary/top-pp-list";
import { ResultSummary } from "./result-list/result-summary";
import { UserResultList } from "./result-list/user-result-list";
import { type TABS, useTabQueryState } from "./search-params";

const TAB_VALUES = ["stats", "maps", "results", "liked", "bookmarks"] satisfies (typeof TABS)[number][];

export const UserTabs = ({ id }: { id: string }) => {
  const t = useTranslations("user.tabs");
  const [tab, setTab] = useTabQueryState();

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as (typeof TABS)[number])}>
      <TabsList variant="underline" className="flex h-fit w-full flex-wrap">
        {TAB_VALUES.map((value) => (
          <TabsTrigger key={value} value={value} variant="underline">
            {value === "maps" ? (
              <MapTabLabelWithCount id={id} />
            ) : value === "liked" ? (
              <LikedMapTabLabelWithCount id={id} />
            ) : value === "results" ? (
              <ResultTabLabelWithCount id={id} />
            ) : value === "bookmarks" ? (
              <BookmarkTabLabelWithCount id={id} />
            ) : (
              t(value)
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
        <UserResultList userId={id} />
      </TabsContent>
      <TabsContent value="liked">
        <MapList filterParams={{ likerId: Number(id) }} sortParams={{ type: "like", isDesc: true }} />
      </TabsContent>
    </Tabs>
  );
};

const MapTabLabelWithCount = ({ id }: { id: string }) => {
  const t = useTranslations("user.tabs");
  const { data: mapCount } = useSuspenseQuery(
    orpc.map.list.getCount.queryOptions({ input: { creatorId: Number(id) } }),
  );
  return <LabelWithCount label={t("maps")} count={mapCount} />;
};

const LikedMapTabLabelWithCount = ({ id }: { id: string }) => {
  const t = useTranslations("user.tabs");
  const { data: mapCount } = useSuspenseQuery(orpc.map.list.getCount.queryOptions({ input: { likerId: Number(id) } }));
  return <LabelWithCount label={t("liked")} count={mapCount} />;
};

const ResultTabLabelWithCount = ({ id }: { id: string }) => {
  const t = useTranslations("user.tabs");
  const { data: resultCount } = useSuspenseQuery(
    orpc.result.list.getCount.queryOptions({ input: { playerId: Number(id) } }),
  );

  return <LabelWithCount label={t("results")} count={resultCount} />;
};

const BookmarkTabLabelWithCount = ({ id }: { id: string }) => {
  const t = useTranslations("user.tabs");
  const { data: bookmarkCount } = useSuspenseQuery(
    orpc.map.bookmark.lists.getCount.queryOptions({ input: { userId: Number(id) } }),
  );
  return <LabelWithCount label={t("bookmarks")} count={bookmarkCount} />;
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
