import { useStore } from "jotai";
import { usePlayer, useResultCards, useStatusRef } from "../../atoms/refAtoms";
import {
  lineSelectIndexAtom,
  sceneAtom,
  speedAtom,
  useMapAtom,
  useSetLineSelectIndexAtom,
  useSetPlayingNotifyAtom,
} from "../../atoms/stateAtoms";
import { typeTicker } from "../../ts/const/consts";
import { useGetSeekLineCount } from "./timer-hooks/useSeekGetLineCount";
import { useUpdateLine } from "./timer-hooks/useTimer";

export const useMoveLine = () => {
  const { readPlayer } = usePlayer();
  const map = useMapAtom();
  const typeAtomStore = useStore();
  const setLineSelectIndex = useSetLineSelectIndexAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const updateLine = useUpdateLine();
  const getSeekLineCount = useGetSeekLineCount();

  const { readResultCards } = useResultCards();
  const { readStatusRef, writeStatusRef } = useStatusRef();

  const movePrevLine = () => {
    const scene = typeAtomStore.get(sceneAtom);
    const count = readStatusRef().count - (scene === "replay" ? 1 : 0);
    const prevCount = structuredClone(map!.typingLineNumbers)
      .reverse()
      .find((num) => num < count);

    if (prevCount === undefined) {
      return;
    }
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const seekBuffer = scene === "practice" ? 1 * playSpeed : 0;
    const prevTime = Number(map!.mapData[prevCount]["time"]) - seekBuffer;
    const newLineSelectIndex = map!.typingLineNumbers.indexOf(prevCount) + 1;
    setLineSelectIndex(newLineSelectIndex);
    if (typeTicker.started) {
      typeTicker.stop();
    }

    const newCount = getSeekLineCount(prevTime);
    writeStatusRef({ count: newCount });
    updateLine(newCount);

    readPlayer().seekTo(prevTime, true);
    setNotify(Symbol(`◁`));
    drawerSelectColorChange(newLineSelectIndex);
    scrollToCard(newLineSelectIndex);
  };

  const moveNextLine = () => {
    const lineSelectIndex = typeAtomStore.get(lineSelectIndexAtom);
    const seekCount = lineSelectIndex ? map!.typingLineNumbers[lineSelectIndex - 1] : null;
    const seekCountAdjust = seekCount && seekCount === readStatusRef().count ? 0 : -1;

    const count = readStatusRef().count + seekCountAdjust;
    const nextCount = map!.typingLineNumbers.find((num) => num > count);

    if (nextCount === undefined) {
      return;
    }

    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const prevLineTime =
      (nextCount > 1 ? map!.mapData[nextCount]["time"] - map!.mapData[nextCount - 1]["time"] : 0) /
      playSpeed;

    const scene = typeAtomStore.get(sceneAtom);
    const seekBuffer = scene === "practice" && prevLineTime > 1 ? 1 * playSpeed : 0;
    const nextTime = Number(map!.mapData[nextCount]["time"]) - seekBuffer;

    const newLineSelectIndex = map!.typingLineNumbers.indexOf(nextCount) + 1;

    setLineSelectIndex(newLineSelectIndex);
    if (typeTicker.started) {
      typeTicker.stop();
    }

    const newCount = getSeekLineCount(nextTime);
    writeStatusRef({ count: newCount });
    updateLine(newCount);

    readPlayer().seekTo(nextTime, true);
    setNotify(Symbol(`▷`));
    drawerSelectColorChange(newLineSelectIndex);
    scrollToCard(newLineSelectIndex);
  };

  const moveSetLine = (seekCount: number) => {
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;
    const scene = typeAtomStore.get(sceneAtom);
    const seekBuffer = scene === "practice" ? 1 * playSpeed : 0;
    const seekTime = Number(map!.mapData[seekCount]["time"]) - seekBuffer;

    const lineSelectIndex = typeAtomStore.get(lineSelectIndexAtom);

    if (lineSelectIndex !== seekCount) {
      drawerSelectColorChange(seekCount);
    }
    readPlayer().seekTo(seekTime, true);
    const newCount = getSeekLineCount(seekTime);
    writeStatusRef({ count: newCount });
    updateLine(newCount);
    typeTicker.stop();
  };

  const drawerSelectColorChange = (newLineSelectIndex: number) => {
    const resultCards = readResultCards();
    for (let i = 0; i < resultCards.length; i++) {
      const card = resultCards[i];

      if (!card) {
        continue;
      }
      if (newLineSelectIndex === i) {
        resultCards[i].classList.add("result-line-select-outline");
        resultCards[i].classList.remove("result-line-hover");
      } else {
        resultCards[i].classList.add("result-line-hover");
        resultCards[i].classList.remove("result-line-select-outline");
      }
    }
  };
  const scrollToCard = (newIndex: number) => {
    const resultCards = readResultCards();

    const card: HTMLDivElement = resultCards[newIndex];

    if (card) {
      const drawerBody = card.parentNode as HTMLDivElement;
      const scrollHeight = drawerBody.scrollHeight;
      drawerBody.scrollTop = (scrollHeight * (newIndex - 2)) / map!.typingLineNumbers.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return { movePrevLine, moveNextLine, moveSetLine, scrollToCard, drawerSelectColorChange };
};
