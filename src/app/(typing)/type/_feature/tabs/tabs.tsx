"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setTabName, TAB_NAMES, useTabNameState } from "../atoms/state";
import { MapActionIconButtons } from "./action-buttons";
import { RankingTableCard } from "./ranking/ranking-card";
import { StatusCard } from "./typing-status/status-card";

interface TabsAreaProps {
  className?: string;
}

export const TabsArea = ({ className }: TabsAreaProps) => {
  const tabName = useTabNameState();

  return (
    <Tabs
      value={tabName}
      onValueChange={(value) => setTabName(value as (typeof TAB_NAMES)[number])}
      className={className}
      id="tabs-area"
    >
      <TabLists />
      <TabsContent forceMount value="ステータス" className="tab-card">
        <StatusCard className="h-80 md:h-56" />
      </TabsContent>

      <TabsContent value="ランキング" className="tab-card">
        <RankingTableCard className="h-80 md:h-56" />
      </TabsContent>
    </Tabs>
  );
};

const TabLists = () => {
  return (
    <TabsList variant="underline" className="h-28 w-full select-none bg-transparent pl-8 md:h-9">
      {TAB_NAMES.map((name) => (
        <TabsTrigger
          variant="underline"
          className="flex max-w-80 flex-1 items-end text-5xl max-md:pb-5 md:max-w-50 md:text-xl"
          key={name}
          value={name}
          onFocus={(e) => e.target.blur()}
        >
          {name}
        </TabsTrigger>
      ))}

      <MapActionIconButtons className="ml-auto h-auto md:h-9" />
    </TabsList>
  );
};
