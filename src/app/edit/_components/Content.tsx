import MapTable from "./map-table/map-table";
import EditTabs from "./tabs/Tabs";
import { TimeRangeAndSpeedChange } from "./TimeRangeAndSpeedChange";
import YouTubePlayer from "./youtube-player";

function Content() {
  return (
    <div className="mx-auto max-w-screen-lg xl:max-w-screen-xl">
      <section className="flex flex-col gap-2 lg:flex-row lg:gap-6">
        <YouTubePlayer className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
        <EditTabs />
      </section>
      <TimeRangeAndSpeedChange className="my-1 grid grid-cols-[1fr_auto]" />

      <MapTable />
    </div>
  );
}

export default Content;
