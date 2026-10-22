import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { setTabName } from "@/app/(typing)/type/_feature/tabs/tabs";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { useToggleClapMutation } from "@/shared/result/clap";
import { RestoreInvalidResultButton } from "@/shared/result/list/card/restore-invalid-button";
import type { PlayVideo } from "@/shared/result/play-video-link";
import { Button, buttonVariants } from "@/ui/button";
import { confirmDialog } from "@/ui/confirm-dialog";
import { overlay } from "@/ui/overlay";
import { PopoverContent } from "@/ui/popover";
import { promptDialog } from "@/ui/prompt-dialog";
import { Separator } from "@/ui/separator";
import { toast } from "@/ui/toast";
import { cn } from "@/utils/cn";
import { buildPlayVideoUrl, PLAY_VIDEO_PLATFORM_LABELS, parsePlayVideoUrl } from "@/utils/play-video";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { setInitialLineResults } from "../../atoms/line-results";
import { setReplayRankingResult } from "../../atoms/replay";
import { setPlayingInputMode } from "../../atoms/typing-word";
import { playYTPlayer, primeYTPlayerForMobilePlayback } from "../../atoms/youtube-player";
import { restartPlay } from "../../lib/play-restart";
import { iosActiveSound } from "../../lib/sound-effect";
import { getMapId } from "../../provider";
import { setScene, useSceneGroupState } from "../../typing-card/typing-card";
import { dispatchTypeEvent } from "../../user-script";
import { getRankingResultByResultId } from "./get-ranking-result";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  hasClapped: boolean;
  playVideo: PlayVideo;
  /** 確認中（無効）の記録。拍手・報告・BANは出さず、管理者には解除を出す */
  invalid?: boolean;
}

export const RankingPopoverContent = ({
  resultId,
  userId,
  resultUpdatedAt,
  hasClapped,
  playVideo,
  invalid = false,
}: RankingMenuProps) => {
  const t = useTranslations("typing.rankingMenu");
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const queryClient = useQueryClient();
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapInfo } = useQuery(orpc.map.getById.queryOptions({ input: { mapId: Number(mapId) } }));

  const toggleClap = useToggleClapMutation();

  const invalidateResult = useMutation(
    orpc.result.invalidation.invalidate.mutationOptions({
      onSuccess: async () => {
        toast.success(t("banned"));
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.result.ranking.get.queryKey({ input: { mapId: Number(mapId) } }),
          }),
          queryClient.invalidateQueries({ queryKey: orpc.result.list.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.map.list.key() }),
        ]);
      },
      onError: (error) => toast.error(t("banFailed", { message: error.message })),
    }),
  );

  const invalidateRankingAndList = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: orpc.result.ranking.get.queryKey({ input: { mapId: Number(mapId) } }),
      }),
      queryClient.invalidateQueries({
        queryKey: orpc.result.ranking.getInvalid.queryKey({ input: { mapId: Number(mapId) } }),
      }),
      queryClient.invalidateQueries({ queryKey: orpc.result.list.key() }),
    ]);

  const setPlayVideo = useMutation(
    orpc.result.video.set.mutationOptions({
      onSuccess: async () => {
        toast.success(t("videoSet"));
        await invalidateRankingAndList();
      },
      onError: (error) => toast.error(t("videoSetFailed", { message: error.message })),
    }),
  );

  const removePlayVideo = useMutation(
    orpc.result.video.remove.mutationOptions({
      onSuccess: async () => {
        toast.success(t("videoRemoved"));
        await invalidateRankingAndList();
      },
      onError: (error) => toast.error(t("videoRemoveFailed", { message: error.message })),
    }),
  );

  const hasPlayVideo = !!playVideo.platform && !!playVideo.videoId;
  const canEditPlayVideo = !!session && (session.user.id === userId || session.user.role === "ADMIN");

  const playVideoUrl =
    playVideo.platform && playVideo.videoId ? buildPlayVideoUrl(playVideo.platform, playVideo.videoId) : null;

  const handlePlayVideoClick = async () => {
    const url = await promptDialog({
      title: hasPlayVideo ? t("videoChangeTitle") : t("videoSetTitle"),
      description: t("videoPrompt"),
      placeholder: t("videoPlaceholder"),
      confirmLabel: t("register"),
      maxLength: 500,
      singleLine: true,
    });
    if (!url) return;
    if (!parsePlayVideoUrl(url)) {
      toast.error(t("unsupportedUrl"));
      return;
    }
    setPlayVideo.mutate({ resultId, url });
  };

  const handleRemovePlayVideoClick = async () => {
    const confirmed = await confirmDialog.danger({
      title: t("removeTitle"),
      description: t("removeDescription"),
      confirmLabel: t("remove"),
    });
    if (confirmed) removePlayVideo.mutate({ resultId });
  };

  const submitReport = useMutation(
    orpc.result.report.submit.mutationOptions({
      onSuccess: () => toast.success(t("reportSent")),
      onError: (error) => toast.error(t("reportFailed", { message: error.message })),
    }),
  );

  const handleReportClick = async () => {
    const detail = await promptDialog({
      title: t("reportTitle"),
      description: t("reportDescription"),
      placeholder: t("reportPlaceholder"),
      confirmLabel: t("report"),
      maxLength: 400,
    });
    if (!detail) return;
    submitReport.mutate({
      resultId,
      reasonDetail: detail,
    });
  };

  const handleInvalidateClick = async () => {
    const confirmed = await confirmDialog.danger({
      title: t("banTitle"),
      description: t("banDescription"),
      confirmLabel: t("ban"),
    });
    if (confirmed) invalidateResult.mutate({ resultId });
  };

  const handleReplayClick = async () => {
    iosActiveSound();
    primeYTPlayerForMobilePlayback();
    overlay.loading(t("loadingResult"));
    setScene("replay");
    try {
      const resultData = await queryClient.ensureQueryData(
        orpc.result.getJsonById.queryOptions({ input: { resultId } }),
      );
      setInitialLineResults(resultData);
      const mode = resultData[0]?.status?.mode ?? "roma";
      setPlayingInputMode(mode);
      dispatchTypeEvent("change-input-mode", { newInputMode: mode });
      playYTPlayer();
    } catch {
      toast.error(t("loadFailed"));
    } finally {
      overlay.hide();
    }

    const mapUpdatedAt = mapInfo?.updatedAt;
    const resultUpdatedAtDate = new Date(resultUpdatedAt);

    if (mapUpdatedAt && mapUpdatedAt > resultUpdatedAtDate) {
      toast.warning(t("mapUpdated"), {
        description: t("mapUpdatedDescription"),
      });
    }

    setTabName("status");

    const mapId = getMapId();
    const replayRankingResult = mapId ? getRankingResultByResultId({ mapId, resultId }) : null;
    setReplayRankingResult(replayRankingResult);

    if (sceneGroup === "End") {
      restartPlay("replay");
    }
  };

  return (
    <PopoverContent
      side="bottom"
      align="start"
      className="flex w-fit flex-col items-center px-0 py-2 sm:w-fit [&>button]:w-full"
    >
      <Button variant="ghost">
        <Link href={`/user/${userId}`}>{t("userPage")}</Link>
      </Button>

      <Button variant="ghost" onClick={handleReplayClick} disabled={sceneGroup === "Playing"}>
        {t("replay")}
      </Button>
      {session && !invalid ? (
        <Button
          variant="ghost"
          type="button"
          className={cn(hasClapped && "text-perfect outline-text hover:text-perfect")}
          onClick={(e) => {
            e.stopPropagation();
            toggleClap.mutate({ resultId, newState: !hasClapped });
          }}
        >
          {hasClapped ? t("clapped") : t("clapAction")}
        </Button>
      ) : null}
      {playVideo.platform && playVideoUrl ? (
        <a
          href={playVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "ghost" }), "h-auto w-full flex-col gap-1 py-2")}
        >
          {playVideo.platform === "YOUTUBE" && playVideo.videoId ? (
            <Image
              src={getYouTubeThumbnailUrl(playVideo.videoId, "mqdefault")}
              alt=""
              width={96}
              height={54}
              className="rounded-sm"
            />
          ) : null}
          <span>{t("watchVideo", { platform: PLAY_VIDEO_PLATFORM_LABELS[playVideo.platform] })}</span>
        </a>
      ) : null}
      {canEditPlayVideo ? (
        <>
          <Button
            variant="ghost"
            type="button"
            disabled={setPlayVideo.isPending}
            onClick={(e) => {
              e.stopPropagation();
              void handlePlayVideoClick();
            }}
          >
            {hasPlayVideo ? t("videoChangeTitle") : t("videoSetTitle")}
          </Button>
          {hasPlayVideo ? (
            <Button
              variant="ghost"
              type="button"
              disabled={removePlayVideo.isPending}
              onClick={(e) => {
                e.stopPropagation();
                void handleRemovePlayVideoClick();
              }}
            >
              {t("removeVideo")}
            </Button>
          ) : null}
        </>
      ) : null}
      {session && session.user.id !== userId && !invalid ? (
        <>
          <Separator className="my-2" />
          <Button
            variant="ghost"
            type="button"
            disabled={submitReport.isPending}
            onClick={(e) => {
              e.stopPropagation();
              void handleReportClick();
            }}
          >
            {t("reportAction")}
          </Button>
        </>
      ) : null}
      {invalid ? <RestoreInvalidResultButton resultId={resultId} className="mx-2" /> : null}
      {session?.user.role === "ADMIN" && !invalid ? (
        <Button
          variant="ghost"
          type="button"
          className="text-destructive hover:text-destructive"
          disabled={invalidateResult.isPending}
          onClick={(e) => {
            e.stopPropagation();
            void handleInvalidateClick();
          }}
        >
          {t("banAction")}
        </Button>
      ) : null}
    </PopoverContent>
  );
};
