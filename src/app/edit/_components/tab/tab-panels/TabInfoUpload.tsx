import { CardWithContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useSetGeminiTags, useSetMapInfo, useVideoIdState } from "@/app/edit/atoms/stateAtoms";
import useHasMapUploadPermission from "@/app/edit/hooks/useUserEditPermission";
import { useUploadMap } from "@/app/edit/hooks/utils/useUploadMap";
import { INITIAL_SERVER_ACTIONS_STATE, NOT_EDIT_PERMISSION_TOAST_ID } from "@/app/edit/ts/const";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link/link";
import { cn } from "@/lib/utils";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useGeminiQueries } from "@/utils/queries/gemini.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import InfoInputForm from "./tab-info-child/InfoInputFrom";
import InfoTag from "./tab-info-child/InfoTag";
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import UploadButton from "./tab-info-child/UploadButton";

const TabInfoUpload = ({ className }: { className: string }) => {
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
    <CardWithContent className={cn("py-3", className)}>
      <div className="flex flex-col gap-6">
        <InfoInputForm isGeminiLoading={isFetching && isNewCreate} />
        <InfoTag isGeminiLoading={isFetching} />
        <div className="flex justify-between">
          {hasUploadPermission ? (
            <form action={formAction} className="flex flex-col items-baseline gap-4 xl:flex-row">
              <UploadButton state={state} />
              {mapId ? <TypeLinkButton /> : ""}
            </form>
          ) : (
            mapId && <TypeLinkButton />
          )}
          <PreviewTimeInput />
        </div>
      </div>
    </CardWithContent>
  );
};

const TypeLinkButton = () => {
  const { id } = useParams();
  const handleLinkClick = useLinkClick();

  return (
    <Link href={`/type/${id}`} onClick={handleLinkClick}>
      <Button size="default" variant="outline">
        タイピングページに移動
      </Button>
    </Link>
  );
};

export default TabInfoUpload;
