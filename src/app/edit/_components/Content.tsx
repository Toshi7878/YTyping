"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useIsLrcConvertingState, useSetTabName, useTabNameState } from "../_lib/atoms/stateAtoms";
import { TAB_NAMES } from "../_lib/const";
import EditYouTube from "./EditYouTubePlayer";
import EditTable from "./map-table/EditTable";
import TabEditor from "./tab-panels/TabEditor";
import TabInfoForm from "./tab-panels/TabInfoForm";
import TabSettings from "./tab-panels/TabSettings";
import { TimeRangeAndSpeedChange } from "./TimeRangeAndSpeedChange";

function Content() {
  const isLrcConverting = useIsLrcConvertingState();

  return (
    <LoadingOverlayWrapper active={isLrcConverting} spinner={true} text="Loading..." className="m-auto w-full">
      <div className="mx-0 pt-4 md:mx-auto lg:pt-0">
        <section className="flex w-full flex-col gap-2 lg:flex-row lg:gap-6">
          <EditYouTube className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
          <EditTabs />
        </section>
        <TimeRangeAndSpeedChange className="my-1 grid grid-cols-[1fr_auto]" />

        <EditTable />
      </div>
    </LoadingOverlayWrapper>
  );
}

function EditTabs() {
  const tabName = useTabNameState();
  const setTabName = useSetTabName();

  return (
    <Tabs value={tabName} onValueChange={(value) => setTabName(value as (typeof TAB_NAMES)[number])} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {TAB_NAMES.map((name) => {
          return (
            <TabsTrigger
              key={name}
              value={name}
              className={`truncate ${tabName === name ? "opacity-100" : "opacity-50"}`}
            >
              {name}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="情報&保存" forceMount>
        <TabInfoForm />
      </TabsContent>

      <TabsContent value="エディター" forceMount>
        <TabEditor />
      </TabsContent>

      <TabsContent value="ショートカットキー&設定">
        <TabSettings />
      </TabsContent>
    </Tabs>
  );
}

export default Content;
