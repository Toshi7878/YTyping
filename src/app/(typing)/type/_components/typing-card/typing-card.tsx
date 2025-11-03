"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBuiltMapState, useSceneGroupState, useSceneState, useYTStartedState } from "../../_lib/atoms/state";
import { EndScene } from "./end/end-scene";
import { FooterButtons } from "./footer/buttons";
import { SkipAndTimeDisplay } from "./footer/skip-and-time-display";
import { Combo } from "./header/combo";
import { LineRemainTimeAndKpm } from "./header/linekpm-and-remain-time";
import { PlayingNotify } from "./header/notify";
import { PlayingScene } from "./playing/playing-scene";
import { ReadyScene } from "./ready/ready-scene";
import { PracticeLineCard } from "./result/card/practice-line-card";
import { ResultListSheet } from "./result/result-list-sheet";
import { TimeProgress } from "./time-progress";

export const TypingCard = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("typing-card block p-0", className)} id="typing_card">
      <GameCardHeader className="mx-3 block py-0" />
      <GameCardContent className="block px-12 py-2" />
      <GameCardFooter className="mx-3 flex-col py-0 select-none" />
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
          "top-card-text relative mt-3 mr-2 mb-1 ml-1 flex items-center justify-between font-mono text-5xl font-bold md:text-3xl",
          !isPlayed && "invisible",
        )}
      >
        <Combo />
        <PlayingNotify />
        <LineRemainTimeAndKpm />
      </section>
      <TimeProgress id="line_progress" />
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

      {(isPlayed || sceneGroup === "End") && (
        <>
          <ResultListSheet />
          {scene === "practice" && <PracticeLineCard />}
          {map?.mapData[0]?.options?.eternalCSS && <style>{map.mapData[0].options?.eternalCSS}</style>}
        </>
      )}
    </CardContent>
  );
};

const GameCardFooter = ({ className }: { className?: string }) => {
  return (
    <CardFooter className={className}>
      <SkipAndTimeDisplay />
      <TimeProgress id="total_progress" />
      <FooterButtons />
    </CardFooter>
  );
};
