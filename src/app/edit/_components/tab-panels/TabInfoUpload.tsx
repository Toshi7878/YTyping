"use client";
import { CardWithContent } from "@/components/ui/card";
import { toast } from "sonner";

import { NOT_EDIT_PERMISSION_TOAST_ID, TAG_MAX_LEN } from "@/app/edit/_lib/const";
import { useUploadMap } from "@/app/edit/_lib/hooks/useUploadMap";
import useHasMapUploadPermission from "@/app/edit/_lib/hooks/useUserEditPermission";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FloatingLabelInputFormField } from "@/components/ui/input/input-form-field";
import { TagInputFormField } from "@/components/ui/input/tag-input";
import Link from "@/components/ui/link/link";
import { UploadResult } from "@/types";
import { extractYouTubeVideoId } from "@/utils/extractYTId";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useGeminiQueries } from "@/utils/queries/gemini.queries";
import { useMapQueries } from "@/utils/queries/map.queries";
import { mapInfoFormSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSetVideoId, useSetYTChaningVideo, useVideoIdState } from "../../_lib/atoms/stateAtoms";
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import SuggestionTags from "./tab-info-child/SuggestionTags";
import UploadButton from "./tab-info-child/UploadButton";

const INITIAL_SERVER_ACTIONS_STATE: UploadResult = {
  id: null,
  title: "",
  message: "",
  status: 0,
};

const TabInfoUpload = () => {
  const searchParams = useSearchParams();
  const { id: mapId } = useParams();
  const isBackUp = searchParams.get("backup") === "true";
  const newCreateVideoId = searchParams.get("new");
  const hasUploadPermission = useHasMapUploadPermission();

  const { data: mapInfoData } = useSuspenseQuery(useMapQueries().mapInfo({ mapId: Number(mapId) }));
  const videoId = useVideoIdState();
  const setVideoId = useSetVideoId();
  const setYTChaningVideo = useSetYTChaningVideo();

  const {
    data: geminiInfoData,
    isFetching,
    error,
  } = useQuery(
    useGeminiQueries().generateMapInfo(
      { videoId: videoId ?? "" },
      { enabled: !!(videoId && !isBackUp && hasUploadPermission) },
    ),
  );

  const form = useForm<z.infer<typeof mapInfoFormSchema>>({
    resolver: zodResolver(mapInfoFormSchema),
    shouldUnregister: false,
    defaultValues: {
      title: mapInfoData?.title ?? "",
      artist_name: mapInfoData?.artist_name ?? "",
      music_source: mapInfoData?.music_source ?? "",
      preview_time: mapInfoData?.preview_time ?? "",
      creator_comment: mapInfoData?.creator_comment ?? "",
      tags: mapInfoData?.tags ?? ([] as string[]),
      video_id: mapInfoData?.video_id ?? "",
    },
  });
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (geminiInfoData) {
      const { title, artistName, source } = geminiInfoData;

      if (newCreateVideoId) {
        form.setValue("title", title);
        form.setValue("artist_name", artistName);
        form.setValue("music_source", source);
      }
    }
  }, [form, geminiInfoData, newCreateVideoId]);

  useEffect(() => {
    setVideoId(form.getValues("video_id"));
  }, [form, setVideoId]);

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

  const isGeminiLoading = isFetching && !!newCreateVideoId;
  const tags = form.watch("tags");
  const formVideoId = form.watch("video_id");
  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <Form {...form}>
        <form action={formAction} className="flex w-full flex-col items-baseline gap-4">
          <div className="flex w-full items-center gap-4">
            <FloatingLabelInputFormField
              name="video_id"
              label="動画ID"
              maxLength={11}
              onPaste={(e) => {
                e.preventDefault();

                const videoId = extractYouTubeVideoId(e.clipboardData.getData("text"));

                if (videoId) {
                  form.setValue("video_id", videoId);
                }
              }}
            />
            <Button
              variant="outline-info"
              disabled={!form.formState.dirtyFields.video_id || formVideoId.length !== 11}
              onClick={(e) => {
                e.preventDefault();
                if (formVideoId.length !== 11) return;

                setVideoId(form.getValues("video_id"));
                setYTChaningVideo(true);
              }}
            >
              動画切り替え
            </Button>
          </div>
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="title"
              label={isGeminiLoading ? "曲名を生成中..." : "曲名"}
              required
            />
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="artist_name"
              label={isGeminiLoading ? "アーティスト名を生成中..." : "アーティスト名"}
              required
            />
          </div>
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="music_source"
              label={isGeminiLoading ? "ソースを生成中..." : "ソース"}
            />
            <FloatingLabelInputFormField name="creator_comment" label="コメント" />
          </div>
          <TagInputFormField
            name="tags"
            maxTags={TAG_MAX_LEN}
            label={tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加 ${tags.length} / ${TAG_MAX_LEN}`}
          />
        </form>
        <SuggestionTags isGeminiLoading={isGeminiLoading} geminiTags={geminiInfoData?.otherTags ?? []} />
      </Form>
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
