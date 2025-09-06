"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_NAMES, useSetTabName, useTabNameState } from "../../_lib/atoms/stateAtoms";
import TabIcons from "./tab-icon/TabIcons";
import TabRanking from "./tab-ranking/TabRanking";
import TabStatusCard from "./tab-status/TabStatusCard";

interface TabsAreaProps {
  className?: string;
}

export default function TabsArea({ className }: TabsAreaProps) {
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
      <TabsContent value="ステータス">
        <TabStatusCard className="h-56" />
      </TabsContent>

      <TabsContent value="ランキング">
        <TabRanking className="h-56" />
      </TabsContent>
    </Tabs>
  );
}

const TabLists = () => {
  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.target.blur();
  };

  return (
    <TabsList variant="underline" className="h-auto w-full bg-transparent pl-8 md:h-9">
      {TAB_NAMES.map((name) => (
        <TabsTrigger
          variant="underline"
          className="flex max-w-50 flex-1 items-end"
          key={name}
          value={name}
          onFocus={handleFocus}
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
