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

import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { DataTable } from "@/components/ui/table/data-table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MapLine } from "@/types/map";
import { ColumnDef } from "@tanstack/react-table";
import parse from "html-react-parser";
import { useHotkeys } from "react-hotkeys-hook";
import { useEndLineIndexState } from "../../_lib/atoms/buttonDisableStateAtoms";
import { useAddRubyTagEvent } from "../../_lib/hooks/useAddRubyTag";
import { useLineUpdateButtonEvent, useWordConvertButtonEvent } from "../../_lib/hooks/useButtonEvents";
import { useSeekNextPrev, useUndoRedo } from "../../_lib/hooks/useMapTableHotKey";
import { useWordSearchReplace } from "../../_lib/hooks/useWordFindReplace";
import LineOptionDialog from "./LineOptionDialog";

export default function MapTable() {
  const map = useMapState();
  const [optionDialogIndex, setOptionDialogIndex] = useState<number | null>(null);
  const seekNextPrev = useSeekNextPrev();
  const { undo, redo } = useUndoRedo();
  const lineDispatch = useLineReducer();
  const wordSearchPeplace = useWordSearchReplace();

  const hotKeyOptions = {
    enableOnFormTags: false,
    preventDefault: true,
    enabled: optionDialogIndex === null,
  };

  useHotkeys("arrowUp", () => seekNextPrev("prev"), hotKeyOptions);
  useHotkeys("arrowDown", () => seekNextPrev("next"), hotKeyOptions);
  useHotkeys("ctrl+z", () => undo(), hotKeyOptions);
  useHotkeys("ctrl+y", () => redo(), hotKeyOptions);
  useHotkeys(
    "d",
    () => {
      lineDispatch({ type: "reset" });
      setDirectEditIndex(null);
    },
    hotKeyOptions,
  );

  useHotkeys("ctrl+shift+f", () => wordSearchPeplace(), hotKeyOptions);

  const tbodyRef = useRef(null);

  const { id: mapId } = useParams<{ id: string }>();
  const { writeTbody } = useTbody();
  const mapDispatch = useMapReducer();
  const { readPlayer } = usePlayer();

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

  const directEditIndex = useDirectEditIndexState();
  const selectIndex = useSelectIndexState();

  const setTabName = useSetTabName();
  const setSelectIndex = useSetSelectIndex();
  const setDirectEditIndex = useSetDirectEditIndex();
  const setSelectLine = useLineReducer();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const readMap = useReadMap();

  const selectLine = (event: React.MouseEvent<HTMLTableRowElement>, selectingIndex: number) => {
    const map = readMap();
    const { time, lyrics, word } = map[selectingIndex];

    if (directEditIndex === selectingIndex) {
      return null;
    }

    if (directEditIndex) {
      lineUpdateButtonEvent();
    }

    const isDirectEditMode = event.ctrlKey && selectingIndex !== 0 && selectingIndex !== endLineIndex;

    if (isDirectEditMode) {
      setDirectEditIndex(selectingIndex);
    } else if (directEditIndex !== selectingIndex) {
      setDirectEditIndex(null);
    }

    setSelectIndex(selectingIndex);
    setSelectLine({ type: "set", line: { time, lyrics, word, selectIndex: selectingIndex } });
  };

  const columns = useMemo(
    (): ColumnDef<MapLine>[] => [
      {
        header: "Time",
        accessorKey: "time",
        maxSize: 35,
        minSize: 35,
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
              {directEditIndex === index && <DirectTimeInput time={time} />}
              {directEditIndex !== index && row.original.time}
            </>
          );
        },
      },
      {
        header: "Lyrics",
        accessorKey: "lyrics",
        maxSize: 200,
        minSize: 200,

        enableResizing: false,
        cell: ({ row }) => {
          const index = row.index;

          return (
            <>
              {directEditIndex === index && <DirectLyricsInput />}
              {directEditIndex !== index && parse(row.original.lyrics)}
            </>
          );
        },
      },
      {
        header: "Word",
        accessorKey: "word",
        maxSize: 250,
        minSize: 250,

        enableResizing: false,
        cell: ({ row }) => {
          const index = row.index;

          return (
            <>
              {directEditIndex === index && <DirectWordInput />}
              {directEditIndex !== index && row.original.word}
            </>
          );
        },
      },

      {
        header: "Option",
        accessorKey: "option",
        maxSize: 34,
        minSize: 34,
        enableResizing: false,
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
        meta: {
          headerClassName: "text-center",
        },
      },
    ],
    [directEditIndex, endLineIndex, readPlayer],
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
          onRowClick={(event, _, index) => {
            selectLine(event, index);
            setTabName("エディター");
          }}
          className="border-none pb-56"
          rowClassName={(index: number) => {
            return cn(
              "border-b transition-none",
              "hover:bg-info/30",
              selectIndex === index && "!bg-info/70",
              timeLineIndex === index && "bg-success/30",
            );
          }}
          cellClassName="border-r whitespace-pre-wrap"
        />
      </CardWithContent>

      {optionDialogIndex !== null && (
        <LineOptionDialog index={optionDialogIndex} setOptionDialogIndex={setOptionDialogIndex} />
      )}
    </LoadingOverlayProvider>
  );
}

const DirectTimeInput = ({ time }: { time: string }) => {
  const [editTime, setEditTime] = useState(time);
  const { setTime } = useTimeInput();
  const { readPlayer } = usePlayer();

  return (
    <TooltipWrapper label={"↓↑: 0.05ずつ調整, Enter:再生"}>
      <Input
        className="h-8 [appearance:textfield] px-1 text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        type="number"
        value={editTime}
        size="sm"
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

const DirectLyricsInput = () => {
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

const DirectWordInput = () => {
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
      <Input className="h-8 w-[91%]" autoComplete="off" value={selectWord} onChange={(e) => setWord(e.target.value)} />
    </div>
  );
};
