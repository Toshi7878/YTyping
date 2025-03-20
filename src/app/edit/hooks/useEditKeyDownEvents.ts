import { LineEdit } from "@/types";
import { useDispatch, useStore as useReduxStore } from "react-redux";

import { YTPlayer } from "@/types/global-types";
import {
  useIsAddBtnDisabledStateRef,
  useIsDeleteBtnDisabledStateRef,
  useIsUpdateBtnDisabledStateRef,
} from "../atoms/buttonDisableStateAtoms";
import {
  useEditUtilsStateRef,
  useLineInputReducer,
  useSelectLineStateRef,
  useSetDirectEditIndexState,
  useSetSelectLyricsState,
  useSpeedReducer,
  useYtPlayerStatusStateRef,
} from "../atoms/stateAtoms";
import { useRefs } from "../edit-contexts/refsProvider";
import { mapDataRedo, mapDataUndo } from "../redux/mapDataSlice";
import { RootState } from "../redux/store";
import { redo, undo } from "../redux/undoredoSlice";
import { useDeleteAddingTopPhrase, usePickupTopPhrase } from "./manyPhrase";
import { useLineAddButtonEvent, useLineDelete, useLineUpdateButtonEvent } from "./useButtonEvents";
import { useChangeLineRowColor } from "./useChangeLineRowColor";
import { useUndoLine } from "./useEditUndoRedo";
import { useWordFindReplace } from "./useWordFindReplace";

export const useTbodyScroll = () => {
  const { tbodyRef } = useRefs();

  return (count: number) => {
    const targetRow = tbodyRef.current?.children[count];

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
  const { playerRef } = useRefs();
  const editReduxStore = useReduxStore<RootState>();

  const dispatch = useDispatch();
  const lineInputReducer = useLineInputReducer();
  const speedReducer = useSpeedReducer();
  const pickupTopPhrase = usePickupTopPhrase();
  const setDirectEdit = useSetDirectEditIndexState();

  const undoLine = useUndoLine();
  const wordFindReplace = useWordFindReplace();
  const deleteAddingTopPhrase = useDeleteAddingTopPhrase();

  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const lineDelete = useLineDelete();
  const seekNextPrev = useSeekNextPrev();
  const readEditUtils = useEditUtilsStateRef();
  const readYtPlayerStatus = useYtPlayerStatusStateRef();
  const readIsAddBtnDisalbed = useIsAddBtnDisabledStateRef();
  const readIsUpdateBtnDisalbed = useIsUpdateBtnDisabledStateRef();
  const readIsDeleteBtnDisalbed = useIsDeleteBtnDisabledStateRef();

  return (event: KeyboardEvent, optionModalIndex: number | null) => {
    const IS_FOCUS_INPUT = document.activeElement instanceof HTMLInputElement;
    const iS_FOCUS_MANY_PHRASE_TEXTAREA = document.activeElement!.id === "many_phrase_textarea";
    const { manyPhraseText } = readEditUtils();
    const { playing, speed } = readYtPlayerStatus();

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
      const player = playerRef!.current as YTPlayer;
      const undoredoState = editReduxStore.getState().undoRedo;

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
            if (undoredoState.present) {
              const data = undoredoState.present.data as LineEdit;

              dispatch(mapDataUndo(undoredoState.present));
              if (undoredoState.present.type === "add") {
                undoLine(data, manyPhraseText);
                player.seekTo(Number(data.time) - 3 * speed, true);
              }

              dispatch(undo());
              event.preventDefault();
            }
          }

          break;

        case "KeyY":
          if (event.ctrlKey) {
            if (undoredoState.future.length) {
              const future = undoredoState.future[undoredoState.future.length - 1];

              dispatch(mapDataRedo(future));

              if (future.type === "add") {
                const data = future.data as LineEdit;
                deleteAddingTopPhrase(data.lyrics);
                const topPhrase = manyPhraseText.split("\n")[0];
                pickupTopPhrase(topPhrase);
              }

              dispatch(redo());
              event.preventDefault();
            }
          }

          break;

        case "KeyD":
          lineInputReducer({ type: "reset" });
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
            wordFindReplace();
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
          speedReducer("down");
          event.preventDefault();

          break;

        case "F10":
          speedReducer("up");
          event.preventDefault();

          break;
      }
    }
  };
};

function useSeekNextPrev() {
  const { playerRef } = useRefs();
  const editReduxStore = useReduxStore<RootState>();
  const lineInputReducer = useLineInputReducer();
  const tbodyScroll = useTbodyScroll();
  const { addLineSeekColor } = useChangeLineRowColor();
  const readEditUtils = useEditUtilsStateRef();
  const readLineStatus = useSelectLineStateRef();

  return (type: "next" | "prev") => {
    const mapData = editReduxStore.getState().mapData.value;
    const { directEditingIndex } = readEditUtils();

    const { index: selectIndex } = readLineStatus();
    if (selectIndex !== null && !directEditingIndex) {
      const seekCount = selectIndex + (type === "next" ? 1 : -1);
      const seekLine = mapData[seekCount];
      if (seekLine) {
        playerRef.current!.seekTo(Number(seekLine.time), true);
        lineInputReducer({
          type: "set",
          payload: {
            lyrics: seekLine.lyrics,
            word: seekLine.word,
            selectCount: seekCount,
          },
        });
        tbodyScroll(seekCount);
        addLineSeekColor(seekCount);
      }
    }
  };
}

export function useAddRubyTagEvent() {
  const setLyrics = useSetSelectLyricsState();

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
