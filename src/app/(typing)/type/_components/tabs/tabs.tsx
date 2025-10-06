"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_NAMES, useSetTabName, useTabNameState } from "../../_lib/atoms/state-atoms";
import { TabIcons } from "./tab-icon/tab-icons";
import { RankingTableCard } from "./tab-ranking/ranking-table-card";
import { StatusCard } from "./tab-status/status-table-card";

interface TabsAreaProps {
  className?: string;
}

export const TabsArea = ({ className }: TabsAreaProps) => {
  const tabName = useTabNameState();
  const setTabName = useSetTabName();

  return (
    <Tabs
      value={tabName}
      onValueChange={(value) => setTabName(value as (typeof TAB_NAMES)[number])}
      className={className}
      id="tabs-area"
    >
      <TabLists />
      <TabsContent value="ステータス" className="tab-card">
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
    <TabsList variant="underline" className="h-28 w-full bg-transparent pl-8 select-none md:h-9">
      {TAB_NAMES.map((name) => (
        <TabsTrigger
          variant="underline"
          className="flex max-sm:pb-5 max-w-96 md:max-w-50 flex-1 items-end text-5xl md:text-xl"
          key={name}
          value={name}
          onFocus={(e) => e.target.blur()}
        >
          {name}
        </TabsTrigger>
      ))}
      <div className="ml-auto">
        <TabIcons className="h-auto md:h-9" />
      </div>
    </TabsList>
  );
};
