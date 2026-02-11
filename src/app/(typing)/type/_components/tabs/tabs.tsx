"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setTabName, TAB_NAMES, useTabNameState } from "../../_lib/atoms/state";
import { MapActionIconButtons } from "./tab-icon/action-icon-buttons";
import { RankingTableCard } from "./tab-ranking/ranking-table-card";
import { StatusCard } from "./tab-status/status-table-card";

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
        <StatusCard className="h-96 md:h-56" />
      </TabsContent>

      <TabsContent value="ランキング" className="tab-card">
        <RankingTableCard className="h-96 md:h-56" />
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
