import { useStore } from "jotai";
import { typingStatusRefAtom, usePlayer, ytStateRefAtom } from "../atoms/refAtoms";
import {
  useMapAtom,
  useTimeOffsetAtom,
  useTypePageSpeedAtom,
  useUserTypingOptionsAtom,
} from "../atoms/stateAtoms";

export const useGetTime = () => {
  const map = useMapAtom();
  const userOptions = useUserTypingOptionsAtom();
  const timeOffset = useTimeOffsetAtom();
  const speed = useTypePageSpeedAtom();
  const typeAtomStore = useStore();
  const player = usePlayer();

  const getCurrentOffsettedYTTime = () => {
    const result = player.getCurrentTime() - userOptions.time_offset - timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime / speed.playSpeed;
  };

  const getCurrentLineTime = (YTCurrentTime: number) => {
    const count = typeAtomStore.get(typingStatusRefAtom).count;

    if (count - 1 < 0) {
      return YTCurrentTime;
    }

    const prevLine = map!.mapData[count - 1];
    const lineTime = YTCurrentTime - Number(prevLine.time);
    return lineTime;
  };

  const getCurrentLineRemainTime = (YTCurrentTime: number) => {
    const count = typeAtomStore.get(typingStatusRefAtom).count;
    const nextLine = map!.mapData[count];

    const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const lineRemainTime = (nextLineTime - YTCurrentTime) / speed.playSpeed;

    return lineRemainTime;
  };

  const getConstantLineTime = (lineTime: number) => {
    const lineConstantTime = Math.round((lineTime / speed.playSpeed) * 1000) / 1000;
    return lineConstantTime;
  };

  const getConstantRemainLineTime = (lineConstantTime: number) => {
    const count = typeAtomStore.get(typingStatusRefAtom).count;

    const nextLine = map!.mapData[count];
    const currentLine = map!.mapData[count - 1];
    const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const lineRemainConstantTime = nextLineTime - currentLine.time - lineConstantTime;
    return lineRemainConstantTime;
  };

  return {
    getCurrentOffsettedYTTime,
    getConstantOffsettedYTTime,
    getCurrentLineTime,
    getConstantLineTime,
    getConstantRemainLineTime,
    getCurrentLineRemainTime,
  };
};
