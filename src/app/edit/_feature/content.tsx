import { EditMapTable, NewMapTable } from "./map-table/map-table";
import { EditTabs } from "./tabs/edit-tabs";
import { TimeRangeAndSpeedChange } from "./time-range-and-speed-change";
import { YouTubePlayer } from "./youtube-player";

export const Content = ({ type }: { type: "new" | "edit" }) => {
  return (
    <div className="mx-auto max-w-5xl xl:max-w-7xl">
      <section className="flex flex-col gap-2 lg:flex-row lg:gap-6">
        <YouTubePlayer className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
        <EditTabs />
      </section>
      <TimeRangeAndSpeedChange className="my-1 grid grid-cols-[1fr_auto]" />

      {type === "new" ? <NewMapTable /> : <EditMapTable />}
    </div>
  );
};
