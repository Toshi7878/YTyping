import EditYouTube from "./EditYouTubePlayer";
import EditTable from "./map-table/EditTable";
import EditTabs from "./tabs/Tabs";
import { TimeRangeAndSpeedChange } from "./TimeRangeAndSpeedChange";

function Content() {
  return (
    <div className="mx-auto max-w-screen-lg xl:max-w-screen-xl">
      <section className="flex flex-col gap-2 lg:flex-row lg:gap-6">
        <EditYouTube className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
        <EditTabs />
      </section>
      <TimeRangeAndSpeedChange className="my-1 grid grid-cols-[1fr_auto]" />

      <EditTable />
    </div>
  );
}

export default Content;
