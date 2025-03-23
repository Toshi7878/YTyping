import {
  useIsAddBtnDisabledStateRef,
  useIsDeleteBtnDisabledStateRef,
  useIsUpdateBtnDisabledStateRef,
} from "../atoms/buttonDisableStateAtoms";
import { useEditHistoryRef, useHistoryReducer } from "../atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "../atoms/mapReducerAtom";
import { usePlayer, useTbodyRef } from "../atoms/refAtoms";
import {
  useEditUtilsStateRef,
  useLineReducer,
  useLineStateRef,
  useSetDirectEditIndexState,
  useSetLyricsState,
  useSetManyPhraseState,
  useSpeedReducer,
  useYtPlayerStatusStateRef,
} from "../atoms/stateAtoms";
import { useDeleteAddingTopPhrase, usePickupTopPhrase } from "./manyPhrase";
import { useLineAddButtonEvent, useLineDelete, useLineUpdateButtonEvent } from "./useButtonEvents";
import { useChangeLineRowColor } from "./utils/useChangeLineRowColor";
import { useWordSearchReplace } from "./utils/useWordFindReplace";

export const useTbodyScroll = () => {
  const { readTbody } = useTbodyRef();
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
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();

  const pickupTopPhrase = usePickupTopPhrase();
  const setDirectEdit = useSetDirectEditIndexState();

  const wordSearchPeplace = useWordSearchReplace();
  const deleteAddingTopPhrase = useDeleteAddingTopPhrase();

  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const setManyPhrase = useSetManyPhraseState();
  const lineDelete = useLineDelete();
  const seekNextPrev = useSeekNextPrev();
  const readEditUtils = useEditUtilsStateRef();
  const readYtPlayerStatus = useYtPlayerStatusStateRef();
  const readIsAddBtnDisalbed = useIsAddBtnDisabledStateRef();
  const readIsUpdateBtnDisalbed = useIsUpdateBtnDisabledStateRef();
  const readIsDeleteBtnDisalbed = useIsDeleteBtnDisabledStateRef();
  const { readPlayer } = usePlayer();
  const readHistory = useEditHistoryRef();

  return (event: KeyboardEvent, optionModalIndex: number | null) => {
    const IS_FOCUS_INPUT = document.activeElement instanceof HTMLInputElement;
    const iS_FOCUS_MANY_PHRASE_TEXTAREA = document.activeElement!.id === "many_phrase_textarea";
    const { manyPhraseText } = readEditUtils();
    const { playing, speed } = readYtPlayerStatus();
    const player = readPlayer();

    if (event.key === "Tab") {
      if (!iS_FOCUS_MANY_PHRASE_TEXTAREA) {
        const textarea = document.getElementById("many_phrase_textarea") as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.scrollTop = 0;
          textarea.setSelectionRange(0, 0);
        }
      } else if (iS_FOCUS_MANY_PHRASE_TEXTAREA) {
        (document.activeElement as HTMLElement)?.blur();
      }
      event.preventDefault();
    } else if (!iS_FOCUS_MANY_PHRASE_TEXTAREA && !IS_FOCUS_INPUT && optionModalIndex === null) {
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
          {
            const time = player.getCurrentTime();

            player.seekTo(time - 3 * speed, true);
            event.preventDefault();
          }

          break;

        case "ArrowRight":
          {
            const time = player.getCurrentTime();
            player.seekTo(time + 3 * speed, true);
            event.preventDefault();
          }

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
            const { present } = readHistory();

            if (present) {
              const { actionType, data } = present;
              switch (actionType) {
                case "add":
                  const { lineIndex, options, time, lyrics, word } = data;
                  mapDispatch({ type: "delete", index: lineIndex });
                  player.seekTo(Number(data.time) - 3 * speed, true);
                  lineDispatch({ type: "set", line: { time, lyrics, word, selectIndex: null } });
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
            event.preventDefault();
          }
          break;

        case "KeyY":
          if (event.ctrlKey) {
            const { future } = readHistory();

            if (future.length) {
              const { actionType, data } = future[future.length - 1];

              switch (actionType) {
                case "add":
                  mapDispatch({ type: "add", payload: data });
                  deleteAddingTopPhrase(data.lyrics);
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
              event.preventDefault();
            }
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

function useSeekNextPrev() {
  const lineDispatch = useLineReducer();

  const tbodyScroll = useTbodyScroll();
  const { addLineSeekColor } = useChangeLineRowColor();
  const readEditUtils = useEditUtilsStateRef();
  const readLineStatus = useLineStateRef();
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
}

export function useAddRubyTagEvent() {
  const setLyrics = useSetLyricsState();

  return (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const lyrics = event.currentTarget.value;
      const start = event.currentTarget.selectionStart;
      const end = event.currentTarget.selectionEnd;

      if (end === null || start === null || end - start < 1) {
        return false;
      }

      const addRubyTagLyrics = `${lyrics.slice(0, start)}<ruby>${lyrics.slice(
        start,
        end
      )}<rt></rt></ruby>${lyrics.slice(end, lyrics.length)}`;

      setLyrics(addRubyTagLyrics);
      setTimeout(() => {
        const target = event.target as HTMLInputElement;
        target.focus();
        target.setSelectionRange(
          addRubyTagLyrics.search("<rt></rt></ruby>") + 4,
          addRubyTagLyrics.search("<rt></rt></ruby>") + 4
        );
      });
    }
  };
}
