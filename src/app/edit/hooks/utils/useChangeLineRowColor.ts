import { useTbody } from "../../atoms/refAtoms";
import { LINE_ROW_SWITCH_CLASSNAMES } from "../../ts/const/editDefaultValues";

export const useChangeLineRowColor = () => {
  const { readTbody } = useTbody();

  const removeSelectedLineColor = () => {
    const selectedLine = readTbody().querySelector(".selected-line");

    if (selectedLine) {
      selectedLine.classList.remove(LINE_ROW_SWITCH_CLASSNAMES.selected);
    }
  };

  const removeCurrentTimeLineColor = () => {
    const currentTimeLine = readTbody().querySelector(LINE_ROW_SWITCH_CLASSNAMES.currentTime);

    if (currentTimeLine) {
      currentTimeLine.classList.remove(LINE_ROW_SWITCH_CLASSNAMES.currentTime);
    }
  };

  const addLineSeekColor = (seekCount: number) => {
    removeSelectedLineColor();
    removeCurrentTimeLineColor();
    readTbody().children[seekCount].classList.add(
      LINE_ROW_SWITCH_CLASSNAMES.selected,
      LINE_ROW_SWITCH_CLASSNAMES.currentTime
    );
  };

  const allUpdateSelectColor = (selectCount: number) => {
    const tbodyChildren = readTbody().children;
    if (tbodyChildren) {
      for (let i = 0; i < tbodyChildren.length; i++) {
        const trElement = tbodyChildren[i] as HTMLElement;
        if (trElement.getAttribute("data-line-index") === String(selectCount)) {
          trElement.classList.add(LINE_ROW_SWITCH_CLASSNAMES.selected);
        } else {
          trElement.classList.remove(LINE_ROW_SWITCH_CLASSNAMES.selected);
        }
      }
    }
  };

  const allUpdateCurrentTimeColor = (newCurrentCount: number) => {
    const tbodyChildren = readTbody().children;
    if (tbodyChildren) {
      for (let i = 0; i < tbodyChildren.length; i++) {
        const trElement = tbodyChildren[i] as HTMLElement;
        if (trElement.getAttribute("data-line-index") === String(newCurrentCount)) {
          trElement.classList.add(LINE_ROW_SWITCH_CLASSNAMES.currentTime);
        } else {
          trElement.classList.remove(LINE_ROW_SWITCH_CLASSNAMES.currentTime);
        }
      }
    }
  };
  return {
    removeSelectedLineColor,
    removeCurrentTimeLineColor,
    addLineSeekColor,
    allUpdateSelectColor,
    allUpdateCurrentTimeColor,
  };
};
