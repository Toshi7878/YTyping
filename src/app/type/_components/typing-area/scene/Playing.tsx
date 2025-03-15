import {
  usePlayingInputModeAtom,
  usePlaySpeedAtom,
  useSceneAtom,
  useSetLineWordAtom,
  useSetLyricsAtom,
  useSetNextLyricsAtom,
  useTimeOffsetAtom,
  useUserTypingOptionsAtom,
} from "@/app/type/atoms/stateAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useUserStatsRef } from "@/app/type/atoms/refAtoms";
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
  const userOptions = useUserTypingOptionsAtom();
  const timeOffset = useTimeOffsetAtom();
  const playSpeed = usePlaySpeedAtom();
  const inputMode = usePlayingInputModeAtom();
  const { readUserStatsRef, writeUserStatsRef, resetUserStatsRef } = useUserStatsRef();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const sendStats = readUserStatsRef();
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
          JSON.stringify(sendStats)
        );

        resetUserStatsRef();
      }
    };
    const handleBeforeunload = () => {
      const sendStats = readUserStatsRef();
      const maxCombo = sendStats.maxCombo;
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
        JSON.stringify(sendStats)
      );
      resetUserStatsRef();

      writeUserStatsRef({
        maxCombo: structuredClone(maxCombo),
      });
    };

    if (scene === "playing" || scene === "practice") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (scene === "replay") {
      // リプレイモードは制限なし
      typeTicker.maxFPS = 0;
      typeTicker.minFPS = 0;
    } else {
      typeTicker.maxFPS = 59.99;
      typeTicker.minFPS = 59.99;
    }
    typeTicker.add(playTimer);

    startTimer();
    window.addEventListener("keydown", handleKeydown);

    return () => {
      typeTicker.remove(playTimer);
      window.removeEventListener("keydown", handleKeydown);
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
