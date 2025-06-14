import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSetTabIndex, useTabIndexState } from "../../atoms/stateAtoms";
import TabIcons from "./child/TabIcons";
import TabLists from "./child/TabLists";
import TabRanking from "./tab-ranking/TabRanking";
import TabStatusCard from "./tab-status/TabStatusCard";

interface TypeTabContentProps {
  className?: string;
}

export default function TypeTabContent({ className }: TypeTabContentProps) {
  const tabIndex = useTabIndexState();
  const setTabIndex = useSetTabIndex();

  const statusHeight = 208;
  const rankingHeight = 236;

  return (
    <Tabs
      value={tabIndex === 0 ? "status" : "ranking"}
      onValueChange={(value) => setTabIndex(value === "status" ? 0 : 1)}
      className={className}
    >
      <div
        className="flex justify-between w-full select-none"
        style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.33)` }}
      >
        <TabLists tabIndex={tabIndex} />
        <TabIcons />
      </div>

      <TabsContent value="status" className="px-0">
        <TabStatusCard
          className="min-h-[322px] md:min-h-[208px]"
          style={{ minHeight: `${statusHeight}px` }}
        />
      </TabsContent>

      <TabsContent value="ranking" className="px-0">
        <TabRanking
          className="min-h-[354px] md:min-h-[236px]"
          style={{ minHeight: `${rankingHeight}px` }}
        />
      </TabsContent>
    </Tabs>
  );
}
