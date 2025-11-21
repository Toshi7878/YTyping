"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCreatorIdState } from "../_lib/atoms/hydrate";
import { hasMapUploadPermission } from "../_lib/map-table/has-map-upload-permission";
import { MapTable } from "./map-table/map-table";
import { EditTabs } from "./tabs/edit-tabs";
import { TimeRangeAndSpeedChange } from "./time-range-and-speed-change";
import { YouTubePlayer } from "./youtube-player";

const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

export const Content = () => {
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  useEffect(() => {
    if (!hasUploadPermission) {
      requestAnimationFrame(() => {
        toast.warning("編集保存権限がないため譜面の更新はできません", {
          id: NOT_EDIT_PERMISSION_TOAST_ID,
          duration: Infinity,
        });
      });
    }

    return () => {
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    };
  }, [hasUploadPermission]);

  return (
    <div className="mx-auto max-w-5xl xl:max-w-7xl">
      <section className="flex flex-col gap-2 lg:flex-row lg:gap-6">
        <YouTubePlayer className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
        <EditTabs />
      </section>
      <TimeRangeAndSpeedChange className="my-1 grid grid-cols-[1fr_auto]" />

      <MapTable />
    </div>
  );
};
