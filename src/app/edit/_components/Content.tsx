"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { toast } from "sonner";
import { usePathChangeAtomReset } from "../atoms/reset";
import { useCanUploadState, useIsLrcConvertingState, useSetTabName, useTabNameState } from "../atoms/stateAtoms";
import { useTimerRegistration } from "../hooks/useTimer";
import useHasMapUploadPermission from "../hooks/useUserEditPermission";
import { NOT_EDIT_PERMISSION_TOAST_ID, TAB_NAMES } from "../ts/const";
import EditTable from "./map-table/EditTable";
import TabEditor from "./tab/tab-panels/TabEditor";
import TabInfoUpload from "./tab/tab-panels/TabInfoUpload";
import TabSettings from "./tab/tab-panels/TabSettings";
import TimeRange from "./time-range/TimeRange";
import EditYouTube from "./youtube/EditYouTubePlayer";

function Content() {
  const isLrcConverting = useIsLrcConvertingState();

  const { addTimer, removeTimer } = useTimerRegistration();
  const pathChangeReset = usePathChangeAtomReset();
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();
  const pathname = usePathname();

  useEffect(() => {
    addTimer();
    return () => {
      removeTimer();
      pathChangeReset();
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (canUpload) {
        event.preventDefault();
        return "このページを離れると、行った変更が保存されない可能性があります。";
      }
    };

    if (hasUploadPermission) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canUpload, hasUploadPermission]);

  return (
    <LoadingOverlayWrapper active={isLrcConverting} spinner={true} text="Loading..." className="m-auto w-full">
      <div className="mx-0 pt-4 md:mx-auto lg:pt-0">
        <section className="flex w-full flex-col gap-2 lg:flex-row lg:gap-6">
          <EditYouTube className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
          <EditTabs />
        </section>
        <section className="my-1 grid w-full grid-cols-[1fr_auto] items-center gap-y-[1px]">
          <TimeRange />
        </section>
        <section className="w-full">
          <EditTable />
        </section>
      </div>
    </LoadingOverlayWrapper>
  );
}

function EditTabs() {
  const tabName = useTabNameState();
  const setTabName = useSetTabName();

  return (
    <Tabs value={tabName} onValueChange={(value) => setTabName(value as (typeof TAB_NAMES)[number])}>
      <TabsList className="grid h-[25px] w-full grid-cols-3 px-0 md:px-8">
        {TAB_NAMES.map((name, index) => {
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

      <TabsContent value="情報&保存">
        <TabInfoUpload className="max-w-xl" />
      </TabsContent>

      <TabsContent value="エディター">
        <TabEditor className="max-w-xl" />
      </TabsContent>

      <TabsContent value="ショートカットキー&設定">
        <TabSettings className="max-w-xl" />
      </TabsContent>
    </Tabs>
  );
}

export default Content;
