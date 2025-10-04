"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCreatedMapList, UserLikedMapList } from "./map-list";
import { UserResultList } from "./user-result-list";
import { UserStatsCard } from "./user-stats/card";

const tabs = [
  {
    label: "タイピング統計情報",
    value: "stats",
  },
  {
    label: "制作譜面",
    value: "maps",
  },
  {
    label: "ランキング履歴",
    value: "results",
  },
  {
    label: "いいねした譜面",
    value: "liked",
  },
];

export const UserTabs = ({ id }: { id: string }) => {
  const [tab, setTab] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (tabs.some((t) => t.value === hash)) {
      setTab(hash);
    } else {
      setTab("stats");
    }
  }, []);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value);
        window.history.replaceState(null, "", `#${value}`);
      }}
    >
      <TabsList variant="underline" className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} variant="underline">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tab && (
        <>
          <TabsContent value="stats">
            <UserStatsCard />
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
        </>
      )}
      ;
    </Tabs>
  );
};
