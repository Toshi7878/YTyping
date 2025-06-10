"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useGameUtilityReferenceParams } from "../../atoms/refAtoms";
import { useMapState, useSceneGroupState, useSceneState, useYTStartedState } from "../../atoms/stateAtoms";
import "../../style/type.scss";
import PlayingBottom from "./scene/child/PlayingBottom";
import PlayingTop from "./scene/child/PlayingTop";
import End from "./scene/End";
import Playing from "./scene/Playing";
import Ready from "./scene/Ready";
import PracticeLineCard from "./scene/result/child/PracticeLineCard";
import ResultDrawer from "./scene/result/ResultDrawer";

interface DisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface TypingCardBodyProps {
  drawerClosure: DisclosureReturn;
}

const GameCardBody = (props: TypingCardBodyProps) => {
  const { drawerClosure } = props;
  const map = useMapState();
  const { onOpen } = drawerClosure;
  const sceneGroup = useSceneGroupState();
  const scene = useSceneState();
  const isYTStarted = useYTStartedState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";

  return (
    <CardContent className="mx-8 py-3">
      {sceneGroup === "Ready" || !isYTStarted || !map ? (
        <Ready />
      ) : isPlayed ? (
        <>
          <Playing />
          <ResultDrawer drawerClosure={drawerClosure} />
          {scene === "practice" && <PracticeLineCard />}
          {map.mapData[0].options?.eternalCSS && <style>{map.mapData[0].options?.eternalCSS}</style>}
        </>
      ) : (
        sceneGroup === "End" && (
          <>
            <End onOpen={onOpen} />
            <ResultDrawer drawerClosure={drawerClosure} />
            <style>{map.mapData[0].options?.eternalCSS}</style>
          </>
        )
      )}
    </CardContent>
  );
};

function MainGameCard() {
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
    <Card className="typing-card" id="typing_card">
      <CardHeader className="mx-3 py-0">
        <PlayingTop />
      </CardHeader>
      <GameCardBody drawerClosure={drawerClosure} />
      <CardFooter className="mx-3 flex-col py-0 select-none">
        <PlayingBottom />
      </CardFooter>
    </Card>
  );
}

export default MainGameCard;
