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
import { useMoveLine } from "@/app/(typing)/type/_lib/hooks/playing-hooks/moveLine";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing-hooks/retry";
import { cn } from "@/lib/utils";
import { BottomButton, BottomDoubleKeyButton } from "./button-with-key";

const BottomButtons = () => {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";
  return (
    <section className={cn("mx-3 mt-2 mb-4 flex w-full justify-between font-bold", !isPlayed && "invisible")}>
      <SpeedButton />
      <PracticeButtons />
      <RetryButton />
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
