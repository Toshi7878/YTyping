import { EditMapTable, NewMapTable } from "./map-table/map-table";
import { SpeedCounter } from "./playback/speed-counter";
import { TimeRange } from "./playback/time-range";
import { EditTabs } from "./tabs/tabs";
import { YouTubePlayer } from "./youtube-player";

export const Content = ({ type }: { type: "new" | "edit" }) => {
  return (
    <div className="mx-auto max-w-5xl xl:max-w-7xl">
      <section className="flex flex-col gap-2 lg:flex-row lg:gap-6">
        <YouTubePlayer className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
        <EditTabs />
      </section>
      <section className="my-1 grid grid-cols-[1fr_auto]">
        <TimeRange />
        <SpeedCounter />
      </section>

      {type === "new" ? <NewMapTable /> : <EditMapTable />}
    </div>
  );
};
