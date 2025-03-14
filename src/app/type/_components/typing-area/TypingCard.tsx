"use client";
import CustomCard from "@/components/custom-ui/CustomCard";
import {
  CardBody,
  CardFooter,
  CardHeader,
  useDisclosure,
  UseDisclosureReturn,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useMapAtom, useSceneAtom, useSetDrawerClosureAtom } from "../../atoms/stateAtoms";
import "../../style/type.scss";
import PlayingBottom from "./scene/child/PlayingBottom";
import PlayingTop from "./scene/child/PlayingTop";
import End from "./scene/End";
import Playing from "./scene/Playing";
import PracticeLineCard from "./scene/playing-child/PracticeLineCard";
import Ready from "./scene/Ready";
import ResultDrawer from "./scene/result/ResultDrawer";

interface TypingCardBodyProps {
  drawerClosure: UseDisclosureReturn;
}

export const CARD_BODY_MIN_HEIGHT = { base: "460px", md: "320px" };

const TypingCardBody = (props: TypingCardBodyProps) => {
  const { drawerClosure } = props;
  const map = useMapAtom();
  const { onOpen } = drawerClosure;
  const scene = useSceneAtom();
  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  return (
    <CardBody mx={8} py={3}>
      {scene === "ready" ? (
        <Ready />
      ) : isPlayed && map ? (
        <>
          <Playing drawerClosure={drawerClosure} />
          <ResultDrawer drawerClosure={drawerClosure} />
          {scene === "practice" && <PracticeLineCard />}
          {map!.mapData[0].options?.eternalCSS && (
            <style>{map!.mapData[0].options?.eternalCSS}</style>
          )}
        </>
      ) : scene === "end" ? (
        <>
          <End onOpen={onOpen} />
          <ResultDrawer drawerClosure={drawerClosure} />
          <style>{map!.mapData[0].options?.eternalCSS}</style>
        </>
      ) : null}
    </CardBody>
  );
};

function TypingCard() {
  const drawerClosure = useDisclosure();
  const setDrawerClosure = useSetDrawerClosureAtom();

  useEffect(() => {
    setDrawerClosure(drawerClosure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerClosure]);

  return (
    <CustomCard className="typing-card" id="typing_card">
      <CardHeader py={0} mx={3}>
        <PlayingTop />
      </CardHeader>
      <TypingCardBody drawerClosure={drawerClosure} />
      <CardFooter py={0} mx={3} flexDirection="column" userSelect="none">
        <PlayingBottom />
      </CardFooter>
    </CustomCard>
  );
}

export default TypingCard;
