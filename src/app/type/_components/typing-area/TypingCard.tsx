"use client";
import CustomCard from "@/components/custom-ui/CustomCard";
import {
  CardBody,
  CardFooter,
  CardHeader,
  useDisclosure,
  UseDisclosureReturn,
} from "@chakra-ui/react";
import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { getTypeAtomStore } from "../../[id]/TypeProvider";
import "../../style/type.scss";
import { useMapAtom, useSceneAtom, useSetTabIndexAtom } from "../../type-atoms/gameRenderAtoms";
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
  const { isOpen, onOpen } = drawerClosure;
  const setTabIndex = useSetTabIndexAtom();
  const scene = useSceneAtom();
  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  // useEffect(() => {
  //   if (isPlayed) {
  //     typeTicker.add(playTimer);
  //   }

  //   return () => {
  //     typeTicker.remove(playTimer);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [scene]);

  useEffect(() => {
    if (isPlayed) {
      setTabIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <CardBody mx={8} py={3}>
      {scene === "ready" ? (
        <Ready />
      ) : isPlayed && map ? (
        <>
          <Playing drawerClosure={drawerClosure} />

          {isOpen && <ResultDrawer drawerClosure={drawerClosure} />}
          {scene === "practice" && <PracticeLineCard />}

          {map!.mapData[0].options?.eternalCSS && (
            <style>{map!.mapData[0].options?.eternalCSS}</style>
          )}
        </>
      ) : scene === "end" ? (
        <>
          <End onOpen={onOpen} />

          {isOpen && <ResultDrawer drawerClosure={drawerClosure} />}

          <style>{map!.mapData[0].options?.eternalCSS}</style>
        </>
      ) : null}
    </CardBody>
  );
};

export const drawerClosureAtom = atom<UseDisclosureReturn | null>(null);
const typeAtomStore = getTypeAtomStore();

export const useSetDrawerClosureAtom = () => {
  return useSetAtom(drawerClosureAtom, { store: typeAtomStore });
};

function TypingCard() {
  const drawerClosure = useDisclosure();
  const setDrawerClosure = useSetDrawerClosureAtom();

  useEffect(() => {
    setDrawerClosure(drawerClosure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerClosure]);

  return (
    <CustomCard className="typing-card">
      <CardHeader py={0} mx={3}>
        <PlayingTop />
      </CardHeader>
      <TypingCardBody drawerClosure={drawerClosure} />
      <CardFooter py={0} mx={3} flexDirection="column">
        <PlayingBottom />
      </CardFooter>
    </CustomCard>
  );
}

export default TypingCard;
