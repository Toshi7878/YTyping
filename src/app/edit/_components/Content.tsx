"use client";
import { useEffect } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useToast } from "@/hooks/use-toast";
import { usePathChangeAtomReset } from "../atoms/reset";
import { useCanUploadState, useIsLrcConvertingState } from "../atoms/stateAtoms";
import { useTimerRegistration } from "../hooks/useTimer";
import useHasMapUploadPermission from "../hooks/useUserEditPermission";
import EditTable from "./map-table/EditTable";
import { NOT_EDIT_PERMISSION_TOAST_ID } from "./tab/tab-panels/TabInfoUpload";
import EditorTabContent from "./tab/TabList";
import TimeRange from "./time-range/TimeRange";
import EditYouTube from "./youtube/EditYouTubePlayer";

function Content() {
  const isLrcConverting = useIsLrcConvertingState();

  const { addTimer, removeTimer } = useTimerRegistration();
  const pathChangeReset = usePathChangeAtomReset();
  const toast = useToast();
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();

  useEffect(() => {
    addTimer();
    return () => {
      removeTimer();
      pathChangeReset();
      toast.close(NOT_EDIT_PERMISSION_TOAST_ID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <LoadingOverlay
      active={isLrcConverting}
      spinner={true}
      text="Loading..."
      className="w-full xl:w-[90%] 2xl:w-[80%]"
    >
      <div className="mx-0 md:mx-auto pt-4 lg:pt-0">
        <section className="flex flex-col lg:flex-row w-full gap-2 lg:gap-6">
          <EditYouTube className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
          <EditorTabContent />
        </section>
        <section className="grid w-full my-1 grid-cols-[1fr_auto] gap-y-[1px] items-center">
          <TimeRange />
        </section>
        <section className="w-full">
          <EditTable />
        </section>
      </div>
    </LoadingOverlay>
  );
}

export default Content;
