"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  readMinMediaSpeed,
  readUtilityParams,
  useIsPausedState,
  useMediaSpeedState,
  useSceneGroupState,
  useSceneState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ButtonWithDoubleKbd, ButtonWithKbd } from "../../../../../../components/ui/button-with-kbd";
import { cycleYTPlaybackRate, stepYTPlaybackRate } from "../../../_lib/atoms/youtube-player";
import { commitPlayRestart } from "../../../_lib/playing/commit-play-restart";
import { moveNextLine, movePrevLine } from "../../../_lib/playing/move-line";
import { FloatingPracticeLineCard } from "../line-practice/card/floating-line-card";

export const FooterButtons = () => {
  const isYTStarted = useYTStartedState();
  const scene = useSceneState();
  const sceneGroup = useSceneGroupState();
  const isReady = sceneGroup === "Ready";
  const { id: mapId } = useParams<{ id: string }>();
  const { data: session } = useSession();

  return (
    <section
      className={cn("mx-3 mt-2 mb-3 flex h-16 w-full justify-between font-bold md:h-10", isReady && "justify-end")}
    >
      {isReady && !!session && (
        <Link href={`/ime/${mapId}`} replace>
          <Button variant="outline" className="p-8 text-2xl md:p-2 md:text-base">
            変換有りタイピング
          </Button>
        </Link>
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
    </section>
  );
};

const SpeedButton = () => {
  const scene = useSceneState();
  const playSpeed = useMediaSpeedState();
  const isPaused = useIsPausedState();

  if (scene === "practice") {
    return (
      <ButtonWithDoubleKbd
        buttonLabel={`${playSpeed.toFixed(2)}倍速`}
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
      buttonLabel={`${playSpeed.toFixed(2)}倍速`}
      kbdLabel="F10"
      onClick={() => {
        const minMediaSpeed = readMinMediaSpeed();
        cycleYTPlaybackRate({ minSpeed: minMediaSpeed });
      }}
      disabled={isPaused || scene === "replay"}
    />
  );
};

const RetryButton = () => {
  const isPaused = useIsPausedState();
  return (
    <ButtonWithKbd
      buttonLabel="やり直し"
      kbdLabel="F4"
      onClick={() => {
        const { scene } = readUtilityParams();

        if (scene === "play" || scene === "practice" || scene === "replay") {
          commitPlayRestart(scene);
        }
      }}
      disabled={isPaused}
    />
  );
};

const LineMoveButton = () => {
  return (
    <ButtonWithDoubleKbd
      buttonLabel="移動"
      prevKbdLabel="←"
      nextKbdLabel="→"
      onClick={() => {}}
      onClickPrev={() => movePrevLine()}
      onClickNext={() => moveNextLine()}
    />
  );
};

// const ListButton = () => {
//   const { InputModeToggleKey } = useTypingOptionsState();

//   return (
//     <ButtonWithKbd
//       buttonLabel="リスト"
//       kbdLabel={InputModeToggleKey === "TAB" ? "F1" : "Tab"}
//       onClickCapture={(event) => {
//         event.stopPropagation();
//         setLineResultSheet(true);
//       }}
//     />
//   );
// };

// const PracticeSelectedLine = () => {
//   const lineSelectIndex = useLineSelectIndexState();
//   const lineResult = useLineResultState(lineSelectIndex - 1);
//   if (!lineResult) return null;
//   const { missCount, typedHiragana, lostHiragana } = lineResult.lineResult.status;

//   return (
//     <span className="flex items-center gap-2 overflow-hidden">
//       {!!missCount && (
//         <span className="word-outline-text shrink-0 font-semibold text-destructive text-xs tabular-nums">
//           miss:{missCount}
//         </span>
//       )}
//       <div className="word-font word-outline-text truncate text-sm">
//         <span className={cn(lostHiragana === "" ? "text-word-completed" : "text-word-correct")}>
//           {typedHiragana?.replace(/ /g, "ˍ")}
//         </span>
//         <span className="text-word-word">{lostHiragana}</span>
//       </div>
//     </span>
//   );
// };
