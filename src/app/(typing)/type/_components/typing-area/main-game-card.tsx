"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMapState, useSceneGroupState, useSceneState, useYTStartedState } from "../../_lib/atoms/state-atoms";
import { EndScene } from "./end/end-scene";
import { PlayingScene } from "./playing/playing-scene";
import { ReadyScene } from "./ready/ready-scene";

import { BottomButtons } from "./shared/bottom-child/bottom-buttons";
import { SkipAndTimeDisplay } from "./shared/bottom-child/skip-and-time-display";
import { PracticeLineCard } from "./shared/result/child/practice-line-card";
import { ResultDrawer } from "./shared/result/result-drawer";
import { TimeProgress } from "./shared/time-progress";
import { GameStatusHeader } from "./shared/top-child/game-status-header";

export const MainGameCard = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("typing-card block p-0", className)} id="typing_card">
      <GameCardHeader className="mx-3 block py-0" />
      <GameCardContent className="block px-12 py-2" />
      <GameCardFooter className="mx-3 flex-col py-0 select-none" />
    </Card>
  );
};

const GameCardHeader = ({ className }: { className?: string }) => {
  return (
    <CardHeader className={className}>
      <GameStatusHeader />
      <TimeProgress id="line_progress" />
    </CardHeader>
  );
};

interface TypingCardBodyProps {
  className?: string;
}

const GameCardContent = ({ className }: TypingCardBodyProps) => {
  const map = useMapState();
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
          <ResultDrawer />
          {scene === "practice" && <PracticeLineCard />}
          {map?.mapData[0].options?.eternalCSS && <style>{map.mapData[0].options?.eternalCSS}</style>}
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
      <BottomButtons />
    </CardFooter>
  );
};
