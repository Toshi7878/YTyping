"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { FaPlay } from "react-icons/fa";
import { toast } from "sonner";
import type z from "zod";
import { usePlayer, useSetPreventEditortabAutoFocus } from "@/app/edit/_lib/atoms/read-atoms";
import { TAG_MAX_LEN } from "@/app/edit/_lib/const";
import { useHasMapUploadPermission } from "@/app/edit/_lib/utils/use-has-map-upload-permission";
import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FloatingLabelInputFormField } from "@/components/ui/input/input-form-field";
import { TagInputFormField } from "@/components/ui/input/tag-input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { BuildMap } from "@/lib/build-map/build-map";
import { backupMap, backupMapInfo, clearBackupMapWithInfo } from "@/lib/indexed-db";
import { useGeminiQueries } from "@/lib/queries/gemini.queries";
import { useMapQueries } from "@/lib/queries/map.queries";
import { MapInfoFormSchema } from "@/server/drizzle/validator/map";
import { useTRPC } from "@/trpc/provider";
import { extractYouTubeId } from "@/utils/extract-youtube-id";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { useNavigationGuard } from "@/utils/hooks/use-navigation-guard";
import { useMapReducer, useReadMap } from "../../../_lib/atoms/map-reducer-atom";
import {
  useCanUploadState,
  useReadEditUtils,
  useSetCanUpload,
  useSetVideoId,
  useSetYTChaningVideo,
  useVideoIdState,
} from "../../../_lib/atoms/state-atoms";
import { getThumbnailQuality } from "../../../_lib/utils/get-thumbail-quality";
import { SuggestionTags } from "./suggestion-tags";

export const MapInfoFormCard = () => {
  const searchParams = useSearchParams();
  const mapId = usePathname().split("/")[2];

  const isBackUp = searchParams.get("backup") === "true";
  const newCreateVideoId = searchParams.get("new");
  const hasUploadPermission = useHasMapUploadPermission();

  const { data: mapInfo } = useQuery({
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
    resolver: zodResolver(MapInfoFormSchema),
    shouldUnregister: false,
    values: {
      title: mapInfo?.title ?? backupMap?.title ?? "",
      artistName: mapInfo?.artistName ?? backupMap?.artistName ?? "",
      musicSource: mapInfo?.musicSource ?? backupMap?.musicSource ?? "",
      previewTime: mapInfo?.previewTime ?? backupMap?.previewTime ?? 0,
      creatorComment: mapInfo?.creator.comment ?? backupMap?.creatorComment ?? "",
      tags: mapInfo?.tags ?? backupMap?.tags ?? [],
      videoId: mapInfo?.videoId ?? newCreateVideoId ?? "",
    },

    resetOptions: {
      keepDirtyValues: true,
    },
  });

  useEffect(() => {
    if (mapInfo && !isBackUp) {
      setVideoId(mapInfo.videoId);
    }
  }, [mapInfo, isBackUp, form, setVideoId]);

  useEffect(() => {
    if (backupMap && isBackUp && newCreateVideoId) {
      mapDispatch({ type: "replaceAll", payload: backupMap.map });
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
    error: geminiError,
    isFetching,
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
          void backupMapInfo({
            videoId: newCreateVideoId,
            title: value.title || "",
            artistName: value.artistName || "",
            musicSource: value.musicSource || "",
            creatorComment: value.creatorComment || "",
            tags: value.tags?.filter((tag): tag is string => typeof tag === "string" && tag !== undefined) || [],
            previewTime: Number(value.previewTime) || 0,
          });
        });
      });
      return () => subscription.unsubscribe();
    }
  }, [newCreateVideoId, form, debounce]);

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
              name="artistName"
              label={isGeminiLoading ? "アーティスト名を生成中..." : "アーティスト名"}
              required
            />
          </div>
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiLoading}
              name="musicSource"
              label={isGeminiLoading ? "ソースを生成中..." : "ソース"}
            />
            <FloatingLabelInputFormField name="creatorComment" label="コメント" />
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

              const videoId = extractYouTubeId(e.clipboardData.getData("text"));

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
            onFocus={(e) => e.target.select()}
            onChange={() => {
              setCanUpload(true);
            }}
            inputMode="decimal"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePreviewClick();
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const currentValue = Number(getValues("previewTime")) || 0;
                setValue("previewTime", (currentValue + 0.05).toFixed(3));
                setCanUpload(true);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const currentValue = Number(getValues("previewTime")) || 0;
                setValue("previewTime", Math.max(0, currentValue - 0.05).toFixed(3));
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
  const mapId = usePathname().split("/")[2];

  if (!mapId) return null;

  return (
    <Link href={`/type/${mapId}`}>
      <Button size="default" variant="outline">
        タイピングページに移動
      </Button>
    </Link>
  );
};

const useOnSubmit = (form: ReturnType<typeof useForm<z.input<typeof MapInfoFormSchema>>>) => {
  const mapId = usePathname().split("/")[2];
  const readEditUtils = useReadEditUtils();
  const { readPlayer } = usePlayer();
  const searchParams = useSearchParams();
  const newCreateVideoId = searchParams.get("new");
  const setCanUpload = useSetCanUpload();
  const readMap = useReadMap();
  const trpc = useTRPC();

  const upsertMap = useMutation(
    useTRPC().map.upsertMap.mutationOptions({
      onSuccess: async (id, _variables, _, context) => {
        setCanUpload(false);
        form.reset(form.getValues());
        await context.client.invalidateQueries(trpc.map.getMapJson.queryFilter({ mapId: id }));
        await context.client.invalidateQueries(trpc.map.getMapInfo.queryFilter({ mapId: id }));
        await context.client.invalidateQueries(trpc.mapList.getList.queryFilter());

        if (mapId === undefined) {
          window.history.replaceState(null, "", `/edit/${id}`);
          void clearBackupMapWithInfo();
          toast.success("アップロード完了");
          return;
        }

        toast.success("アップデート完了");
      },
      onError: async (error) => {
        switch (error.data?.code) {
          case "FORBIDDEN":
            toast.error("保存に失敗しました", { description: "この譜面を編集する権限がありません。" });
            return;
          default:
            toast.error("保存に失敗しました", { description: "しばらく時間をおいてから再度お試しください。" });
        }

        if (newCreateVideoId) {
          await backupMapInfo({
            videoId: newCreateVideoId,
            title: form.getValues("title"),
            artistName: form.getValues("artistName"),
            musicSource: form.getValues("musicSource"),
            creatorComment: form.getValues("creatorComment"),
            tags: form.getValues("tags"),
            previewTime: Number(form.getValues("previewTime") ?? 0),
          });

          void backupMap({
            videoId: newCreateVideoId,
            map: readMap(),
          });
        }
      },
    }),
  );

  return async (data: z.input<typeof MapInfoFormSchema>) => {
    const map = readMap();

    const { title, artistName, musicSource, creatorComment, tags, previewTime } = data;
    const { speedDifficulty, duration, totalNotes, startLine } = new BuildMap(map);

    const { video_id: videoId } = readPlayer().getVideoData();
    const videoDuration = readPlayer().getDuration();

    const typingStartTime = Math.max(0, Number(map[startLine]?.time ?? 0) + 0.2);

    const newPreviewTime =
      Number(previewTime) > videoDuration || typingStartTime >= Number(previewTime)
        ? typingStartTime.toFixed(3)
        : previewTime;

    form.setValue("previewTime", Number(newPreviewTime));

    const mapInfo = {
      videoId,
      title,
      artistName,
      musicSource,
      creatorComment,
      tags,
      previewTime: Number(newPreviewTime),
      thumbnailQuality: await getThumbnailQuality(videoId),
      duration,
    };

    const mapDifficulty = {
      romaKpmMedian: Math.floor(speedDifficulty.median.r),
      romaKpmMax: Math.floor(speedDifficulty.max.r),
      kanaKpmMedian: Math.floor(speedDifficulty.median.r),
      kanaKpmMax: Math.floor(speedDifficulty.max.r),
      romaTotalNotes: Math.floor(totalNotes.r),
      kanaTotalNotes: Math.floor(totalNotes.k),
    };
    const { isUpdateUpdatedAt } = readEditUtils();
    await upsertMap.mutateAsync({
      mapInfo,
      mapDifficulty,
      mapData: map,
      isMapDataEdited: isUpdateUpdatedAt,
      mapId: mapId ? Number(mapId) : null,
    });
  };
};
