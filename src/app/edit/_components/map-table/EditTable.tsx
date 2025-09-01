"use client";

import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMapReducer, useMapState, useReadMap } from "../../_lib/atoms/mapReducerAtom";
import { usePlayer, useTbody, useTimeInput } from "../../_lib/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useIsWordConvertingState,
  useIsYTReadiedState,
  useIsYTStartedState,
  useLineReducer,
  useLyricsState,
  useSelectIndexState,
  useSetDirectEditIndex,
  useSetLyrics,
  useSetSelectIndex,
  useSetTabName,
  useSetWord,
  useTimeLineIndexState as useTimeLineIndex,
  useWordState,
} from "../../_lib/atoms/stateAtoms";

import "@/app/edit/_lib/style/table.css";
import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { DataTable } from "@/components/ui/table/data-table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { MapLine } from "@/types/map";
import { ColumnDef } from "@tanstack/react-table";
import { useEndLineIndexState } from "../../_lib/atoms/buttonDisableStateAtoms";
import { useAddRubyTagEvent } from "../../_lib/hooks/useAddRubyTag";
import { useLineUpdateButtonEvent, useWordConvertButtonEvent } from "../../_lib/hooks/useButtonEvents";
import { useWindowKeydownEvent } from "../../_lib/hooks/useKeyDown";
import { useUpdateEndTime } from "../../_lib/hooks/useUpdateEndTime";
import LineOptionDialog from "./LineOptionDialog";

export default function EditTable() {
  const map = useMapState();
  const tbodyRef = useRef(null);

  const { id: mapId } = useParams<{ id: string }>();
  const { writeTbody } = useTbody();
  const mapDispatch = useMapReducer();
  const updateEndTime = useUpdateEndTime();
  const { readPlayer } = usePlayer();
  const [optionDialogIndex, setOptionDialogIndex] = useState<number | null>(null);

  const isYTStarted = useIsYTStartedState();
  const isYTReady = useIsYTReadiedState();

  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));
  const endLineIndex = useEndLineIndexState();
  const timeLineIndex = useTimeLineIndex();

  useEffect(() => {
    if (mapData) {
      mapDispatch({ type: "replaceAll", payload: mapData });
    }
  }, [mapData, mapDispatch]);

  useEffect(() => {
    const tbody = tbodyRef.current;
    if (tbody) {
      writeTbody(tbody);
    }
  }, [writeTbody]);

  useEffect(() => {
    if (!isYTReady && !isYTStarted) return;
    updateEndTime(readPlayer());
  }, [isYTReady, isYTStarted, readPlayer]);
  const directEditTimeInputRef = useRef<HTMLInputElement | null>(null);
  const directEditLyricsInputRef = useRef<HTMLInputElement | null>(null);
  const directEditWordInputRef = useRef<HTMLInputElement | null>(null);

  const directEditIndex = useDirectEditIndexState();
  const selectIndex = useSelectIndexState();

  const setTabName = useSetTabName();
  const setSelectIndex = useSetSelectIndex();
  const setDirectEditIndex = useSetDirectEditIndex();
  const setSelectLine = useLineReducer();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const readMap = useReadMap();

  const windowKeydownEvent = useWindowKeydownEvent();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      windowKeydownEvent(event, { disabled: optionDialogIndex !== null });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [windowKeydownEvent, optionDialogIndex]);

  const selectLine = (event: React.MouseEvent<HTMLTableRowElement>, selectIndex: number) => {
    const map = readMap();
    const { time, lyrics, word } = map[selectIndex];

    if (directEditIndex === selectIndex) {
      return null;
    }

    if (directEditIndex) {
      lineUpdateButtonEvent();
    }

    const isDirectEditMode = event.ctrlKey && selectIndex !== 0 && selectIndex !== endLineIndex;

    if (isDirectEditMode) {
      setDirectEditIndex(selectIndex);
    } else if (directEditIndex !== selectIndex) {
      setDirectEditIndex(null);
    }

    setSelectIndex(selectIndex);
    setSelectLine({ type: "set", line: { time, lyrics, word, selectIndex } });
  };

  const columns: ColumnDef<MapLine>[] = useMemo(
    () => [
      {
        header: "Time",
        accessorKey: "time",
        size: 40,
        meta: {
          onClick: (event: React.MouseEvent<HTMLDivElement>, row: MapLine, index: number) => {
            if (directEditIndex !== index) {
              readPlayer().seekTo(Number(row.time), true);
            }
          },
        },
        cell: ({ row }) => {
          const index = row.index;
          const time = row.original.time;

          return (
            <>
              {directEditIndex === index && <DirectTimeInput ref={directEditTimeInputRef} time={time} />}
              {directEditIndex !== index && row.original.time}
            </>
          );
        },
      },
      {
        header: "Lyrics",
        accessorKey: "lyrics",
        size: 300,
        cell: ({ row }) => {
          const index = row.index;

          return (
            <>
              {directEditIndex === index && <DirectLyricsInput ref={directEditLyricsInputRef} />}
              {directEditIndex !== index && row.original.lyrics}
            </>
          );
        },
      },
      {
        header: "Word",
        accessorKey: "word",
        size: 250,
        cell: ({ row }) => {
          const index = row.index;

          return (
            <>
              {directEditIndex === index && <DirectWordInput ref={directEditWordInputRef} />}
              {directEditIndex !== index && row.original.word}
            </>
          );
        },
      },

      {
        header: "Option",
        accessorKey: "option",
        size: 42,
        cell: ({ row }) => {
          const index = row.index;
          const isOptionEdited = Boolean(row.original.options?.isChangeCSS || row.original.options?.eternalCSS);

          return (
            <Button
              disabled={index === endLineIndex}
              variant={isOptionEdited ? "success" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (index !== endLineIndex) {
                  setOptionDialogIndex(index);
                }
              }}
            >
              {isOptionEdited ? "設定有" : "未設定"}
            </Button>
          );
        },
      },
    ],
    [
      directEditIndex,
      endLineIndex,
      readPlayer,
      directEditTimeInputRef,
      directEditLyricsInputRef,
      directEditWordInputRef,
    ],
  );

  return (
    <LoadingOverlayProvider isLoading={isLoading} message="Loading...">
      <CardWithContent
        className={{
          card: "p-0",
          cardContent: "max-h-[calc(100vh-100px)] overflow-y-auto p-0 md:max-h-[500px] 2xl:max-h-[calc(100vh-400px)]",
        }}
      >
        <DataTable
          columns={columns}
          data={map}
          selectedIndex={selectIndex}
          timeLineIndex={timeLineIndex}
          onRowClick={(event, _, index) => {
            selectLine(event, index);
            setTabName("エディター");
          }}
          className="border-none pb-56"
        />
      </CardWithContent>

      {optionDialogIndex !== null && (
        <LineOptionDialog index={optionDialogIndex} setOptionDialogIndex={setOptionDialogIndex} />
      )}
    </LoadingOverlayProvider>
  );
}

const DirectTimeInput = ({ ref, time }: DirectEditTimeInputProps) => {
  const [editTime, setEditTime] = useState(time);
  const { setTime } = useTimeInput();
  const { readPlayer } = usePlayer();

  return (
    <TooltipWrapper label={"↓↑: 0.05ずつ調整, Enter:再生"}>
      <Input
        ref={ref}
        className="h-6 text-xs"
        type="number"
        value={editTime}
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          setTime(newValue);
        }}
        onKeyDown={(e) => {
          const value = e.currentTarget.value;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            setTime(newValue);
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            setTime(newValue);
            e.preventDefault();
          } else if (e.code === "Enter") {
            readPlayer().seekTo(Number(value), true);
          }
        }}
      />
    </TooltipWrapper>
  );
};

interface DirectEditTimeInputProps {
  ref: React.RefObject<HTMLInputElement | null>;
  time: string;
}

const DirectLyricsInput = ({ ref }: { ref: React.RefObject<HTMLInputElement | null> }) => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const lyrics = useLyricsState();

  const setLyrics = useSetLyrics();
  const handleEnterAddRuby = useAddRubyTagEvent();

  return (
    <TooltipWrapper
      label={<span className="text-xs">Enterキーを押すとRubyタグを挿入できます。</span>}
      disabled={!isLineLyricsSelected}
      open={isLineLyricsSelected}
    >
      <Input
        ref={ref}
        className="h-8"
        autoComplete="off"
        value={lyrics}
        onKeyDown={handleEnterAddRuby}
        onChange={(e) => setLyrics(e.target.value)}
        onSelect={(e) => {
          const start = e.currentTarget.selectionStart;
          const end = e.currentTarget.selectionEnd;
          const isSelected = end !== null && start !== null && end - start > 0;
          setIsLineLyricsSelected(isSelected);
        }}
        onBlur={() => setIsLineLyricsSelected(false)}
      />
    </TooltipWrapper>
  );
};

const DirectWordInput = ({ ref }: { ref: React.RefObject<HTMLInputElement | null> }) => {
  const isLoadWordConvert = useIsWordConvertingState();
  const selectWord = useWordState();
  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const setWord = useSetWord();

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        disabled={isLoadWordConvert}
        variant="outline"
        size="sm"
        className="hover:bg-secondary/40 h-8 w-[8%]"
        onClick={wordConvertButtonEvent}
      >
        {isLoadWordConvert ? <span className="loading loading-spinner loading-xs" /> : "変換"}
      </Button>
      <Input
        ref={ref}
        className="h-8 w-[91%]"
        autoComplete="off"
        value={selectWord}
        onChange={(e) => setWord(e.target.value)}
      />
    </div>
  );
};
