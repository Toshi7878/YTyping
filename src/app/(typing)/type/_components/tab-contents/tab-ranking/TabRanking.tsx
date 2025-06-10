import { Card, CardContent } from "@/components/ui/card";
import { ComponentProps } from "react";
import RankingList from "./child/RankingList";

const TabRanking = (props: ComponentProps<"div"> & { minH?: string | number }) => {
  return (
    <Card className="tab-card">
      <CardContent className="w-full pt-1 pb-2 text-3xl font-bold">
        <div
          className="scrollbar-thin scrollbar-thumb-foreground/60 scrollbar-track-transparent overflow-y-scroll"
          style={{
            minHeight: props.minH,
            maxHeight: props.minH,
          }}
        >
          <RankingList />
        </div>
      </CardContent>
    </Card>
  );
};

export default TabRanking;
