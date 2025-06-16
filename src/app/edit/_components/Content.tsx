"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { toast } from "sonner";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import { useCanUploadState, useIsLrcConvertingState, useSetTabName, useTabNameState } from "../_lib/atoms/stateAtoms";
import { NOT_EDIT_PERMISSION_TOAST_ID, TAB_NAMES } from "../_lib/const";
import { useWindowKeydownEvent } from "../_lib/hooks/useKeyDown";
import { useTimerRegistration } from "../_lib/hooks/useTimer";
import useHasMapUploadPermission from "../_lib/hooks/useUserEditPermission";
import EditYouTube from "./EditYouTubePlayer";
import EditTable from "./map-table/EditTable";
import TabEditor from "./tab-panels/TabEditor";
import TabInfoForm from "./tab-panels/TabInfoForm";
import TabSettings from "./tab-panels/TabSettings";
import { TimeRangeAndSpeedChange } from "./TimeRangeAndSpeedChange";

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

  const windowKeydownEvent = useWindowKeydownEvent();
  useEffect(() => {
    window.addEventListener("keydown", windowKeydownEvent);
    return () => {
      window.removeEventListener("keydown", windowKeydownEvent);
    };
  }, [windowKeydownEvent]);

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
