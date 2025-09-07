"use client";
import { usePlaySpeedReducer, usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useSceneGroupState,
  useSceneState,
  useSetLineResultDrawer,
  useUserTypingOptionsState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useMoveLine } from "@/app/(typing)/type/_lib/hooks/playing/moveLine";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing/retry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomButton, BottomDoubleKeyButton } from "./button-with-key";

const BottomButtons = () => {
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
  const dispatchSpeed = usePlaySpeedReducer();

  if (scene === "practice") {
    return (
      <BottomDoubleKeyButton
        badgeText={playSpeed.toFixed(2) + "倍速"}
        kbdTextPrev="F9-"
        kbdTextNext="+F10"
        onClick={() => {}}
        onClickPrev={() => dispatchSpeed({ type: "down" })}
        onClickNext={() => dispatchSpeed({ type: "up" })}
      />
    );
  }

  return (
    <BottomButton
      badgeText={playSpeed.toFixed(2) + "倍速"}
      kbdText="F10"
      onClick={() => dispatchSpeed({ type: "toggle" })}
      isPauseDisabled={true}
      isKbdHidden={scene === "replay" ? true : false}
    />
  );
};

const PracticeButtons = () => {
  const scene = useSceneState();
  const setLineResultDrawer = useSetLineResultDrawer();
  const { movePrevLine, moveNextLine } = useMoveLine();
  const userOptions = useUserTypingOptionsState();

  return (
    (scene === "practice" || scene === "replay") && (
      <>
        <BottomDoubleKeyButton
          badgeText="移動"
          kbdTextPrev="←"
          kbdTextNext="→"
          onClick={() => {}}
          onClickPrev={() => movePrevLine()}
          onClickNext={() => moveNextLine()}
        />
        <BottomButton
          badgeText="リスト"
          kbdText={userOptions.toggle_input_mode_key === "TAB" ? "F1" : "Tab"}
          onClick={() => setLineResultDrawer(true)}
          isPauseDisabled={false}
          isKbdHidden={false}
        />
      </>
    )
  );
};

const RetryButton = () => {
  const retry = useRetry();
  const readGameStateUtils = useReadGameUtilParams();

  return (
    <BottomButton
      badgeText="やり直し"
      kbdText="F4"
      onClick={() => {
        const { scene } = readGameStateUtils();

        if (scene === "play" || scene === "practice" || scene === "replay") {
          retry(scene);
        }
      }}
      isPauseDisabled={true}
      isKbdHidden={false}
    />
  );
};

export default BottomButtons;
