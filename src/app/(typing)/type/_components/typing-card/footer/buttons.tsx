"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { handlePlaySpeedAction, usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  readUtilityParams,
  setLineResultSheet,
  useIsPaused,
  useSceneGroupState,
  useSceneState,
  useUserTypingOptionsState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { useRetry } from "@/app/(typing)/type/_lib/playing/use-retry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonWithDoubleKbd, ButtonWithKbd } from "../../../../../../components/ui/button-with-kbd";
import { moveNextLine, movePrevLine } from "../../../_lib/playing/move-line";

export const FooterButtons = () => {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isReady = sceneGroup === "Ready";
  const isPlaying = isYTStarted && sceneGroup === "Playing";
  const { id: mapId } = useParams<{ id: string }>();

  return (
    <section
      className={cn("mx-3 mt-2 mb-3 flex h-16 w-full justify-between font-bold md:h-10", isReady && "justify-end")}
    >
      {isReady && (
        <Link href={`/ime/${mapId}`} replace>
          <Button variant="outline" className="p-8 text-2xl md:p-2 md:text-base">
            変換有りタイピング
          </Button>
        </Link>
      )}
      {isPlaying && (
        <>
          <SpeedButton />
          <PracticeButtons />
          <RetryButton />
        </>
      )}
    </section>
  );
};

const SpeedButton = () => {
  const scene = useSceneState();
  const { playSpeed } = usePlaySpeedState();
  const isPaused = useIsPaused();

  if (scene === "practice") {
    return (
      <ButtonWithDoubleKbd
        buttonLabel={`${playSpeed.toFixed(2)}倍速`}
        prevKbdLabel="F9-"
        nextKbdLabel="+F10"
        onClick={() => {}}
        onClickPrev={() => handlePlaySpeedAction({ type: "down" })}
        onClickNext={() => handlePlaySpeedAction({ type: "up" })}
        disabled={isPaused}
      />
    );
  }

  return (
    <ButtonWithKbd
      buttonLabel={`${playSpeed.toFixed(2)}倍速`}
      kbdLabel="F10"
      onClick={() => handlePlaySpeedAction({ type: "toggle" })}
      disabled={isPaused || scene === "replay"}
    />
  );
};

const PracticeButtons = () => {
  const scene = useSceneState();
  const userOptions = useUserTypingOptionsState();

  return (
    (scene === "practice" || scene === "replay") && (
      <>
        <ButtonWithDoubleKbd
          buttonLabel="移動"
          prevKbdLabel="←"
          nextKbdLabel="→"
          onClick={() => {}}
          onClickPrev={() => movePrevLine()}
          onClickNext={() => moveNextLine()}
        />
        <ButtonWithKbd
          buttonLabel="リスト"
          kbdLabel={userOptions.InputModeToggleKey === "TAB" ? "F1" : "Tab"}
          onClickCapture={(event) => {
            event.stopPropagation();
            setLineResultSheet(true);
          }}
        />
      </>
    )
  );
};

const RetryButton = () => {
  const retry = useRetry();
  const isPaused = useIsPaused();
  return (
    <ButtonWithKbd
      buttonLabel="やり直し"
      kbdLabel="F4"
      onClick={() => {
        const { scene } = readUtilityParams();

        if (scene === "play" || scene === "practice" || scene === "replay") {
          retry(scene);
        }
      }}
      disabled={isPaused}
    />
  );
};
