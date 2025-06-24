import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_NAMES, useSetTabName, useTabNameState } from "../../_lib/atoms/stateAtoms";
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
        <TabStatusCard className="min-h-[322px] md:min-h-[208px]" />
      </TabsContent>

      <TabsContent value="ランキング">
        <TabRanking className="min-h-[354px] md:min-h-[236px]" />
      </TabsContent>
    </Tabs>
  );
}

const TabLists = () => {
  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.target.blur();
  };

  return (
    <TabsList className="w-full">
      {TAB_NAMES.map((name) => (
        <TabsTrigger key={name} value={name} onFocus={handleFocus}>
          {name}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
