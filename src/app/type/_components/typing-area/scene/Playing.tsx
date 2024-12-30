import {
  useSceneAtom,
  useSetLineWordAtom,
  useSetLyricsAtom,
  useSetNextLyricsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useStartTimer } from "@/app/type/hooks/playing-hooks/timer-hooks/useStartTimer";
import { typeTicker } from "@/app/type/hooks/useYoutubeEvents";
import { defaultLineWord, defaultNextLyrics } from "@/app/type/ts/const/consts";
import { UseDisclosureReturn } from "@chakra-ui/react";

interface PlayingProps {
  drawerClosure: UseDisclosureReturn;
}
const Playing = ({ drawerClosure }: PlayingProps) => {
  const { onOpen } = drawerClosure;

  const scene = useSceneAtom();
  const setLineWord = useSetLineWordAtom();
  const setLyrics = useSetLyricsAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const startTimer = useStartTimer();

  useEffect(() => {
    startTimer();

    if (scene === "practice") {
      onOpen();
    }

    return () => {
      if (typeTicker.started) {
        typeTicker.stop();
      }

      setLineWord(structuredClone(defaultLineWord));
      setLyrics("");
      setNextLyrics(structuredClone(defaultNextLyrics));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PlayingCenter flex="1" />;
};

export default Playing;
