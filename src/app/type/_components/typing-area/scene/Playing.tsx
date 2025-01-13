import {
  useSceneAtom,
  useSetLineWordAtom,
  useSetLyricsAtom,
  useSetNextLyricsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useHandleKeydown } from "@/app/type/hooks/playing-hooks/keydown-hooks/useHandleKeydown";
import { useStartTimer } from "@/app/type/hooks/playing-hooks/timer-hooks/useStartTimer";
import { defaultLineWord, defaultNextLyrics, typeTicker } from "@/app/type/ts/const/consts";
import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
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

  const handleKeydown = useHandleKeydown();
  const volumeAtom = useVolumeAtom();

  useEffect(() => {
    startTimer();
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeAtom]);

  useEffect(() => {
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
