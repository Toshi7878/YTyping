import { useStore } from "jotai";
import { typingStatusRefAtom, usePlayer } from "../../atoms/refAtoms";
import {
  lineSelectIndexAtom,
  sceneAtom,
  speedAtom,
  useMapAtom,
  useSetLineSelectIndexAtom,
  useSetPlayingNotifyAtom,
} from "../../atoms/stateAtoms";
import { typeTicker } from "../../ts/const/consts";
import { useRefs } from "../../type-contexts/refsProvider";
import { useGetSeekLineCount } from "./timer-hooks/useSeekGetLineCount";
import { useUpdateLine } from "./timer-hooks/useTimer";

export const useMoveLine = () => {
  const { cardRefs } = useRefs();
  const player = usePlayer();
  const map = useMapAtom();
  const typeAtomStore = useStore();
  const setLineSelectIndex = useSetLineSelectIndexAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const updateLine = useUpdateLine();
  const getSeekLineCount = useGetSeekLineCount();

  const movePrevLine = () => {
    const scene = typeAtomStore.get(sceneAtom);
    const count = typeAtomStore.get(typingStatusRefAtom).count - (scene === "replay" ? 1 : 0);
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
    typeAtomStore.set(typingStatusRefAtom, (prev) => ({ ...prev, count: newCount }));
    updateLine(newCount);

    player.seekTo(prevTime, true);
    setNotify(Symbol(`◁`));
    drawerSelectColorChange(newLineSelectIndex);
    scrollToCard(newLineSelectIndex);
  };

  const moveNextLine = () => {
    const lineSelectIndex = typeAtomStore.get(lineSelectIndexAtom);
    const seekCount = lineSelectIndex ? map!.typingLineNumbers[lineSelectIndex - 1] : null;
    const seekCountAdjust =
      seekCount && seekCount === typeAtomStore.get(typingStatusRefAtom).count ? 0 : -1;

    const count = typeAtomStore.get(typingStatusRefAtom).count + seekCountAdjust;
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
    typeAtomStore.set(typingStatusRefAtom, (prev) => ({ ...prev, count: newCount }));
    updateLine(newCount);

    player.seekTo(nextTime, true);
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
    player.seekTo(seekTime, true);
    const newCount = getSeekLineCount(seekTime);
    typeAtomStore.set(typingStatusRefAtom, (prev) => ({ ...prev, count: newCount }));
    updateLine(newCount);
    typeTicker.stop();
  };

  const drawerSelectColorChange = (newLineSelectIndex: number) => {
    for (let i = 0; i < cardRefs.current!.length; i++) {
      const card = cardRefs.current![i];

      if (!card) {
        continue;
      }
      if (newLineSelectIndex === i) {
        cardRefs.current![i].classList.add("result-line-select-outline");
        cardRefs.current![i].classList.remove("result-line-hover");
      } else {
        cardRefs.current![i].classList.add("result-line-hover");
        cardRefs.current![i].classList.remove("result-line-select-outline");
      }
    }
  };
  const scrollToCard = (newIndex: number) => {
    const card: HTMLDivElement = cardRefs.current![newIndex];

    if (card) {
      const drawerBody = card.parentNode as HTMLDivElement;
      const scrollHeight = drawerBody.scrollHeight;
      drawerBody.scrollTop = (scrollHeight * (newIndex - 2)) / map!.typingLineNumbers.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return { movePrevLine, moveNextLine, moveSetLine, scrollToCard, drawerSelectColorChange };
};
