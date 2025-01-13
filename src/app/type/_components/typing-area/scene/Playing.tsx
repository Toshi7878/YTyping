import {
  usePlayingInputModeAtom,
  useSceneAtom,
  useSetLineWordAtom,
  useSetLyricsAtom,
  useSetNextLyricsAtom,
  useTimeOffsetAtom,
  useTypePageSpeedAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useHandleKeydown } from "@/app/type/hooks/playing-hooks/keydown-hooks/useHandleKeydown";
import { useStartTimer } from "@/app/type/hooks/playing-hooks/timer-hooks/useStartTimer";
import { usePlayTimer } from "@/app/type/hooks/playing-hooks/timer-hooks/useTimer";
import { defaultLineWord, defaultNextLyrics, typeTicker } from "@/app/type/ts/const/consts";
import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { UseDisclosureReturn } from "@chakra-ui/react";

interface PlayingProps {
  drawerClosure: UseDisclosureReturn;
}
const Playing = ({ drawerClosure }: PlayingProps) => {
  const { onOpen } = drawerClosure;

  const setLineWord = useSetLineWordAtom();
  const setLyrics = useSetLyricsAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const startTimer = useStartTimer();

  const playTimer = usePlayTimer();

  const handleKeydown = useHandleKeydown();

  const scene = useSceneAtom();
  const volume = useVolumeAtom();
  const userOptions = useUserOptionsAtom();
  const timeOffset = useTimeOffsetAtom();
  const playSpeed = useTypePageSpeedAtom();

  const inputMode = usePlayingInputModeAtom();
  useEffect(() => {
    if (scene === "replay") {
      typeTicker.maxFPS = 0; // リプレイモードは制限なし
    } else {
      typeTicker.maxFPS = 60;
    }
    typeTicker.add(playTimer);

    startTimer();
    document.addEventListener("keydown", handleKeydown);

    return () => {
      typeTicker.remove(playTimer);
      document.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, scene, userOptions, inputMode, timeOffset, playSpeed]);

  useEffect(() => {
    if (scene === "practice") {
      onOpen();
    }

    return () => {
      if (typeTicker.started) {
        typeTicker.remove(playTimer);
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
