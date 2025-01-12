
import { useRefs } from '../edit-contexts/refsProvider';
import { LINE_ROW_SWITCH_CLASSNAMES } from '../ts/const/editDefaultValues';

export const useChangeLineRowColor = () => {
	const {tbodyRef} = useRefs()


	const removeSelectedLineColor = () => {
		const selectedLine = tbodyRef.current!.querySelector(".selected-line");

		if (selectedLine) {
		  selectedLine.classList.remove(LINE_ROW_SWITCH_CLASSNAMES.selected);
		}
	}

	const removeCurrentTimeLineColor = () => {
        const currentTimeLine = tbodyRef.current!.querySelector(LINE_ROW_SWITCH_CLASSNAMES.currentTime);

        if (currentTimeLine) {
          currentTimeLine.classList.remove(LINE_ROW_SWITCH_CLASSNAMES.currentTime);
        }
	}

	const addLineSeekColor = (seekCount: number) => {
		removeSelectedLineColor()
		removeCurrentTimeLineColor()
		tbodyRef.current!.children[seekCount].classList.add(LINE_ROW_SWITCH_CLASSNAMES.selected,LINE_ROW_SWITCH_CLASSNAMES.currentTime);
	}

  return {removeSelectedLineColor, removeCurrentTimeLineColor, addLineSeekColor}
}
