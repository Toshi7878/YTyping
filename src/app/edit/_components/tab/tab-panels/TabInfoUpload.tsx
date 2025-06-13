import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useSetGeminiTags, useSetMapInfo, useVideoIdState } from "@/app/edit/atoms/stateAtoms";
import useHasMapUploadPermission from "@/app/edit/hooks/useUserEditPermission";
import { useUploadMap } from "@/app/edit/hooks/utils/useUploadMap";
import { INITIAL_SERVER_ACTIONS_STATE } from "@/app/edit/ts/const/editDefaultValues";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useGeminiQueries } from "@/utils/queries/gemini.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import InfoInputForm from "./tab-info-child/InfoInputFrom";
import InfoTag from "./tab-info-child/InfoTag";
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import TypeLinkButton from "./tab-info-child/TypeLinkButton";
import UploadButton from "./tab-info-child/UploadButton";

export const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

const TabInfoUpload = () => {
  const customToast = useCustomToast();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const videoId = useVideoIdState();
  const { id: mapId } = useParams();
  const isBackUp = searchParams.get("backup") === "true";
  const hasUploadPermission = useHasMapUploadPermission();
  const {
    data: mapInfoData,
    isFetching,
    error,
  } = useQuery(useGeminiQueries().generateMapInfo({ videoId }, { enabled: !isBackUp && hasUploadPermission }));

  const setGeminiTags = useSetGeminiTags();
  const setMapInfo = useSetMapInfo();

  useEffect(() => {
    if (error) {
      customToast({ type: "error", title: error.message });
    }
  }, [error, customToast]);

  useEffect(() => {
    if (mapInfoData) {
      const { title, artistName, source, otherTags } = mapInfoData;

      if (isNewCreate) {
        setMapInfo({ title, artistName, source });
      }

      setGeminiTags(otherTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfoData]);

  const upload = useUploadMap();

  const [state, formAction] = useActionState(upload, INITIAL_SERVER_ACTIONS_STATE);

  useEffect(() => {
    if (!hasUploadPermission) {
      toast.warning("編集保存権限がないため譜面の更新はできません", {
        id: NOT_EDIT_PERMISSION_TOAST_ID,
        duration: Infinity,
      });
    } else {
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    }
  }, [hasUploadPermission]);

  return (
    <Card className="bg-card shadow-lg text-foreground">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <InfoInputForm isGeminiLoading={isFetching && isNewCreate} />
          <InfoTag isGeminiLoading={isFetching} />
          <div className="flex justify-between">
            {hasUploadPermission ? (
              <form
                action={formAction}
                className="flex gap-4 items-baseline flex-col lg:flex-row"
              >
                <UploadButton state={state} />
                {mapId ? <TypeLinkButton /> : ""}
              </form>
            ) : (
              mapId && <TypeLinkButton />
            )}
            <PreviewTimeInput />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabInfoUpload;
