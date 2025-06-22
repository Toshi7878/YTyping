"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "@/components/ui/link/link";
import { cn } from "@/lib/utils";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameUtilityReferenceParams } from "../../_lib/atoms/refAtoms";
import { useMapState, useSceneGroupState, useSceneState, useYTStartedState } from "../../_lib/atoms/stateAtoms";
import "../../_lib/style/type.scss";
import End from "./end/End";
import Playing from "./playing/Playing";
import Ready from "./ready/Ready";
import BottomButtons from "./shared/bottom-child/BottomButtons";
import SkipGuideAndTotalTime from "./shared/bottom-child/SkipGuideAndTotalTime";
import PracticeLineCard from "./shared/result/child/PracticeLineCard";
import ResultDrawer from "./shared/result/ResultDrawer";
import TimeProgress from "./shared/TimeProgress";
import GameStatusHeader from "./shared/top-child/GameStatusHeader";

function MainGameCard({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerClosure = {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
  };
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();

  useEffect(() => {
    writeGameUtilRefParams({ lineResultdrawerClosure: drawerClosure });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerClosure]);

  return (
    <Card className={cn("typing-card", className)} id="typing_card">
      <GameCardHeader className="mx-3 py-0" />
      <GameCardContent className="mx-8 py-3" drawerClosure={drawerClosure} />
      <GameCardFooter className="mx-3 w-full flex-col py-0 select-none" />
    </Card>
  );
}

const GameCardHeader = ({ className }: { className?: string }) => {
  return (
    <CardHeader className={className}>
      <GameStatusHeader />
      <TimeProgress id="line_progress" />
    </CardHeader>
  );
};

interface DisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface TypingCardBodyProps {
  drawerClosure: DisclosureReturn;
  className?: string;
}

const GameCardContent = ({ drawerClosure, className }: TypingCardBodyProps) => {
  const map = useMapState();
  const { onOpen } = drawerClosure;
  const sceneGroup = useSceneGroupState();
  const scene = useSceneState();
  const isYTStarted = useYTStartedState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";

  return (
    <CardContent className={className}>
      {sceneGroup === "Ready" || !isYTStarted || !map ? (
        <Ready />
      ) : isPlayed ? (
        <Playing />
      ) : (
        sceneGroup === "End" && <End onOpen={onOpen} />
      )}

      {(isPlayed || sceneGroup === "End") && (
        <>
          <ResultDrawer drawerClosure={drawerClosure} />
          {scene === "practice" && <PracticeLineCard />}
          {map?.mapData[0].options?.eternalCSS && <style>{map.mapData[0].options?.eternalCSS}</style>}
        </>
      )}
    </CardContent>
  );
};

const GameCardFooter = ({ className }: { className?: string }) => {
  const sceneGroup = useSceneGroupState();
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();

  return (
    <CardFooter className={className}>
      <SkipGuideAndTotalTime />
      <TimeProgress id="total_progress" />
      <BottomButtons />
      {sceneGroup === "Ready" && (
        <Link href={`/ime/${mapId}`} onClick={(event) => handleLinkClick(event, "replace")}>
          <Button className="absolute right-10 bottom-3 p-8 text-2xl md:p-2 md:text-base">変換有りタイピング</Button>
        </Link>
      )}
    </CardFooter>
  );
};

export default MainGameCard;
