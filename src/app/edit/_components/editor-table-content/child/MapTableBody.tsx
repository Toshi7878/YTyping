"use client";
import {
  useIsEditYTPlayingAtom,
  useIsEditYTStartedAtom,
  useSetEditCustomStyleLengthAtom,
  useSetEditIsTimeInputValidAtom,
} from "@/app/edit/edit-atom/editAtom";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import { useWindowKeydownEvent } from "@/app/edit/hooks/useEditKeyDownEvents";
import { setMapData, updateLine } from "@/app/edit/redux/mapDataSlice";
import { RootState } from "@/app/edit/redux/store";
import { MapData } from "@/app/type/ts/type";
import { ThemeColors } from "@/types";
import { useDisclosure, useTheme } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editTicker } from "../../editor-youtube-content/EditYoutube";
import LineRow from "./child/LineRow";
import LineOptionModal from "./LineOptionModal";

function MapTableBody() {
  const dispatch = useDispatch();
  const theme: ThemeColors = useTheme();

  const [optionModalIndex, setOptionModalIndex] = useState<number | null>(null);
  const [lineOptions, setLineOptions] = useState<MapData["options"] | null>(null);
  const lastAddedTime = useSelector((state: RootState) => state.mapData.lastAddedTime);
  const mapData = useSelector((state: RootState) => state.mapData.value);
  const isYTStarted = useIsEditYTStartedAtom();
  const isYTPlaying = useIsEditYTPlayingAtom();
  const optionClosure = useDisclosure();

  const { tbodyRef, playerRef } = useRefs();
  const setCustomStyleLength = useSetEditCustomStyleLengthAtom();
  const windowKeydownEvent = useWindowKeydownEvent();
  const setEditIsTimeInputValid = useSetEditIsTimeInputValidAtom();

  useEffect(() => {
    if (isYTPlaying && !editTicker.started) {
      editTicker.start();
      setEditIsTimeInputValid(false);
    }

    return () => {
      if (editTicker.started) {
        editTicker.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTPlaying]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => windowKeydownEvent(event, optionModalIndex);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapData.length > 0) {
      for (let i = mapData.length - 1; i >= 0; i--) {
        if (Number(mapData[i]["time"]) == Number(lastAddedTime)) {
          const targetRow = tbodyRef.current?.children[i];

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
      const duration = playerRef.current?.getDuration();

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

        const addLineMap = [
          ...mapData,
          { time: duration.toFixed(3), lyrics: "end", word: "" },
        ].sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
        dispatch(setMapData(addLineMap));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTStarted]);

  const renderedRows = useMemo(
    () => {
      let customStyleLength = 0;
      const endAfterLineIndex = mapData.findIndex((line) => line.lyrics === "end");

      const rows = mapData.map((line, index) => {
        const eternalCSS = line.options?.eternalCSS;
        const changeCSS = line.options?.changeCSS;
        if (eternalCSS) {
          customStyleLength += eternalCSS.length;
        }

        if (changeCSS) {
          customStyleLength += changeCSS.length;
        }

        return (
          <LineRow
            key={index}
            index={index}
            line={line}
            optionClosure={optionClosure}
            setLineOptions={setLineOptions}
            setOptionModalIndex={setOptionModalIndex}
            endAfterLineIndex={endAfterLineIndex}
          />
        );
      });

      setCustomStyleLength(customStyleLength);

      return rows;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapData],
  );

  return (
    <>
      {renderedRows}
      <style>
        {`

      .current-time-line {
        background: ${theme.colors.secondary.light}40;
      }

        .selected-line {
        outline: 1px solid ${theme.colors.text.body};
        background: ${theme.colors.primary.dark};
      }

      [id*="line_"]:hover:not(.selected-line) {
      background:${theme.colors.primary.dark}50;
      }


      .error-line {
      background: ${theme.colors.error.light}35;
      }
      `}
      </style>

      {optionClosure.isOpen && (
        <LineOptionModal
          isOpen={optionClosure.isOpen}
          onClose={optionClosure.onClose}
          optionModalIndex={optionModalIndex}
          setOptionModalIndex={setOptionModalIndex}
          lineOptions={lineOptions}
        />
      )}
    </>
  );
}

export default MapTableBody;
