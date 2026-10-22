"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { useReadyInputMode } from "@/store/ready-input-mode";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ButtonWithDoubleKbd, ButtonWithKbd } from "@/ui/button-with-kbd";
import { LabeledCheckbox } from "@/ui/labeled-items";
import { cn } from "@/utils/cn";
import { cycleYTPlaybackRate, stepYTPlaybackRate } from "../../atoms/youtube-player";
import { restartPlay } from "../../lib/play-restart";
import { useTypingOptionsState } from "../../tabs/setting/popover";
import {
  getMinMediaSpeed,
  useIsPausedState,
  useMediaSpeedState,
  useMinMediaSpeedState,
  useYTStartedState,
} from "../../youtube/youtube-player";
import { setIsDisabledMapStyled, useIsDisabledMapStyled, useIsStyledMap } from "../custom-style";
import { ReplayResultLineSheet } from "../line-result/line-result-sheet";
import { FloatingPracticeLineCard } from "../playing/line-practice/card/floating-line-card";
import { moveNextLine, movePrevLine } from "../playing/move-line";
import { getScene, useSceneGroupState, useSceneState } from "../typing-card";

export const TypingCardFooter = () => {
  const t = useTranslations("typing.footer");
  const isYTStarted = useYTStartedState();
  const scene = useSceneState();
  const sceneGroup = useSceneGroupState();
  const isReady = sceneGroup === "Ready";
  const { id: mapId } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const isDisabledCSSChange = useIsDisabledMapStyled();
  const isStyledMap = useIsStyledMap();

  return (
    <section
      className={cn("mx-3 mt-2 mb-3 flex h-16 w-full justify-between font-bold md:h-10", isReady && "justify-end")}
    >
      {isReady && (
        <div className="flex w-full items-center justify-between">
          <DifficultyInfo />
          <LabeledCheckbox
            containerClassName={!isStyledMap ? "invisible" : ""}
            label={t("disableStyle")}
            checked={isDisabledCSSChange}
            onCheckedChange={setIsDisabledMapStyled}
          />
          <Link href={`/ime/${mapId}`} className={!session ? "invisible" : ""} replace>
            <Button variant="outline" className="p-8 text-2xl md:p-2 md:text-base">
              {t("ime")}
            </Button>
          </Link>
        </div>
      )}
      {isYTStarted && scene === "play" && (
        <>
          <SpeedButton />
          <RetryButton />
        </>
      )}
      {isYTStarted && scene === "practice" && (
        <div className="flex items-center gap-14">
          <SpeedButton />
          <LineMoveButton />
          <FloatingPracticeLineCard />
        </div>
      )}
      {isYTStarted && scene === "replay" && (
        <>
          <SpeedButton />
          <LineMoveButton />
          <ResultListButton />
          <RetryButton />
        </>
      )}
    </section>
  );
};

const SpeedButton = () => {
  const t = useTranslations("typing.footer");
  const scene = useSceneState();
  const playSpeed = useMediaSpeedState();
  const isPaused = useIsPausedState();

  if (scene === "practice") {
    return (
      <ButtonWithDoubleKbd
        buttonLabel={t("speed", { speed: playSpeed.toFixed(2) })}
        prevKbdLabel="F9-"
        nextKbdLabel="+F10"
        onClick={() => {}}
        onClickPrev={() => stepYTPlaybackRate("down")}
        onClickNext={() => stepYTPlaybackRate("up")}
        disabled={isPaused}
      />
    );
  }

  return (
    <ButtonWithKbd
      buttonLabel={t("speed", { speed: playSpeed.toFixed(2) })}
      kbdLabel="F10"
      onClick={() => {
        const minMediaSpeed = getMinMediaSpeed();
        cycleYTPlaybackRate({ minSpeed: minMediaSpeed });
      }}
      disabled={isPaused || scene === "replay"}
    />
  );
};

const RetryButton = () => {
  const t = useTranslations("typing.footer");
  const isPaused = useIsPausedState();
  return (
    <ButtonWithKbd
      buttonLabel={t("retry")}
      kbdLabel="F4"
      onClick={() => {
        const scene = getScene();

        if (scene === "play" || scene === "practice" || scene === "replay") {
          restartPlay(scene);
        }
      }}
      disabled={isPaused}
    />
  );
};

const LineMoveButton = () => {
  const t = useTranslations("typing.footer");
  return (
    <ButtonWithDoubleKbd
      buttonLabel={t("move")}
      prevKbdLabel="←"
      nextKbdLabel="→"
      onClick={() => {}}
      onClickPrev={() => movePrevLine()}
      onClickNext={() => moveNextLine()}
    />
  );
};

const ResultListButton = () => {
  const t = useTranslations("typing.footer");
  const { inputModeToggleKey } = useTypingOptionsState();
  const [open, setOpen] = useState(false);

  useHotkeys(inputModeToggleKey === "TAB" ? "F1" : "Tab", () => setOpen(true), {
    enableOnFormTags: false,
    preventDefault: true,
  });

  return (
    <>
      <ButtonWithKbd
        buttonLabel={t("list")}
        kbdLabel={inputModeToggleKey === "TAB" ? "F1" : "Tab"}
        onClickCapture={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      />
      <ReplayResultLineSheet open={open} setOpen={setOpen} />
    </>
  );
};

const DifficultyInfo = () => {
  const t = useTranslations("typing.footer");
  const { id: mapId } = useParams();
  const { data: mapInfo } = useQuery(orpc.map.getById.queryOptions({ input: { mapId: Number(mapId) } }));
  const inputMode = useReadyInputMode();
  const minMediaSpeed = useMinMediaSpeedState();

  const difficulty = mapInfo?.difficulty;
  if (!difficulty) return null;

  const isRoma = inputMode === "roma";
  const maxKpm = Math.round((isRoma ? difficulty.romaKpmMax : difficulty.kanaKpmMax) * minMediaSpeed);

  return (
    <Badge variant="accent-light" size="md" className="text-lg">
      {t("maxKpm", { kpm: maxKpm })}
    </Badge>
  );
};
