"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { buildTypingMap, type RawMapLine } from "lyrics-typing-engine";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { FaPlay } from "react-icons/fa";
import { toast } from "sonner";
import type z from "zod";
import {
  readMapId,
  readVideoId,
  setCreatorId,
  setMapId,
  setVideoId,
  useCreatorIdState,
  useMapIdState,
  useVideoIdState,
} from "@/app/edit/_lib/atoms/hydrate";
import { setPreventEditorTabAutoFocus } from "@/app/edit/_lib/atoms/ref";
import { hasMapUploadPermission } from "@/app/edit/_lib/map-table/has-map-upload-permission";
import { searchParamsParsers } from "@/app/edit/_lib/search-params";
import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FloatingLabelInputFormField } from "@/components/ui/input/input-form-field";
import { TagInputFormField } from "@/components/ui/input/tag-input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import {
  calculateDuration,
  calculateSpeedDifficulty,
  calculateTotalNotes,
  getStartLine,
} from "@/lib/build-map/built-map-helper";
import { backupMap, backupMapInfo, clearBackupMapWithInfo, fetchBackupMap } from "@/lib/indexed-db";
import { useTRPC } from "@/trpc/provider";
import { extractYouTubeId } from "@/utils/extract-youtube-id";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { useNavigationGuard } from "@/utils/hooks/use-navigation-guard";
import { MapInfoFormSchema } from "@/validator/map";
import { readRawMap } from "../../../_lib/atoms/map-reducer";
import {
  getYTDuration,
  getYTVideoId,
  playYTPlayer,
  readUtilityParams,
  seekYTPlayer,
  setCanUpload,
  setYTChangingVideo,
  useCanUploadState,
} from "../../../_lib/atoms/state";
import { getThumbnailQuality } from "../../../_lib/utils/get-thumbail-quality";
import { SuggestionTags } from "./suggestion-tags";

export const TAG_MAX_LENGTH = 10;

export const EditMapInfoFormCard = () => {
  const mapId = useMapIdState();
  const trpc = useTRPC();

  const { data: mapInfo } = useQuery(
    trpc.map.getMapInfo.queryOptions({ mapId: mapId ?? 0 }, { staleTime: Infinity, gcTime: Infinity }),
  );

  const videoId = useVideoIdState();

  const form = useForm({
    resolver: zodResolver(MapInfoFormSchema),
    shouldUnregister: false,
    values: {
      title: mapInfo?.title ?? "",
      artistName: mapInfo?.artistName ?? "",
      musicSource: mapInfo?.musicSource ?? "",
      previewTime: mapInfo?.previewTime ?? 0,
      creatorComment: mapInfo?.creator.comment ?? "",
      tags: mapInfo?.tags ?? [],
      videoId: videoId,
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const onSubmit = useOnSubmit(form);

  const tags = form.watch("tags");

  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-baseline gap-4">
          <VideoIdInput />

          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField name="title" label="曲名" required />
            <FloatingLabelInputFormField name="artistName" label="アーティスト名" required />
          </div>
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField name="musicSource" label="ソース" />
            <FloatingLabelInputFormField name="creatorComment" label="コメント" />
          </div>
          <TagInputFormField
            name="tags"
            maxTags={TAG_MAX_LENGTH}
            label={tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加 ${tags.length} / ${TAG_MAX_LENGTH}`}
            maxLength={100}
          />
          <SuggestionTags />

          <div className="flex w-full flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
              <UpsertButton />
              <TypeLinkButton mapId={mapId ?? 0} />
            </div>

            <PreviewTimeInput />
          </div>
        </form>
      </Form>
    </CardWithContent>
  );
};

export const AddMapInfoFormCard = () => {
  const trpc = useTRPC();

  const [{ isBackup }] = useQueryStates({ isBackup: searchParamsParsers.isBackup });
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  const { data: backupMap } = useQuery(
    queryOptions({
      queryKey: ["backup"],
      queryFn: fetchBackupMap,
      enabled: isBackup,
    }),
  );

  const videoId = useVideoIdState();
  const { debounce } = useDebounce(500);

  const form = useForm({
    resolver: zodResolver(MapInfoFormSchema),
    shouldUnregister: false,
    values: {
      title: backupMap?.title ?? "",
      artistName: backupMap?.artistName ?? "",
      musicSource: backupMap?.musicSource ?? "",
      previewTime: backupMap?.previewTime ?? 0,
      creatorComment: backupMap?.creatorComment ?? "",
      tags: backupMap?.tags ?? [],
      videoId: videoId,
    },

    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const {
    data: geminiInfoData,
    error: geminiError,
    isFetching: isGeminiFetching,
  } = useQuery(
    trpc.gemini.generateMapInfo.queryOptions(
      { videoId },
      {
        enabled: hasUploadPermission,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
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

      if (!isBackup) {
        form.setValue("title", title);
        form.setValue("artistName", artistName);
        form.setValue("musicSource", source);
      }
    }
  }, [form, geminiInfoData, isBackup]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (!value) return;

      debounce(() => {
        void backupMapInfo({
          videoId,
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
  }, [videoId, form, debounce]);

  const onSubmit = useOnSubmit(form);

  const tags = form.watch("tags");

  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-baseline gap-4">
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiFetching}
              name="title"
              label={isGeminiFetching ? "曲名を生成中..." : "曲名"}
              required
            />
            <FloatingLabelInputFormField
              disabled={isGeminiFetching}
              name="artistName"
              label={isGeminiFetching ? "アーティスト名を生成中..." : "アーティスト名"}
              required
            />
          </div>
          <div className="flex w-full gap-4">
            <FloatingLabelInputFormField
              disabled={isGeminiFetching}
              name="musicSource"
              label={isGeminiFetching ? "ソースを生成中..." : "ソース"}
            />
            <FloatingLabelInputFormField name="creatorComment" label="コメント" />
          </div>
          <TagInputFormField
            name="tags"
            maxTags={TAG_MAX_LENGTH}
            label={tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加 ${tags.length} / ${TAG_MAX_LENGTH}`}
            maxLength={100}
          />
          <SuggestionTags isAIFetching={isGeminiFetching} aiTags={geminiInfoData?.otherTags ?? []} />
          <div className="flex w-full flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
            <UpsertButton />
            <PreviewTimeInput />
          </div>
        </form>
      </Form>
    </CardWithContent>
  );
};

const UpsertButton = () => {
  const { formState } = useFormContext();
  const { isDirty, isSubmitting } = formState;
  const canUpload = useCanUploadState();
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);
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
  const {
    dirtyFields: { videoId: isVideoIdDirty },
  } = formState;
  const formVideoId = watch("videoId");

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
                setValue("videoId", videoId, { shouldDirty: true });
              }
            }}
          />
          <Button
            variant="outline-info"
            size="lg"
            disabled={formVideoId.length !== 11 || !isVideoIdDirty}
            onClick={(e) => {
              e.preventDefault();
              if (formVideoId.length !== 11) return;

              setVideoId(getValues("videoId"));
              setYTChangingVideo(true);
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
  const { setValue, getValues } = useFormContext();

  const handlePreviewClick = () => {
    playYTPlayer();
    seekYTPlayer(Number(getValues("previewTime")));
    setPreventEditorTabAutoFocus(true);
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
                setValue("previewTime", (currentValue + 0.05).toFixed(3), { shouldDirty: true });
                setCanUpload(true);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const currentValue = Number(getValues("previewTime")) || 0;
                setValue("previewTime", Math.max(0, currentValue - 0.05).toFixed(3), { shouldDirty: true });
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

const TypeLinkButton = ({ mapId }: { mapId: number }) => {
  return (
    <Link href={`/type/${mapId}`}>
      <Button size="default" variant="outline">
        タイピングページに移動
      </Button>
    </Link>
  );
};

type FormType = ReturnType<typeof useForm<z.input<typeof MapInfoFormSchema>>>;

const useOnSubmit = (form: FormType) => {
  const trpc = useTRPC();
  const upsertMap = useMutation(
    useTRPC().map.upsertMap.mutationOptions({
      onSuccess: async ({ id, creatorId }, _variables, _, context) => {
        form.reset(form.getValues());
        context.client.setQueriesData<RawMapLine[]>(
          trpc.map.getRawMapJson.queryFilter({ mapId: id }),
          () => _variables.mapData,
        );
        await context.client.invalidateQueries(trpc.map.getMapInfo.queryOptions({ mapId: id }));

        const mapId = readMapId();
        if (!mapId) {
          window.history.replaceState(null, "", `/edit/${id}`);
          void clearBackupMapWithInfo();
          setMapId(id);
          setCreatorId(creatorId);
          toast.success("アップロード完了");
          await context.client.resetQueries({ queryKey: trpc.mapList.get.pathKey() });
        } else {
          toast.success("アップデート完了");
          await context.client.invalidateQueries({ queryKey: trpc.mapList.get.pathKey() });
        }
        setCanUpload(false);
      },
      onError: async (error) => {
        switch (error.data?.code) {
          case "FORBIDDEN":
            toast.error("保存に失敗しました", { description: "この譜面を編集する権限がありません。" });
            return;
          default:
            toast.error("保存に失敗しました", { description: "しばらく時間をおいてから再度お試しください。" });
        }

        const mapId = readMapId();
        if (!mapId) {
          const videoId = readVideoId();
          await backupMapInfo({
            videoId,
            title: form.getValues("title"),
            artistName: form.getValues("artistName"),
            musicSource: form.getValues("musicSource"),
            creatorComment: form.getValues("creatorComment"),
            tags: form.getValues("tags"),
            previewTime: Number(form.getValues("previewTime") ?? 0),
          });

          void backupMap({ videoId, map: readRawMap() });
        }
      },
    }),
  );

  return async (data: z.output<typeof MapInfoFormSchema>) => {
    const rawMapLines = readRawMap();

    const { title, artistName, musicSource, creatorComment, tags, previewTime } = data;
    const builtMap = buildTypingMap({ rawMapLines, charPoint: 0 });
    const duration = calculateDuration(builtMap);
    const totalNotes = calculateTotalNotes(builtMap);
    const startLine = getStartLine(builtMap);
    const speedDifficulty = calculateSpeedDifficulty(builtMap);
    const videoId = getYTVideoId();
    if (!videoId) return;

    const typingStartTime = Math.max(0, startLine.time + 0.2);

    const videoDuration = getYTDuration() ?? 0;
    const newPreviewTime =
      previewTime > videoDuration || typingStartTime >= previewTime ? Number(typingStartTime.toFixed(3)) : previewTime;

    form.setValue("previewTime", newPreviewTime);

    const mapInfo = {
      videoId,
      title,
      artistName,
      musicSource,
      creatorComment,
      tags,
      previewTime: newPreviewTime,
      thumbnailQuality: await getThumbnailQuality(videoId),
      duration,
    };

    const mapDifficulty = {
      romaKpmMedian: Math.floor(speedDifficulty.median.r),
      romaKpmMax: Math.floor(speedDifficulty.max.r),
      kanaKpmMedian: Math.floor(speedDifficulty.median.r),
      kanaKpmMax: Math.floor(speedDifficulty.max.r),
      romaTotalNotes: Math.floor(totalNotes.roma),
      kanaTotalNotes: Math.floor(totalNotes.kana),
    };
    const { isUpdateUpdatedAt } = readUtilityParams();
    const mapId = readMapId();
    await upsertMap.mutateAsync({
      mapInfo,
      mapDifficulty,
      mapData: rawMapLines,
      isMapDataEdited: isUpdateUpdatedAt,
      mapId,
    });
  };
};
