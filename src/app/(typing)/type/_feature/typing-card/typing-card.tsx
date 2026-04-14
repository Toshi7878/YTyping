"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBuiltMapState, useSceneGroupState, useSceneState, useYTStartedState } from "../../_atoms/state";
import { EndScene } from "./end/end-scene";
import { FooterButtons } from "./footer/buttons";
import { PlaybackTimeDisplay } from "./footer/playback-time";
import { SkipGuideMessage } from "./footer/skip";
import { TotalTimeProgress } from "./footer/total-time-progress";
import { Combo } from "./header/combo";
import { LineTimeProgress } from "./header/line-time-progress";
import { LineRemainTimeAndKpm } from "./header/linekpm-and-remain-time";
import { PlayingNotify } from "./header/notify";
import { PracticeLineSheet } from "./playing/line-practice/line-practice-sheet";
import { PlayingScene } from "./playing/playing-scene";
import { ReadyScene } from "./ready/ready-scene";

export const TypingCard = ({ className }: { className?: string }) => {
  const sceneGroup = useSceneGroupState();
  return (
    <Card className={cn("typing-card block p-0", className)} id="typing_card">
      <GameCardHeader className="mx-3 block py-0" />
      <GameCardContent className={cn("block", sceneGroup === "Playing" ? "pt-0 pr-0 pb-4 pl-12" : "px-12 py-2")} />
      <GameCardFooter className="mx-3 select-none flex-col py-0" />
    </Card>
  );
};

const GameCardHeader = ({ className }: { className?: string }) => {
  const sceneGroup = useSceneGroupState();
  const isYTStarted = useYTStartedState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";

  return (
    <CardHeader className={className}>
      <section
        className={cn(
          "relative top-card-text mt-3 mr-2 mb-1 ml-1 flex items-center justify-between font-bold font-mono text-5xl md:text-3xl",
          !isPlayed && "invisible",
        )}
      >
        <Combo />
        <PlayingNotify />
        <LineRemainTimeAndKpm />
      </section>
      <LineTimeProgress id="line_progress" />
    </CardHeader>
  );
};

interface TypingCardBodyProps {
  className?: string;
}

const GameCardContent = ({ className }: TypingCardBodyProps) => {
  const map = useBuiltMapState();
  const sceneGroup = useSceneGroupState();
  const scene = useSceneState();
  const isYTStarted = useYTStartedState();
  const isReady = sceneGroup === "Ready" || !isYTStarted || !map;
  const isPlayed = isYTStarted && sceneGroup === "Playing";

  const minHeight = "min-h-[460px] md:min-h-[300px]";
  return (
    <CardContent className={className}>
      {isReady ? (
        <ReadyScene className={minHeight} />
      ) : isPlayed ? (
        <PlayingScene className={minHeight} />
      ) : (
        <EndScene className={minHeight} />
      )}

      {scene === "practice" && <PracticeLineSheet />}
      {(sceneGroup === "Playing" || sceneGroup === "End") && map?.lines[0]?.options?.eternalCSS && (
        <style>{map.lines[0].options?.eternalCSS}</style>
      )}
    </CardContent>
  );
};

const GameCardFooter = ({ className }: { className?: string }) => {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";
  return (
    <CardFooter className={className}>
      <section
        className={cn(
          "bottom-card-text flex w-full items-center justify-between px-4 pb-1 font-bold text-4xl md:text-xl",
          !isPlayed && "invisible",
        )}
      >
        <SkipGuideMessage />
        <PlaybackTimeDisplay />
      </section>
      <TotalTimeProgress id="total_progress" />
      <FooterButtons />
    </CardFooter>
  );
};
