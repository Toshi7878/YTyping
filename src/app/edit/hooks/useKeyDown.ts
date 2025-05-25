import {
  useIsAddBtnDisabledStateRef,
  useIsDeleteBtnDisabledStateRef,
  useIsUpdateBtnDisabledStateRef,
} from "../atoms/buttonDisableStateAtoms";
import { useEditHistoryRef, useHistoryReducer } from "../atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "../atoms/mapReducerAtom";
import { usePlayer, useTbody } from "../atoms/refAtoms";
import {
  useLineReducer,
  useReadEditUtils,
  useReadLine,
  useReadYtPlayerStatus,
  useSetDirectEditIndex,
  useSetManyPhrase,
  useSpeedReducer,
} from "../atoms/stateAtoms";
import { useDeleteAddingTopPhrase, usePickupTopPhrase } from "./manyPhrase";
import { useLineAddButtonEvent, useLineDelete, useLineUpdateButtonEvent } from "./useButtonEvents";
import { useChangeLineRowColor } from "./utils/useChangeLineRowColor";
import { useWordSearchReplace } from "./utils/useWordFindReplace";

export const useTbodyScroll = () => {
  const { readTbody } = useTbody();
  return (count: number) => {
    const targetRow = readTbody().children[count];

    if (targetRow && targetRow instanceof HTMLElement) {
      const parentElement = targetRow.parentElement!.parentElement!.parentElement;
      if (parentElement && targetRow instanceof HTMLElement) {
        parentElement.scrollTo({
          top: targetRow.offsetTop - parentElement.offsetTop - targetRow.offsetHeight,
          behavior: "smooth",
        });
      }
    }
  };
};

export const useWindowKeydownEvent = () => {
  const speedDispatch = useSpeedReducer();
  const lineDispatch = useLineReducer();

  const pickupTopPhrase = usePickupTopPhrase();
  const setDirectEdit = useSetDirectEditIndex();

  const wordSearchPeplace = useWordSearchReplace();

  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const lineDelete = useLineDelete();
  const seekNextPrev = useSeekNextPrev();
  const readEditUtils = useReadEditUtils();
  const readYtPlayerStatus = useReadYtPlayerStatus();
  const readIsAddBtnDisalbed = useIsAddBtnDisabledStateRef();
  const readIsUpdateBtnDisalbed = useIsUpdateBtnDisabledStateRef();
  const readIsDeleteBtnDisalbed = useIsDeleteBtnDisabledStateRef();
  const { readPlayer } = usePlayer();
  const { undo, redo } = useUndoRedo();
  const seekByArrowKey = useSeekByArrowKey();

  return (event: KeyboardEvent, optionModalIndex: number | null) => {
    const isFocusedInput = document.activeElement instanceof HTMLInputElement;
    const isFocusedManyPhraseTextArea = document.activeElement!.id === "many_phrase_textarea";
    const { manyPhraseText } = readEditUtils();
    const { playing, speed } = readYtPlayerStatus();
    const player = readPlayer();

    if (event.key === "Tab") {
      if (!isFocusedManyPhraseTextArea) {
        const textarea = document.getElementById("many_phrase_textarea") as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.scrollTop = 0;
          textarea.setSelectionRange(0, 0);
        }
      } else if (isFocusedManyPhraseTextArea) {
        (document.activeElement as HTMLElement)?.blur();
      }
      event.preventDefault();
    } else if (!isFocusedManyPhraseTextArea && !isFocusedInput && optionModalIndex === null) {
      switch (event.code) {
        case "ArrowUp":
          seekNextPrev("prev");
          event.preventDefault();
          break;

        case "ArrowDown":
          seekNextPrev("next");
          event.preventDefault();
          break;

        case "ArrowLeft":
          seekByArrowKey("left");
          event.preventDefault();
          break;

        case "ArrowRight":
          seekByArrowKey("right");
          event.preventDefault();
          break;

        case "KeyS":
          const isAddBtnDisabled = readIsAddBtnDisalbed();

          if (!isAddBtnDisabled) {
            lineAddButtonEvent(event.shiftKey);
          }
          event.preventDefault();
          break;

        case "KeyU":
          const isUpdateBtnDisabled = readIsUpdateBtnDisalbed();

          if (!isUpdateBtnDisabled) {
            lineUpdateButtonEvent();
          }
          event.preventDefault();
          break;

        case "KeyZ":
          if (event.ctrlKey) {
            undo();
            event.preventDefault();
          }
          break;

        case "KeyY":
          if (event.ctrlKey) {
            redo();
            event.preventDefault();
          }

          break;

        case "KeyD":
          lineDispatch({ type: "reset" });
          setDirectEdit(null);
          event.preventDefault();

          break;

        case "Delete":
          const isDeleteBtnDisabled = readIsDeleteBtnDisalbed();

          if (!isDeleteBtnDisabled) {
            lineDelete();
          }
          event.preventDefault();

          break;

        case "KeyQ":
          const topPhrase = manyPhraseText.split("\n")[0];

          pickupTopPhrase(topPhrase);
          event.preventDefault();

          break;

        case "KeyF":
          if (event.ctrlKey && event.shiftKey) {
            wordSearchPeplace();
            event.preventDefault();
          }
          break;

        case "Escape":
          if (!playing) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }

          event.preventDefault();

          break;

        case "F9":
          speedDispatch("down");
          event.preventDefault();

          break;

        case "F10":
          speedDispatch("up");
          event.preventDefault();

          break;
      }
    }
  };
};

const ARROW_SEEK_SECONDS = 3;
const useSeekByArrowKey = () => {
  const readYtPlayerStatus = useReadYtPlayerStatus();
  const { readPlayer } = usePlayer();

  return (direction: "left" | "right") => {
    const { speed } = readYtPlayerStatus();
    const player = readPlayer();
    const time = player.getCurrentTime();
    const seekAmount = ARROW_SEEK_SECONDS * speed;
    if (direction === "left") {
      player.seekTo(time - seekAmount, true);
    } else {
      player.seekTo(time + seekAmount, true);
    }
  };
};

const useSeekNextPrev = () => {
  const lineDispatch = useLineReducer();

  const tbodyScroll = useTbodyScroll();
  const { addLineSeekColor } = useChangeLineRowColor();
  const readEditUtils = useReadEditUtils();
  const readLineStatus = useReadLine();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();
  return (type: "next" | "prev") => {
    const { directEditingIndex } = readEditUtils();

    const { selectIndex } = readLineStatus();
    if (selectIndex !== null && !directEditingIndex) {
      const seekCount = selectIndex + (type === "next" ? 1 : -1);
      const seekLine = readMap()[seekCount];
      if (seekLine) {
        readPlayer().seekTo(Number(seekLine.time), true);
        lineDispatch({
          type: "set",
          line: {
            time: seekLine.time,
            lyrics: seekLine.lyrics,
            word: seekLine.word,
            selectIndex: seekCount,
          },
        });
        tbodyScroll(seekCount);
        addLineSeekColor(seekCount);
      }
    }
  };
};

const useUndoRedo = () => {
  const readHistory = useEditHistoryRef();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();
  const pickupTopPhrase = usePickupTopPhrase();
  const readEditUtils = useReadEditUtils();
  const deleteAddingTopPhrase = useDeleteAddingTopPhrase();
  const { readPlayer } = usePlayer();
  const lineDispatch = useLineReducer();
  const setManyPhrase = useSetManyPhrase();
  const readYtPlayerStatus = useReadYtPlayerStatus();

  const undo = () => {
    const { present } = readHistory();

    if (present) {
      const { actionType, data } = present;
      switch (actionType) {
        case "add":
          const { lineIndex, time, lyrics, word } = data;
          mapDispatch({ type: "delete", index: lineIndex });
          const { speed } = readYtPlayerStatus();
          readPlayer().seekTo(Number(data.time) - 3 * speed, true);
          lineDispatch({ type: "set", line: { time, lyrics, word, selectIndex: null } });
          const { manyPhraseText } = readEditUtils();
          setManyPhrase(data.lyrics + "\n" + manyPhraseText);
          break;
        case "update":
          mapDispatch({ type: "update", payload: data.old, index: data.lineIndex });
          break;
        case "delete":
          mapDispatch({ type: "add", payload: data });
          break;
        case "replaceAll":
          mapDispatch({ type: "replaceAll", payload: data.old });
          break;
      }
      historyDispatch({ type: "undo" });
    }
  };

  const redo = () => {
    const { future } = readHistory();

    if (future.length) {
      const { actionType, data } = future[future.length - 1];

      switch (actionType) {
        case "add":
          mapDispatch({ type: "add", payload: data });
          deleteAddingTopPhrase(data.lyrics);
          const { manyPhraseText } = readEditUtils();
          const topPhrase = manyPhraseText.split("\n")[0];
          pickupTopPhrase(topPhrase);
          break;
        case "update":
          mapDispatch({ type: "update", payload: data.new, index: data.lineIndex });
          break;
        case "delete":
          mapDispatch({ type: "delete", index: data.lineIndex });
          break;
        case "replaceAll":
          mapDispatch({ type: "replaceAll", payload: data.new });
          break;
      }
      historyDispatch({ type: "redo" });
    }
  };

  return { undo, redo };
};
