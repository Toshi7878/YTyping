import { cn } from "@/lib/tailwind";
import { CardWithContent } from "@/ui/card";
import { StatusCell } from "./status-cell";

export type LabelType = "score" | "type" | "kpm" | "rank" | "point" | "miss" | "lost" | "line";

export const StatusCard = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      id="tab-status-card"
      className={{
        card: cn("tab-card", className),
        cardContent:
          "my-auto flex flex-col gap-8 overflow-hidden px-[6%] font-bold font-mono text-4xl sm:px-10 md:text-[2rem]",
      }}
    >
      <div className="flex justify-between">
        <StatusCell label="score" />
        <StatusCell label="type" />
        <StatusCell label="kpm" />
        <StatusCell label="rank" />
      </div>
      <div className="flex justify-between">
        <StatusCell label="point" />
        <StatusCell label="miss" />
        <StatusCell label="lost" />
        <StatusCell label="line" />
      </div>
    </CardWithContent>
  );
};
