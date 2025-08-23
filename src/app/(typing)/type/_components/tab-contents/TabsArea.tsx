"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_NAMES, useSetTabName, useTabNameState } from "../../_lib/atoms/stateAtoms";
import TabIcons from "./child/TabIcons";
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
    <TabsList variant="underline" className="flex w-full pl-8">
      {TAB_NAMES.map((name) => (
        <TabsTrigger variant="underline" className="max-w-50 flex-1" key={name} value={name} onFocus={handleFocus}>
          {name}
        </TabsTrigger>
      ))}
      <div className="ml-auto">
        <TabIcons />
      </div>
    </TabsList>
  );
};
