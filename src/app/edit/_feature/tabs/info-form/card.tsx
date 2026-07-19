"use client";
import { useSelector } from "@tanstack/react-form";
import { queryOptions, useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { atom, useAtomValue } from "jotai";
import { buildTypingMap, type RawMapLine } from "lyrics-typing-engine";
import Link from "next/link";
import { useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { toast } from "sonner";
import z from "zod";
import { idb } from "@/app/edit/_feature/indexed-db";
import { hasMapUploadPermission } from "@/app/edit/_feature/permission/has-permission";
import {
  getMapId,
  getVideoId,
  setCreatorId,
  setMapId,
  store,
  useCreatorId,
  useMapId,
  useVideoId,
} from "@/app/edit/_feature/provider";
import { useIsBuckupQueryState } from "@/app/edit/_feature/search-params";
import { useSession } from "@/auth/client";
import {
  calcChunkCounts,
  calculateSpeedDifficulty,
  calculateTotalNotes,
  calculateTypingDuration,
  getStartLine,
} from "@/shared/map/built-map-helper";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { CardWithContent } from "@/ui/card";
import { useAppForm, withForm } from "@/ui/form-field-item";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { useNavigationGuard } from "@/utils/hooks/use-navigation-guard";
import { extractYouTubeId } from "@/utils/youtube";
import { MapInfoFormSchema } from "@/validator/map/map";
import { getRawMap } from "../../map-table/map-reducer";
import { getThumbnailQuality } from "../../utils/get-thumbail-quality";
import { preventEditorTabAutoFocus, YTPlayer } from "../../youtube-player";
import { SuggestionTags } from "./suggestion-tags";

export const TAG_MAX_LENGTH = 10;

const canUploadAtom = atom(false);
export const useCanUpload = () => useAtomValue(canUploadAtom);
export const setCanUpload = (value: boolean) => store.set(canUploadAtom, value);

const isMapEditedAtom = atom(false);
export const getIsMapEdited = () => store.get(isMapEditedAtom);
export const setIsMapEdited = (value: boolean) => store.set(isMapEditedAtom, value);

type MapInfoFormValues = z.output<typeof MapInfoFormSchema>;

// withForm の型推論専用のプレースホルダ。実際の初期値は各フォームが個別に持つ
const mapInfoFormShape: MapInfoFormValues = {
  title: "",
  artistName: "",
  musicSource: "",
  creatorComment: "",
  tags: [],
  videoId: "",
  previewTime: 0,
  visibility: "PUBLIC",
};

// MapInfoFormSchema は previewTime が z.coerce.number() で input型が number と一致しないため、
// フォームのライブ検証専用に previewTime を plain number にしたスキーマを使う
const mapInfoFormValidationSchema = MapInfoFormSchema.extend({
  previewTime: z.number({ error: "プレビュータイムは数値である必要があります" }),
});

interface SyncableFormField {
  isDirty?: boolean;
}

interface SyncableForm {
  state: { fieldMeta: Partial<Record<keyof MapInfoFormValues, SyncableFormField | undefined>> };
  setFieldValue(
    name: keyof MapInfoFormValues,
    value: unknown,
    opts: { dontUpdateMeta: boolean; dontValidate: boolean },
  ): void;
}

// mapInfo/backupMap 由来の値をダーティでないフィールドにのみ反映する(RHFの values+keepDirtyValues 相当)
// dontUpdateMeta だけでは不十分: setFieldValue は内部で validateField を呼び、
// validateField自体がisTouchedを強制的にtrueにしてしまうため、dontValidateも併せて指定する必要がある。
// これを怠ると tags 等の未入力フィールドがマウント直後からバリデーションエラー表示されてしまう
const useSyncNonDirtyValues = (form: SyncableForm, values: MapInfoFormValues) => {
  useEffect(() => {
    for (const key of Object.keys(values) as (keyof MapInfoFormValues)[]) {
      if (!form.state.fieldMeta[key]?.isDirty) {
        form.setFieldValue(key, values[key], { dontUpdateMeta: true, dontValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);
};

export const EditMapInfoFormCard = () => {
  const mapId = useMapId();
  const trpc = useTRPC();

  const { data: mapInfo } = useSuspenseQuery(
    trpc.map.getById.queryOptions({ mapId: mapId ?? 0 }, { staleTime: Infinity, gcTime: Infinity }),
  );

  const videoId = useVideoId();
  const upsertMap = useUpsertMapMutation();

  const form = useAppForm({
    validators: { onChange: mapInfoFormValidationSchema },
    defaultValues: {
      title: mapInfo.info.title,
      artistName: mapInfo.info.artistName,
      musicSource: mapInfo.info.source,
      previewTime: mapInfo.media.previewTime,
      creatorComment: mapInfo.creator.comment,
      tags: mapInfo.info.tags,
      videoId,
      visibility: mapInfo.info.visibility,
    },
    onSubmit: async ({ value: data, formApi }) => {
      const payload = await buildUpsertPayload(data);
      formApi.setFieldValue("previewTime", payload.newPreviewTime);

      try {
        await upsertMap.mutateAsync(payload);
        formApi.reset(formApi.state.values);
      } catch {
        await backupCurrentFormValues(formApi.state.values);
      }
    },
  });

  useSyncNonDirtyValues(form, {
    title: mapInfo.info.title,
    artistName: mapInfo.info.artistName,
    musicSource: mapInfo.info.source,
    previewTime: mapInfo.media.previewTime,
    creatorComment: mapInfo.creator.comment,
    tags: mapInfo.info.tags,
    videoId,
    visibility: mapInfo.info.visibility,
  });

  const tags = useSelector(form.store, (state) => state.values.tags);

  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex w-full flex-col items-baseline gap-4"
      >
        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <VideoIdInput form={form} />
          <VisibilitySelect form={form} />
        </div>
        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <form.AppField name="title">
            {(field) => <field.FloatingLabelInputFormField label="曲名" required />}
          </form.AppField>
          <form.AppField name="artistName">
            {(field) => <field.FloatingLabelInputFormField label="アーティスト名" required />}
          </form.AppField>
        </div>
        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <form.AppField name="musicSource">
            {(field) => <field.FloatingLabelInputFormField label="ソース" />}
          </form.AppField>
          <form.AppField name="creatorComment">
            {(field) => <field.FloatingLabelInputFormField label="コメント" />}
          </form.AppField>
        </div>
        <form.AppField name="tags">
          {(field) => (
            <field.TagInputFormField
              maxTags={TAG_MAX_LENGTH}
              label={
                tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加 ${tags.length} / ${TAG_MAX_LENGTH}`
              }
              maxLength={100}
            />
          )}
        </form.AppField>
        <SuggestionTags tags={tags} onTagsChange={(newTags) => form.setFieldValue("tags", newTags)} />

        <div className="flex w-full flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
            <UpsertButton form={form} />
            <TypeLinkButton mapId={mapId ?? 0} />
          </div>

          <PreviewTimeInput form={form} />
        </div>
      </form>
    </CardWithContent>
  );
};

export const AddMapInfoFormCard = () => {
  const trpc = useTRPC();

  const [isBackup] = useIsBuckupQueryState();
  const { data: session } = useSession();
  const creatorId = useCreatorId();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  const { data: backupMap } = useQuery(
    queryOptions({
      queryKey: ["backup"],
      queryFn: idb.backup.fetch,
      enabled: isBackup,
    }),
  );

  const videoId = useVideoId();
  const { debounce } = useDebounce(500);
  const upsertMap = useUpsertMapMutation();

  const form = useAppForm({
    validators: { onChange: mapInfoFormValidationSchema },
    defaultValues: {
      title: backupMap?.title ?? "",
      artistName: backupMap?.artistName ?? "",
      musicSource: backupMap?.musicSource ?? "",
      previewTime: backupMap?.previewTime ?? 0,
      creatorComment: backupMap?.creatorComment ?? "",
      tags: backupMap?.tags ?? [],
      videoId: videoId,
      visibility: "PUBLIC",
    } as MapInfoFormValues,
    onSubmit: async ({ value: data, formApi }) => {
      const payload = await buildUpsertPayload(data);
      formApi.setFieldValue("previewTime", payload.newPreviewTime);

      try {
        await upsertMap.mutateAsync(payload);
        formApi.reset(formApi.state.values);
      } catch {
        await backupCurrentFormValues(formApi.state.values);
      }
    },
  });

  useSyncNonDirtyValues(form, {
    title: backupMap?.title ?? "",
    artistName: backupMap?.artistName ?? "",
    musicSource: backupMap?.musicSource ?? "",
    previewTime: backupMap?.previewTime ?? 0,
    creatorComment: backupMap?.creatorComment ?? "",
    tags: backupMap?.tags ?? [],
    videoId: videoId,
    visibility: "PUBLIC",
  } as MapInfoFormValues);

  const {
    data: generatedMapInfo,
    error: aiError,
    isFetching: isAIFetching,
  } = useQuery(
    trpc.ai.generateMapInfo.queryOptions(
      { videoId },
      {
        enabled: hasUploadPermission,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    ),
  );

  useEffect(() => {
    if (aiError) {
      toast.error(aiError.message);
    }
  }, [aiError]);

  useEffect(() => {
    if (generatedMapInfo) {
      const { title, artistName, source } = generatedMapInfo;

      if (!isBackup) {
        form.setFieldValue("title", title);
        form.setFieldValue("artistName", artistName);
        form.setFieldValue("musicSource", source);
      }
    }
  }, [form, generatedMapInfo, isBackup]);

  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      const value = form.store.state.values;

      debounce(() => {
        void idb.backup.upsertMapInfo({
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

  const tags = useSelector(form.store, (state) => state.values.tags);

  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-6" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex w-full flex-col items-baseline gap-4"
      >
        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <VideoIdInput form={form} readOnly />
          <VisibilitySelect form={form} />
        </div>

        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <form.AppField name="title">
            {(field) => (
              <field.FloatingLabelInputFormField
                disabled={isAIFetching}
                label={isAIFetching ? "曲名を生成中..." : "曲名"}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="artistName">
            {(field) => (
              <field.FloatingLabelInputFormField
                disabled={isAIFetching}
                label={isAIFetching ? "アーティスト名を生成中..." : "アーティスト名"}
                required
              />
            )}
          </form.AppField>
        </div>
        <div className="grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <form.AppField name="musicSource">
            {(field) => (
              <field.FloatingLabelInputFormField
                disabled={isAIFetching}
                label={isAIFetching ? "ソースを生成中..." : "ソース"}
              />
            )}
          </form.AppField>
          <form.AppField name="creatorComment">
            {(field) => <field.FloatingLabelInputFormField label="コメント" />}
          </form.AppField>
        </div>
        <form.AppField name="tags">
          {(field) => (
            <field.TagInputFormField
              maxTags={TAG_MAX_LENGTH}
              label={
                tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加 ${tags.length} / ${TAG_MAX_LENGTH}`
              }
              maxLength={100}
            />
          )}
        </form.AppField>
        <SuggestionTags
          tags={tags}
          onTagsChange={(newTags) => form.setFieldValue("tags", newTags)}
          isAIFetching={isAIFetching}
          aiTags={generatedMapInfo?.otherTags ?? []}
        />
        <div className="flex w-full flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
          <UpsertButton form={form} />
          <PreviewTimeInput form={form} />
        </div>
      </form>
    </CardWithContent>
  );
};

const UpsertButton = withForm({
  defaultValues: mapInfoFormShape,
  render: ({ form }) => {
    const isDirty = useSelector(form.store, (state) => state.isDirty);
    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
    const canUpload = useCanUpload();
    const { data: session } = useSession();
    const creatorId = useCreatorId();
    const hasUploadPermission = hasMapUploadPermission(session, creatorId);
    useNavigationGuard((isDirty || canUpload) && hasUploadPermission);

    if (!hasUploadPermission) return null;

    return (
      <Button size="xl" loading={isSubmitting} disabled={(!isDirty && !canUpload) || isSubmitting} className="w-52">
        保存
      </Button>
    );
  },
});

const VideoIdInput = withForm({
  defaultValues: mapInfoFormShape,
  props: {} as { readOnly?: boolean },
  render: ({ form, readOnly = false }) => {
    const formVideoId = useSelector(form.store, (state) => state.values.videoId);
    const isVideoIdDirty = useSelector(form.store, (state) => state.fieldMeta.videoId?.isDirty ?? false);

    return (
      <div className="flex items-center gap-4">
        <TooltipWrapper label={!readOnly && "動画URLを貼付するとIDが自動入力されます"} asChild>
          <form.AppField name="videoId">
            {(field) => (
              <field.FloatingLabelInputFormField
                className="w-32"
                label="動画ID"
                readOnly={readOnly}
                maxLength={11}
                onPaste={(e) => {
                  e.preventDefault();

                  const clipboardText = e.clipboardData.getData("text");

                  const videoId = extractYouTubeId(clipboardText);

                  if (videoId) {
                    form.setFieldValue("videoId", videoId);
                    YTPlayer.cueVideo(videoId);
                    setCanUpload(true);
                    return;
                  }

                  if (clipboardText.length === 11) {
                    form.setFieldValue("videoId", clipboardText);
                    YTPlayer.cueVideo(clipboardText);
                    setCanUpload(true);
                  }
                }}
              />
            )}
          </form.AppField>
        </TooltipWrapper>
        <Button
          variant="outline-info"
          size="lg"
          className={cn(readOnly && "hidden")}
          disabled={formVideoId.length !== 11 || isVideoIdDirty}
          onClick={(e) => {
            e.preventDefault();
            if (formVideoId.length !== 11) return;

            YTPlayer.cueVideo(form.getFieldValue("videoId"));
            setCanUpload(true);
          }}
        >
          動画切り替え
        </Button>
      </div>
    );
  },
});

const VisibilitySelect = withForm({
  defaultValues: mapInfoFormShape,
  render: ({ form }) => {
    const options = [
      { value: "PUBLIC", label: "公開", description: "譜面一覧に表示されます" },
      { value: "UNLISTED", label: "限定公開", description: "譜面URLを知っているユーザーのみアクセスできます" },
    ] satisfies { value: MapInfoFormValues["visibility"]; label: string; description: string }[];

    return (
      <form.AppField name="visibility">
        {(field) => (
          <field.FloatingLabelSelectFormField label="公開範囲" options={options} triggerClassName="min-w-28" />
        )}
      </form.AppField>
    );
  },
});

const PreviewTimeInput = withForm({
  defaultValues: mapInfoFormShape,
  render: ({ form }) => {
    const handlePreviewClick = () => {
      YTPlayer.play();
      YTPlayer.seek(Number(form.getFieldValue("previewTime")));
      preventEditorTabAutoFocus();
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
        asChild
      >
        <div className="flex flex-row items-center gap-3">
          <form.AppField name="previewTime">
            {(field) => (
              <field.FloatingLabelInputFormField
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
                    const currentValue = Number(form.getFieldValue("previewTime")) || 0;
                    form.setFieldValue("previewTime", Number((currentValue + 0.05).toFixed(3)));
                    setCanUpload(true);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const currentValue = Number(form.getFieldValue("previewTime")) || 0;
                    form.setFieldValue("previewTime", Number(Math.max(0, currentValue - 0.05).toFixed(3)));
                    setCanUpload(true);
                  }
                }}
              />
            )}
          </form.AppField>

          <Button className="shrink-0" type="button" onClick={handlePreviewClick} variant="ghost" size="icon">
            <FaPlay size={15} />
          </Button>
        </div>
      </TooltipWrapper>
    );
  },
});

const TypeLinkButton = ({ mapId }: { mapId: number }) => {
  return (
    <Link href={`/type/${mapId}`}>
      <Button size="default" variant="outline">
        タイピングページに移動
      </Button>
    </Link>
  );
};

const useUpsertMapMutation = () => {
  const trpc = useTRPC();
  return useMutation(
    trpc.map.upsert.mutationOptions({
      onSuccess: async ({ id, creatorId }, _variables, _, context) => {
        context.client.setQueriesData<RawMapLine[]>(
          trpc.map.getJsonById.queryFilter({ mapId: id }),
          () => _variables.rawMapJson,
        );
        await context.client.invalidateQueries(trpc.map.getById.queryOptions({ mapId: id }));

        const mapId = getMapId();
        if (!mapId) {
          window.history.replaceState(null, "", `/edit/${id}`);
          void idb.backup.delete();
          setMapId(id);
          setCreatorId(creatorId);
          toast.success("アップロード完了");
          await context.client.resetQueries({ queryKey: trpc.map.list.get.pathKey() });
        } else {
          toast.success("アップデート完了");
          await context.client.invalidateQueries({ queryKey: trpc.map.list.get.pathKey() });
        }
        setCanUpload(false);
      },
      onError: (error) => {
        switch (error.data?.code) {
          case "FORBIDDEN":
            toast.error("保存に失敗しました", { description: "この譜面を編集する権限がありません。" });
            return;
          default:
            toast.error("保存に失敗しました", { description: error.message });
        }
      },
    }),
  );
};

const buildUpsertPayload = async (data: MapInfoFormValues) => {
  const videoId = YTPlayer.getVideoId();

  const rawMapLines = getRawMap();
  const { title, artistName, musicSource, creatorComment, tags, previewTime, visibility } = data;
  const builtMap = buildTypingMap({ rawMapLines, charPoint: 0 });
  const duration = calculateTypingDuration(builtMap);
  const totalNotes = calculateTotalNotes(builtMap);
  const startLine = getStartLine(builtMap);
  const speedDifficulty = calculateSpeedDifficulty(builtMap);
  const chunkCounts = calcChunkCounts(builtMap);

  const minPreviewTime = Math.max(0, startLine.time + 0.2);

  const videoDuration = YTPlayer.getDuration();
  const newPreviewTime =
    previewTime > videoDuration || minPreviewTime >= previewTime ? Number(minPreviewTime.toFixed(3)) : previewTime;

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
    visibility,
  };

  const mapDifficulty = {
    romaKpmMedian: Math.floor(speedDifficulty.median.r),
    romaKpmMax: Math.floor(speedDifficulty.max.r),
    kanaKpmMedian: Math.floor(speedDifficulty.median.k),
    kanaKpmMax: Math.floor(speedDifficulty.max.k),
    romaTotalNotes: Math.floor(totalNotes.roma),
    kanaTotalNotes: Math.floor(totalNotes.kana),
    ...chunkCounts,
  };

  return {
    newPreviewTime,
    mapInfo,
    mapDifficulty,
    rawMapJson: rawMapLines,
    isMapDataEdited: getIsMapEdited(),
    mapId: getMapId(),
  };
};

const backupCurrentFormValues = async (values: MapInfoFormValues) => {
  const currentMapId = getMapId();
  if (currentMapId) return;

  const backupVideoId = getVideoId();
  await idb.backup.upsertMapInfo({
    videoId: backupVideoId,
    title: values.title,
    artistName: values.artistName,
    musicSource: values.musicSource,
    creatorComment: values.creatorComment,
    tags: values.tags,
    previewTime: Number(values.previewTime ?? 0),
  });

  void idb.backup.upsertMapJson({ videoId: backupVideoId, map: getRawMap() });
};

// interface CSSTextLengthProps {
//   eternalCSSText: string;
//   changeCSSText: string;
//   lineOptions: MapLineEdit["options"] | null;
// }

// function CSSTextLength({ eternalCSSText, changeCSSText, lineOptions }: CSSTextLengthProps) {
//   const cssLength = useCssLengthState();

//   const loadLineCustomStyleLength =
//     Number(lineOptions?.eternalCSS?.length || 0) + Number(lineOptions?.changeCSS?.length || 0);

//   const calcAllCustomStyleLength =
//     cssLength - loadLineCustomStyleLength + (eternalCSSText.length + changeCSSText.length);
//   return (
//     <div className={`text-right ${calcAllCustomStyleLength <= 10000 ? "" : "text-destructive"}`}>
//       {calcAllCustomStyleLength} / 10000
//     </div>
//   );
// }
