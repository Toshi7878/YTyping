import { LineEdit } from "@/types";
import { useStore as useJotaiStore } from "jotai";
import { useDispatch, useStore as useReduxStore } from "react-redux";

import {
  editAddLyricsTextAtom,
  editDirectEditCountAtom,
  editLineSelectedCountAtom,
  editSpeedAtom,
  isAddButtonDisabledAtom,
  isDeleteButtonDisabledAtom,
  isEditYouTubePlayingAtom,
  isUpdateButtonDisabledAtom,
  useLineInputReducer,
  useSetEditDirectEditCountAtom,
  useSetEditLineLyricsAtom,
  useSpeedReducer,
} from "../edit-atom/editAtom";
import { useRefs } from "../edit-contexts/refsProvider";
import { mapDataRedo, mapDataUndo } from "../redux/mapDataSlice";
import { RootState } from "../redux/store";
import { redo, undo } from "../redux/undoredoSlice";
import { useDeleteTopLyricsText, useSetTopLyricsText } from "./useEditAddLyricsTextHooks";

import { YTPlayer } from "@/types/global-types";
import {
  useLineAddButtonEvent,
  useLineDelete,
  useLineUpdateButtonEvent,
} from "./useEditorButtonEvents";
import { useUndoLine } from "./useEditUndoRedoHooks";
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
  const editAtomStore = useJotaiStore();

  const dispatch = useDispatch();
  const lineInputReducer = useLineInputReducer();
  const speedReducer = useSpeedReducer();
  const setTopLyricsText = useSetTopLyricsText();
  const setDirectEdit = useSetEditDirectEditCountAtom();

  const undoLine = useUndoLine();
  const wordFindReplace = useWordFindReplace();
  const deleteTopLyricsText = useDeleteTopLyricsText();

  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const lineDelete = useLineDelete();
  const seekNextPrev = useSeekNextPrev();

  return (event: KeyboardEvent, optionModalIndex: number | null) => {
    const IS_FOCUS_INPUT = document.activeElement instanceof HTMLInputElement;
    const iS_FOCUS_ADD_LYRICS_TEXTAREA = document.activeElement!.id === "add_lyrics_text";

    if (event.key === "Tab") {
      if (!iS_FOCUS_ADD_LYRICS_TEXTAREA) {
        const textarea = document.getElementById("add_lyrics_text") as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.scrollTop = 0;
          textarea.setSelectionRange(0, 0);
        }
      } else if (iS_FOCUS_ADD_LYRICS_TEXTAREA) {
        (document.activeElement as HTMLElement)?.blur();
      }
      event.preventDefault();
    } else if (!iS_FOCUS_ADD_LYRICS_TEXTAREA && !IS_FOCUS_INPUT && optionModalIndex === null) {
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
            const speed = editAtomStore.get(editSpeedAtom);

            player.seekTo(time - 3 * speed, true);
            event.preventDefault();
          }

          break;

        case "ArrowRight":
          {
            const time = player.getCurrentTime();
            const speed = editAtomStore.get(editSpeedAtom);
            player.seekTo(time + 3 * speed, true);
            event.preventDefault();
          }

          break;

        case "KeyS":
          const isAddButtonDisabled = editAtomStore.get(isAddButtonDisabledAtom);

          if (!isAddButtonDisabled) {
            lineAddButtonEvent(event.shiftKey);
          }
          event.preventDefault();
          break;

        case "KeyU":
          const isUpdateButtonDisabled = editAtomStore.get(isUpdateButtonDisabledAtom);

          if (!isUpdateButtonDisabled) {
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
                const addLyricsText = editAtomStore.get(editAddLyricsTextAtom);

                undoLine(data, addLyricsText);
                const speed = editAtomStore.get(editSpeedAtom);
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
                deleteTopLyricsText(data.lyrics);
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
          const isDeleteButtonDisabled = editAtomStore.get(isDeleteButtonDisabledAtom);

          if (!isDeleteButtonDisabled) {
            lineDelete();
          }
          event.preventDefault();

          break;

        case "KeyQ":
          setTopLyricsText(undefined);
          event.preventDefault();

          break;

        case "KeyF":
          if (event.ctrlKey && event.shiftKey) {
            wordFindReplace();
            event.preventDefault();
          }
          break;

        case "Escape":
          const isYTPlaying = editAtomStore.get(isEditYouTubePlayingAtom);

          if (!isYTPlaying) {
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
  const { tbodyRef, playerRef } = useRefs();
  const editAtomStore = useJotaiStore();
  const editReduxStore = useReduxStore<RootState>();
  const lineInputReducer = useLineInputReducer();
  const tbodyScroll = useTbodyScroll();

  return (type: "next" | "prev") => {
    const mapData = editReduxStore.getState().mapData.value;
    const directEdit = editAtomStore.get(editDirectEditCountAtom);

    const selectedIndex = editAtomStore.get(editLineSelectedCountAtom);
    if (selectedIndex !== null && !directEdit) {
      const seekCount = selectedIndex + (type === "next" ? 1 : -1);
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
        const currentTimeLine = tbodyRef.current!.querySelector(".current-time-line");
        const selectedLine = tbodyRef.current!.querySelector(".selected-line");
        if (selectedLine) {
          selectedLine.classList.remove("selected-line");
        }
        if (currentTimeLine) {
          currentTimeLine.classList.remove("current-time-line");
        }
        tbodyRef.current!.children[seekCount].classList.add("selected-line", "current-time-line");
      }
    }
  };
}

export function useAddRubyTagEvent() {
  const setLyrics = useSetEditLineLyricsAtom();

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
