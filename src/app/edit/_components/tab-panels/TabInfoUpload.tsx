"use client";
import { CardWithContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useSetGeminiTags, useVideoIdState } from "@/app/edit/_lib/atoms/stateAtoms";
import { NOT_EDIT_PERMISSION_TOAST_ID } from "@/app/edit/_lib/const";
import { useUploadMap } from "@/app/edit/_lib/hooks/useUploadMap";
import useHasMapUploadPermission from "@/app/edit/_lib/hooks/useUserEditPermission";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FloatingLabelInputFormField } from "@/components/ui/input/input-form-field";
import { TagInputFormField } from "@/components/ui/input/tag-input";
import Link from "@/components/ui/link/link";
import { UploadResult } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
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
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import UploadButton from "./tab-info-child/UploadButton";
import SuggestionTags from "./tab-info-child/child/SuggestionTags";

const INITIAL_SERVER_ACTIONS_STATE: UploadResult = {
  id: null,
  title: "",
  message: "",
  status: 0,
};

const TabInfoUpload = () => {
  const customToast = useCustomToast();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const videoId = useVideoIdState();
  const { id: mapId } = useParams();
  const isBackUp = searchParams.get("backup") === "true";
  const hasUploadPermission = useHasMapUploadPermission();
  const {
    data: geminiInfoData,
    isFetching,
    error,
  } = useQuery(useGeminiQueries().generateMapInfo({ videoId }, { enabled: !isBackUp && hasUploadPermission }));
  const { data: mapInfoData } = useSuspenseQuery(useMapQueries().mapInfo({ mapId: Number(mapId) }));

  const form = useForm<z.infer<typeof mapInfoFormSchema>>({
    resolver: zodResolver(mapInfoFormSchema),
    defaultValues: {
      title: mapInfoData?.title ?? "",
      artistName: mapInfoData?.artist_name ?? "",
      source: mapInfoData?.music_source ?? "",
      previewTime: mapInfoData?.preview_time ?? "",
      comment: mapInfoData?.creator_comment ?? "",
      tags: mapInfoData?.tags ?? [],
      videoId: mapInfoData?.video_id ?? "",
    },
  });
  const tags = form.watch("tags");

  const setGeminiTags = useSetGeminiTags();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (geminiInfoData) {
      const { title, artistName, source, otherTags } = geminiInfoData;

      if (isNewCreate) {
        form.setValue("title", title);
        form.setValue("artistName", artistName);
        form.setValue("source", source);
      }

      setGeminiTags(otherTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geminiInfoData]);

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

  const isGeminiLoading = isFetching && isNewCreate;
  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <Form {...form}>
        <form action={formAction} className="flex w-full flex-col items-baseline gap-4">
          <FloatingLabelInputFormField name="videoId" label="動画ID" required />
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="title"
              label={isGeminiLoading ? "曲名を生成中..." : "曲名"}
              required
            />
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="artistName"
              label={isGeminiLoading ? "アーティスト名を生成中..." : "アーティスト名"}
              required
            />
          </div>
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="source"
              label={isGeminiLoading ? "ソースを生成中..." : "ソース"}
            />
            <FloatingLabelInputFormField name="comment" label="コメント" />
          </div>
          <TagInputFormField name="tags" label={tags.length <= 1 ? "タグを2つ以上追加してください" : "タグを追加"} />
          {/* <FloatingLabelInputFormField name="previewTime" label="プレビュー時間" required /> */}
        </form>
        <SuggestionTags isGeminiLoading={isGeminiLoading} />
      </Form>
      {/* <InfoInputForm isGeminiLoading={isFetching && isNewCreate} /> */}
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
