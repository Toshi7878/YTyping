import { usePlaySpeedStateRef } from "../../atoms/reducerAtoms";
import { usePlayer, useResultCards, useStatusRef } from "../../atoms/refAtoms";
import {
  useLineSelectIndexStateRef,
  useMapStateRef,
  useSceneStateRef,
  useSetLineSelectIndexState,
  useSetNotifyState,
} from "../../atoms/stateAtoms";
import { typeTicker } from "../../ts/const/consts";
import { useGetSeekLineCount } from "./timer-hooks/useSeekGetLineCount";
import { useUpdateLine } from "./timer-hooks/useTimer";

export const useMoveLine = () => {
  const { readPlayer } = usePlayer();
  const setLineSelectIndex = useSetLineSelectIndexState();
  const setNotify = useSetNotifyState();
  const updateLine = useUpdateLine();
  const getSeekLineCount = useGetSeekLineCount();

  const { readResultCards } = useResultCards();
  const { readStatus, writeStatus } = useStatusRef();
  const readScene = useSceneStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readLineSelectIndex = useLineSelectIndexStateRef();
  const readMap = useMapStateRef();

  const movePrevLine = () => {
    const map = readMap();
    const scene = readScene();
    const count = readStatus().count - (scene === "replay" ? 1 : 0);
    const prevCount = structuredClone(map.typingLineNumbers)
      .reverse()
      .find((num) => num < count);

    if (prevCount === undefined) {
      return;
    }
    const playSpeed = readPlaySpeed().playSpeed;

    const seekBuffer = scene === "practice" ? 1 * playSpeed : 0;
    const prevTime = Number(map.mapData[prevCount]["time"]) - seekBuffer;
    const newLineSelectIndex = map.typingLineNumbers.indexOf(prevCount) + 1;
    setLineSelectIndex(newLineSelectIndex);
    if (typeTicker.started) {
      typeTicker.stop();
    }

    const newCount = getSeekLineCount(prevTime);
    writeStatus({ count: newCount });
    updateLine(newCount);

    readPlayer().seekTo(prevTime, true);
    setNotify(Symbol(`◁`));
    drawerSelectColorChange(newLineSelectIndex);
    scrollToCard(newLineSelectIndex);
  };

  const moveNextLine = () => {
    const map = readMap();
    const lineSelectIndex = readLineSelectIndex();
    const seekCount = lineSelectIndex ? map.typingLineNumbers[lineSelectIndex - 1] : null;
    const seekCountAdjust = seekCount && seekCount === readStatus().count ? 0 : -1;

    const count = readStatus().count + seekCountAdjust;
    const nextCount = map.typingLineNumbers.find((num) => num > count);

    if (nextCount === undefined) {
      return;
    }

    const playSpeed = readPlaySpeed().playSpeed;

    const prevLineTime =
      (nextCount > 1 ? map.mapData[nextCount]["time"] - map.mapData[nextCount - 1]["time"] : 0) / playSpeed;

    const scene = readScene();
    const seekBuffer = scene === "practice" && prevLineTime > 1 ? 1 * playSpeed : 0;
    const nextTime = Number(map.mapData[nextCount]["time"]) - seekBuffer;

    const newLineSelectIndex = map.typingLineNumbers.indexOf(nextCount) + 1;

    setLineSelectIndex(newLineSelectIndex);
    if (typeTicker.started) {
      typeTicker.stop();
    }

    const newCount = getSeekLineCount(nextTime);
    writeStatus({ count: newCount });
    updateLine(newCount);

    readPlayer().seekTo(nextTime, true);
    setNotify(Symbol(`▷`));
    drawerSelectColorChange(newLineSelectIndex);
    scrollToCard(newLineSelectIndex);
  };

  const moveSetLine = (seekCount: number) => {
    const map = readMap();
    const playSpeed = readPlaySpeed().playSpeed;
    const scene = readScene();
    const seekBuffer = scene === "practice" ? 1 * playSpeed : 0;
    const seekTime = Number(map.mapData[seekCount]["time"]) - seekBuffer;

    const lineSelectIndex = readLineSelectIndex();

    if (lineSelectIndex !== seekCount) {
      drawerSelectColorChange(seekCount);
    }
    readPlayer().seekTo(seekTime, true);
    const newCount = getSeekLineCount(seekTime);
    writeStatus({ count: newCount });
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
    const map = readMap();
    const resultCards = readResultCards();

    const card: HTMLDivElement = resultCards[newIndex];

    if (card) {
      const drawerBody = card.parentNode as HTMLDivElement;
      const scrollHeight = drawerBody.scrollHeight;
      drawerBody.scrollTop = (scrollHeight * (newIndex - 2)) / map.typingLineNumbers.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return { movePrevLine, moveNextLine, moveSetLine, scrollToCard, drawerSelectColorChange };
};
