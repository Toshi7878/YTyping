"use client";
import { Tr, Td, Button, useDisclosure, useTheme } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LineOptionModal from "./LineOptionModal";
import { LineEdit, ThemeColors } from "@/types";
import { RootState } from "@/app/edit/redux/store";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import { addLine, updateLine } from "@/app/edit/redux/mapDataSlice";
import { timer } from "@/app/edit/ts/youtube-ts/editTimer";
import {
  editTimeCountAtom,
  useEditAddLyricsTextAtom,
  useEditLineSelectedCountAtom,
  useIsEditYTPlayingAtom,
  useIsEditYTStartedAtom,
  useLineInputReducer,
  useSetEditLineSelectedCountAtom,
  useSetTabIndexAtom,
  useSpeedAtom,
} from "@/app/edit/edit-atom/editAtom";
import { useAtom } from "jotai";
import { useWindowKeydownEvent } from "@/app/edit/hooks/useEditKeyDownEvents";

function LineRow() {
  const setTabIndex = useSetTabIndexAtom();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [optionModalIndex, setOptionModalIndex] = useState<number | null>(null);
  const [lineOptions, setLineOptions] = useState<LineEdit["options"] | null>(null);
  const lineSelectedCount = useEditLineSelectedCountAtom();
  const setLineSelectedCount = useSetEditLineSelectedCountAtom();
  const lineInputReducer = useLineInputReducer();
  const [timeCount, setTimeCount] = useAtom(editTimeCountAtom);
  const isYTStarted = useIsEditYTStartedAtom();
  const lastAddedTime = useSelector((state: RootState) => state.mapData.lastAddedTime);
  const refs = useRefs();
  const theme: ThemeColors = useTheme();
  const windowKeydownEvent = useWindowKeydownEvent();

  const mapData = useSelector((state: RootState) => state.mapData.value);
  const undoredoState = useSelector((state: RootState) => state.undoRedo);
  const speed = useSpeedAtom();
  const isYTPlaying = useIsEditYTPlayingAtom();
  const addLyricsText = useEditAddLyricsTextAtom();

  useEffect(() => {
    window.addEventListener("keydown", windowKeydownEvent);
    return () => {
      window.removeEventListener("keydown", windowKeydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData, undoredoState, speed, isYTPlaying, addLyricsText]);

  useEffect(() => {
    if (mapData.length > 0) {
      for (let i = mapData.length - 1; i >= 0; i--) {
        if (Number(mapData[i]["time"]) == Number(lastAddedTime)) {
          const targetRow = refs.tbodyRef.current?.children[i];

          if (targetRow && targetRow instanceof HTMLElement) {
            const parentElement = targetRow.parentElement!.parentElement!.parentElement;
            if (parentElement && targetRow instanceof HTMLElement) {
              parentElement.scrollTo({
                top: targetRow.offsetTop - parentElement.offsetTop - targetRow.offsetHeight,
                behavior: "smooth",
              });
            }
          }

          break;
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedTime]);

  useEffect(() => {
    if (isYTStarted) {
      const duration = refs.playerRef.current?.getDuration();

      if (duration) {
        for (let i = mapData.length - 1; i >= 0; i--) {
          if (mapData[i].lyrics === "end") {
            dispatch(
              updateLine({
                time: duration.toFixed(3),
                lyrics: "end",
                word: "",
                selectedLineCount: i,
              }),
            );

            return;
          }
        }

        dispatch(addLine({ time: duration.toFixed(3), lyrics: "end", word: "" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTStarted]);

  const selectLine = useCallback(
    (selectCount: number) => {
      const time = mapData[selectCount].time;
      const lyrics = mapData[selectCount].lyrics;
      const word = mapData[selectCount].word;
      setLineSelectedCount(selectCount);
      lineInputReducer({ type: "set", payload: { time, lyrics, word, selectCount } });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapData],
  );

  useEffect(() => {
    const updateTimeBg = () => {
      if (timeCount !== null) {
        const nextLine = mapData[timeCount + 1];
        if (nextLine && Number(timer.currentTime) >= Number(nextLine["time"])) {
          setTimeCount(timeCount + 1);
        }
      } else {
        setTimeCount(0);
      }
    };

    timer.addListener(updateTimeBg);
    return () => {
      timer.removeListener(updateTimeBg);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeCount, mapData]);
  const clickTimeCell = (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
    const time = Number(event.currentTarget.textContent);
    refs.playerRef.current.seekTo(time);
  };
  const endAfterLineIndex = mapData.findIndex((line) => line.lyrics === "end");

  const renderedRows = useMemo(
    () =>
      mapData.map((line, index) => (
        <Tr
          key={index}
          id={`line_${index}`}
          data-line-index={index}
          cursor="pointer"
          position="relative"
          bg={
            lineSelectedCount === index
              ? theme.colors.edit.mapTable.selectedLine.bg
              : timeCount === index && lineSelectedCount !== index
                ? `${theme.colors.edit.mapTable.currentTimeLine.bg}40`
                : endAfterLineIndex < index && line.lyrics !== "end"
                  ? `${theme.colors.edit.mapTable.errorLine.bg}35`
                  : "transparent"
          }
          color={theme.colors.color}
          outline={lineSelectedCount === index ? "1px solid" : "none"}
          outlineColor={lineSelectedCount === index ? theme.colors.color : "none"}
          _hover={{
            bg:
              lineSelectedCount !== index
                ? `${theme.colors.edit.mapTable.selectedLine.bg}50`
                : theme.colors.edit.mapTable.selectedLine.bg,
          }}
          onClick={() => {
            selectLine(index);
            setTabIndex(1);
          }}
          className={lineSelectedCount === index ? "selected-line" : ""}
        >
          <Td
            borderRight="1px solid black"
            className="time-cell hover:bg-cyan-700/35"
            onClick={clickTimeCell}
          >
            {line.time}
          </Td>
          <Td borderRight="1px solid black" dangerouslySetInnerHTML={{ __html: line.lyrics }}></Td>
          <Td borderRight="1px solid black">{line.word}</Td>
          <Td>
            <Button
              disabled={mapData.length - 1 === index}
              variant={line.options ? "solid" : "outline"}
              colorScheme={`${lineSelectedCount === index ? "green" : "green"}`}
              size="sm"
              onClick={() => {
                if (mapData.length - 1 !== index) {
                  setOptionModalIndex(index);
                  setLineOptions(line.options);
                  onOpen();
                }
              }}
            >
              {line.options ? "設定有" : "未設定"}
            </Button>
          </Td>
        </Tr>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapData, lineSelectedCount, timeCount, theme, endAfterLineIndex],
  );

  return (
    <>
      {renderedRows}

      {isOpen && (
        <LineOptionModal
          isOpen={isOpen}
          onClose={onClose}
          optionModalIndex={optionModalIndex}
          lineOptions={lineOptions}
        />
      )}
    </>
  );
}

export default LineRow;
