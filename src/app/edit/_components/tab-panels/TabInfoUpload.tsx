"use client";
import { CardWithContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useEditUtilsParams, usePlayer } from "@/app/edit/_lib/atoms/refAtoms";
import { NOT_EDIT_PERMISSION_TOAST_ID, TAG_MAX_LEN } from "@/app/edit/_lib/const";
import { useUploadMap } from "@/app/edit/_lib/hooks/useUploadMap";
import useHasMapUploadPermission from "@/app/edit/_lib/hooks/useUserEditPermission";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FloatingLabelInputFormField } from "@/components/ui/input/input-form-field";
import { TagInputFormField } from "@/components/ui/input/tag-input";
import Link from "@/components/ui/link/link";
import { TooltipWrapper } from "@/components/ui/tooltip";
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
import { useForm, useFormContext } from "react-hook-form";
import { FaPlay } from "react-icons/fa";
import z from "zod";
import { useCanUploadState, useSetVideoId, useSetYTChaningVideo, useVideoIdState } from "../../_lib/atoms/stateAtoms";
import SuggestionTags from "./tab-info-child/SuggestionTags";

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
  const canUpload = useCanUploadState();

  const { data: mapInfoData } = useSuspenseQuery(useMapQueries().mapInfo({ mapId: Number(mapId) }));
  const videoId = useVideoIdState();
  const setVideoId = useSetVideoId();

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

  const [state, formAction] = useActionState(upload, null);

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
  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <Form {...form}>
        <form action={formAction} className="flex w-full flex-col items-baseline gap-4">
          <div className="flex w-full items-center gap-4">
            <VideoIdInput />
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
          <SuggestionTags isGeminiLoading={isGeminiLoading} geminiTags={geminiInfoData?.otherTags ?? []} />

          <div className="flex w-full flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
            <InfoFormButton />
            <PreviewTimeInput />
          </div>
        </form>
      </Form>
    </CardWithContent>
  );
};

const InfoFormButton = () => {
  const form = useFormContext();
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();
  const { id: mapId } = useParams();

  return (
    <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
      {hasUploadPermission && (
        <Button size="xl" disabled={!form.formState.isDirty && !canUpload} className="w-52">
          {form.formState.isSubmitting ? "保存中..." : "保存"}
        </Button>
      )}

      {mapId && <TypeLinkButton />}
    </div>
  );
};

const VideoIdInput = () => {
  const form = useFormContext();
  const formVideoId = form.watch("video_id");
  const setVideoId = useSetVideoId();
  const setYTChaningVideo = useSetYTChaningVideo();

  return (
    <TooltipWrapper label="動画URLを貼り付けるとIDが自動入力されます">
      <div className="flex-center flex gap-4">
        <FloatingLabelInputFormField
          name="video_id"
          className="w-32"
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
          size="lg"
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
    </TooltipWrapper>
  );
};

const PreviewTimeInput = () => {
  const { readPlayer } = usePlayer();
  const { writeEditUtils } = useEditUtilsParams();
  const form = useFormContext();
  const previewTime = form.watch("preview_time");

  const handlePreviewClick = () => {
    writeEditUtils({ preventAutoTabToggle: true });
    readPlayer().playVideo();
    readPlayer().seekTo(Number(previewTime), true);
  };

  return (
    <TooltipWrapper
      label={
        <>
          <div>
            譜面一覧でのプレビュー再生時に入力されているタイムから再生されるようになります。(サビのタイム推奨です)
          </div>
          <div>※ 小さい数値を指定すると最初のタイピングワードが存在するタイムが設定されます。</div>
          <div>↑↓キー: 0.05ずつ調整, Enter:再生</div>
        </>
      }
    >
      <div className="flex flex-row items-center gap-3">
        <div>
          <FloatingLabelInputFormField
            name="preview_time"
            label="プレビュータイム"
            className="w-36"
            type="number"
            step="0.05"
            min="0"
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePreviewClick();
              }
            }}
          />
        </div>

        <Button className="shrink-0" type="button" onClick={handlePreviewClick} variant="ghost" size="icon">
          <FaPlay size={15} />
        </Button>
      </div>
    </TooltipWrapper>
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
