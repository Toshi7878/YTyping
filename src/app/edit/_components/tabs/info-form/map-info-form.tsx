"use client";
import { CardWithContent } from "@/components/ui/card";

import { usePlayer, useSetPreventEditortabAutoFocus } from "@/app/edit/_lib/atoms/refAtoms";
import { TAG_MAX_LEN } from "@/app/edit/_lib/const";
import useHasMapUploadPermission from "@/app/edit/_lib/hooks/useHasMapUploadPermission";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FloatingLabelInputFormField } from "@/components/ui/input/input-form-field";
import { TagInputFormField } from "@/components/ui/input/tag-input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { backupMap, backupMapInfo, clearBackupMapWithInfo } from "@/lib/indexed-db";
import { useTRPC } from "@/trpc/provider";
import { BuildMap } from "@/utils/build-map/buildMap";
import { extractYouTubeVideoId } from "@/utils/extractYTId";
import { useDebounce } from "@/utils/hooks/useDebounce";
import { useGeminiQueries } from "@/utils/queries/gemini.queries";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useNavigationGuard } from "@/utils/use-navigation-guard";
import { mapInfoFormSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { FaPlay } from "react-icons/fa";
import { toast } from "sonner";
import z from "zod";
import { useMapReducer, useReadMap } from "../../../_lib/atoms/mapReducerAtom";
import {
  useCanUploadState,
  useReadEditUtils,
  useSetCanUpload,
  useSetVideoId,
  useSetYTChaningVideo,
  useVideoIdState,
} from "../../../_lib/atoms/stateAtoms";
import { getThumbnailQuality } from "../../../_lib/ts/getThumbailQuality";
import SuggestionTags from "./SuggestionTags";

const MapInfoForm = () => {
  const searchParams = useSearchParams();
  const { id: mapId } = useParams<{ id: string }>();
  const isBackUp = searchParams.get("backup") === "true";
  const newCreateVideoId = searchParams.get("new");
  const hasUploadPermission = useHasMapUploadPermission();

  const { data: mapInfoData } = useQuery({
    ...useMapQueries().mapInfo({ mapId: Number(mapId) }),
    enabled: !!mapId && !isBackUp,
  });

  const { data: backupMap } = useQuery({
    ...useMapQueries().editBackupMap(),
    enabled: isBackUp,
  });

  const videoId = useVideoIdState();
  const setVideoId = useSetVideoId();
  const mapDispatch = useMapReducer();
  const setCanUpload = useSetCanUpload();
  const { debounce } = useDebounce(500);

  const form = useForm({
    resolver: zodResolver(mapInfoFormSchema),
    shouldUnregister: false,
    values: {
      title: mapInfoData?.title ?? backupMap?.title ?? "",
      artistName: mapInfoData?.artistName ?? backupMap?.artistName ?? "",
      musicSource: mapInfoData?.musicSource ?? backupMap?.musicSource ?? "",
      previewTime: mapInfoData?.previewTime ?? backupMap?.previewTime ?? 0,
      creatorComment: mapInfoData?.creator.name ?? backupMap?.creatorComment ?? "",
      tags: mapInfoData?.tags ?? backupMap?.tags ?? [],
      videoId: mapInfoData?.videoId ?? newCreateVideoId ?? "",
    },

    resetOptions: {
      keepDirtyValues: true,
    },
  });

  useEffect(() => {
    if (mapInfoData && !isBackUp) {
      setVideoId(mapInfoData.videoId);
    }
  }, [mapInfoData, isBackUp, form, setVideoId]);

  useEffect(() => {
    if (backupMap && isBackUp && newCreateVideoId) {
      mapDispatch({
        type: "replaceAll",
        payload: backupMap.map,
      });
      setCanUpload(true);
      setVideoId(newCreateVideoId);
    }
  }, [backupMap, isBackUp, newCreateVideoId, form, mapDispatch, setCanUpload, setVideoId]);

  useEffect(() => {
    if (newCreateVideoId && !mapId && !isBackUp) {
      setVideoId(newCreateVideoId);
    }
  }, [newCreateVideoId, mapId, isBackUp, setVideoId]);

  const {
    data: geminiInfoData,
    isFetching,
    error: geminiError,
  } = useQuery(
    useGeminiQueries().generateMapInfo(
      { videoId: videoId ?? "" },
      { enabled: !!(videoId && !isBackUp && hasUploadPermission) },
    ),
  );

  useEffect(() => {
    if (geminiError) {
      toast.error(geminiError.message);
    }
  }, [geminiError]);

  useEffect(() => {
    if (geminiInfoData) {
      const { title, artistName, source } = geminiInfoData;

      if (newCreateVideoId) {
        form.setValue("title", title);
        form.setValue("artistName", artistName);
        form.setValue("musicSource", source);
      }
    }
  }, [form, geminiInfoData, newCreateVideoId]);

  useEffect(() => {
    if (newCreateVideoId) {
      const subscription = form.watch((value) => {
        if (!value || !newCreateVideoId) return;

        debounce(() => {
          backupMapInfo({
            videoId: newCreateVideoId,
            title: value.title || "",
            artistName: value.artistName || "",
            musicSource: value.musicSource || "",
            creatorComment: value.creatorComment || "",
            tags: value.tags?.filter((tag): tag is string => typeof tag === "string" && tag !== undefined) || [],
            previewTime: value.previewTime || 0,
          });
        });
      });
      return () => subscription.unsubscribe();
    }
  }, [newCreateVideoId, form]);

  const onSubmit = useOnSubmit(form);

  const isGeminiLoading = isFetching && !!newCreateVideoId;
  const tags = form.watch("tags");

  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-baseline gap-4">
          {!newCreateVideoId && <VideoIdInput />}

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
            maxLength={100}
          />
          <SuggestionTags isGeminiLoading={isGeminiLoading} geminiTags={geminiInfoData?.otherTags ?? []} />

          <div className="flex w-full flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
              <InfoFormButton />
              {mapId && <TypeLinkButton />}
            </div>

            <PreviewTimeInput />
          </div>
        </form>
      </Form>
    </CardWithContent>
  );
};

const InfoFormButton = () => {
  const { formState } = useFormContext();
  const { isDirty, isSubmitting } = formState;
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();
  useNavigationGuard((isDirty || canUpload) && hasUploadPermission);

  if (!hasUploadPermission) return null;

  return (
    <Button size="xl" loading={isSubmitting} disabled={(!isDirty && !canUpload) || isSubmitting} className="w-52">
      保存
    </Button>
  );
};

const VideoIdInput = () => {
  const { watch, formState, setValue, getValues } = useFormContext();
  const { dirtyFields } = formState;
  const formVideoId = watch("videoId");
  const setVideoId = useSetVideoId();
  const setYTChaningVideo = useSetYTChaningVideo();

  return (
    <div className="flex w-full items-center gap-4">
      <TooltipWrapper label="動画URLを貼り付けるとIDが自動入力されます">
        <div className="flex-center flex gap-4">
          <FloatingLabelInputFormField
            name="videoId"
            className="w-32"
            label="動画ID"
            maxLength={11}
            onPaste={(e) => {
              e.preventDefault();

              const videoId = extractYouTubeVideoId(e.clipboardData.getData("text"));

              if (videoId) {
                setValue("videoId", videoId);
              }
            }}
          />
          <Button
            variant="outline-info"
            size="lg"
            disabled={!dirtyFields.videoId || formVideoId.length !== 11}
            onClick={(e) => {
              e.preventDefault();
              if (formVideoId.length !== 11) return;

              setVideoId(getValues("videoId"));
              setYTChaningVideo(true);
            }}
          >
            動画切り替え
          </Button>
        </div>
      </TooltipWrapper>
    </div>
  );
};

const PreviewTimeInput = () => {
  const { readPlayer } = usePlayer();
  const { watch, setValue, getValues } = useFormContext();
  const previewTime = watch("previewTime");
  const setPreventEditortabAutoFocus = useSetPreventEditortabAutoFocus();
  const setCanUpload = useSetCanUpload();

  const handlePreviewClick = () => {
    readPlayer().playVideo();
    readPlayer().seekTo(Number(previewTime), true);
    setPreventEditortabAutoFocus(true);
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
            name="previewTime"
            label="プレビュータイム"
            className="w-36"
            type="number"
            min="0"
            step="0.001"
            onChange={() => setCanUpload(true)}
            inputMode="decimal"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePreviewClick();
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const currentValue = Number(getValues("previewTime")) || 0;
                setValue("previewTime", (currentValue + 0.05).toFixed(2));
                setCanUpload(true);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const currentValue = Number(getValues("previewTime")) || 0;
                const newValue = Math.max(0, currentValue - 0.05);
                setValue("previewTime", newValue.toFixed(2));
                setCanUpload(true);
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
  const { id: mapId } = useParams<{ id: string }>();

  return (
    <Link href={`/type/${mapId}`}>
      <Button size="default" variant="outline">
        タイピングページに移動
      </Button>
    </Link>
  );
};

const useOnSubmit = (form: ReturnType<typeof useForm<z.infer<typeof mapInfoFormSchema>>>) => {
  const { id: mapId } = useParams<{ id: string }>();
  const readEditUtils = useReadEditUtils();
  const { readPlayer } = usePlayer();
  const searchParams = useSearchParams();
  const newCreateVideoId = searchParams.get("new");
  const router = useRouter();
  const setCanUpload = useSetCanUpload();
  const readMap = useReadMap();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const upsertMap = useMutation(
    useTRPC().map.upsertMap.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.map.getMap.queryFilter({ mapId }));

        toast.success(data.title, {
          description: data.message,
        });
        if (data.id) {
          router.push(`/edit/${data.id}`);
          clearBackupMapWithInfo();
        }
        form.reset(form.getValues());
        setCanUpload(false);
      },
      onError: (error) => {
        toast.error(error.message);

        if (newCreateVideoId) {
          backupMapInfo({
            videoId: newCreateVideoId,
            title: form.getValues("title"),
            artistName: form.getValues("artistName"),
            musicSource: form.getValues("musicSource"),
            creatorComment: form.getValues("creatorComment"),
            tags: form.getValues("tags"),
            previewTime: form.getValues("previewTime"),
          });
          backupMap({
            videoId: newCreateVideoId,
            map: readMap(),
          });
        }
      },
    }),
  );

  return async (data: z.output<typeof mapInfoFormSchema>) => {
    const map = readMap();

    const { title, artistName, musicSource, creatorComment, tags, previewTime } = data;
    const { speedDifficulty, movieTotalTime, totalNotes, startLine } = new BuildMap(map);

    const { video_id } = readPlayer().getVideoData();
    const videoDuration = readPlayer().getDuration();

    const typingStartTime = Math.max(0, Number(map[startLine]["time"]) + 0.2);

    const newPreviewTime =
      Number(previewTime) > videoDuration || typingStartTime >= Number(previewTime)
        ? typingStartTime.toFixed(3)
        : previewTime;

    form.setValue("previewTime", Number(newPreviewTime));

    const mapInfo = {
      videoId: video_id,
      title,
      artistName,
      musicSource,
      creatorComment,
      tags,
      previewTime: Number(newPreviewTime),
      thumbnailQuality: await getThumbnailQuality(video_id),
    };
    const mapDifficulty = {
      roma_kpm_median: speedDifficulty.median.r,
      roma_kpm_max: speedDifficulty.max.r,
      kana_kpm_median: speedDifficulty.median.r,
      kana_kpm_max: speedDifficulty.max.r,
      total_time: movieTotalTime,
      roma_total_notes: totalNotes.r,
      kana_total_notes: totalNotes.k,
    };
    const { isUpdateUpdatedAt } = readEditUtils();
    await upsertMap.mutateAsync({
      mapInfo,
      mapDifficulty,
      mapData: map,
      isMapDataEdited: isUpdateUpdatedAt,
      mapId: mapId || "new",
    });
  };
};

export default MapInfoForm;
