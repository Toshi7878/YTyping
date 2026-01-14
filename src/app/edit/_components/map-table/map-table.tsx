"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import { Play } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { type Options, useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { fetchBackupMap } from "@/lib/indexed-db";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import type { RawMapLine } from "@/validator/raw-map-json";
import { readEndLineIndex, useEndLineIndexState } from "../../_lib/atoms/button-disabled-state";
import { readRawMap, setRawMapAction, useRawMapState } from "../../_lib/atoms/map-reducer";
import { setTimeInputValue } from "../../_lib/atoms/ref";
import {
  dispatchLine,
  readDirectEditIndex,
  setCanUpload,
  setDirectEditIndex,
  setLyrics,
  setTabName,
  setWord,
  useIsDirectEditLine,
  useIsPlayingLineState,
  useIsSelectedLine,
  useLyricsState,
  useWordState,
} from "../../_lib/atoms/state";
import { seekYTPlayer } from "../../_lib/atoms/youtube-player";
import { updateLineAction } from "../../_lib/editor/editor-actions";
import { handleEnterAddRuby } from "../../_lib/editor/enter-add-ruby";
import { redo, undo } from "../../_lib/map-table/history";
import { moveLine } from "../../_lib/map-table/move-line";
import { wordSearchReplace } from "../../_lib/map-table/word-search-replace";
import { useIsBuckupQueryState } from "../../_lib/search-params";
import { WordConvertButton } from "../tabs/editor/button";
import { LineOptionDialog } from "./line-option-dialog";

export const NewMapTable = () => {
  const { id: mapId } = useParams();
  const [isBackup] = useIsBuckupQueryState();

  const { data: backupMap } = useQuery(
    queryOptions({
      queryKey: ["backup"],
      queryFn: fetchBackupMap,
      enabled: isBackup && !mapId,
    }),
  );
  useEffect(() => {
    if (backupMap) {
      setRawMapAction({ type: "replaceAll", payload: backupMap.map });
      setCanUpload(true);
    }
  }, [backupMap]);

  return <MapTable />;
};

export const EditMapTable = () => {
  const trpc = useTRPC();
  const { id: mapId } = useParams();

  const { data: mapData, isLoading } = useQuery(
    trpc.map.getRawMapJson.queryOptions(
      { mapId: Number(mapId) },
      { enabled: !!mapId, staleTime: Infinity, gcTime: Infinity },
    ),
  );

  useEffect(() => {
    if (mapData) {
      setRawMapAction({ type: "replaceAll", payload: mapData });
    }
  }, [mapData]);

  return (
    <LoadingOverlayProvider isLoading={isLoading} message="Loading...">
      <MapTable />
    </LoadingOverlayProvider>
  );
};

const MapTable = () => {
  const map = useRawMapState();
  const [optionDialogIndex, setOptionDialogIndex] = useState<number | null>(null);

  const hotKeyOptions: Options = {
    enableOnFormTags: ["slider"],
    preventDefault: true,
    enabled: optionDialogIndex === null,
  };

  useHotkeys("arrowUp", () => moveLine("prev"), hotKeyOptions);
  useHotkeys("arrowDown", () => moveLine("next"), hotKeyOptions);
  useHotkeys("ctrl+z", () => undo(), hotKeyOptions);
  useHotkeys("ctrl+y", () => redo(), hotKeyOptions);
  useHotkeys("ctrl+shift+f", () => wordSearchReplace(), hotKeyOptions);
  useHotkeys(
    "d",
    () => {
      dispatchLine({ type: "reset" });
      setDirectEditIndex(null);
    },
    hotKeyOptions,
  );

  return (
    <>
      <Card className="p-0">
        <CardContent
          className="max-h-[calc(100vh-100px)] overflow-y-auto p-0 pb-80 md:max-h-[500px] xl:pb-56 2xl:max-h-[calc(100vh-400px)]"
          id="map-table-card"
        >
          <Table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[35px] min-w-[35px]" />
              <col className="w-[200px] min-w-[200px]" />
              <col className="w-[250px] min-w-[250px]" />
              <col className="w-[34px] min-w-[34px]" />
            </colgroup>
            <TableHeader className="sticky top-0 z-10 border-b [&_th]:h-8 [&_th]:border-r [&_th]:px-2 [&_th]:font-medium">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left">Time</TableHead>
                <TableHead className="text-left">Lyrics</TableHead>
                <TableHead className="text-left">Word</TableHead>
                <TableHead className="text-center">Option</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody id="map-table-tbody" className="[&_td]:whitespace-pre-wrap [&_td]:border-r [&_td]:p-2">
              {map.map((row, index) => {
                const isErrorRow = row.time === map[index + 1]?.time;

                return (
                  <MapTableRow
                    // biome-ignore lint/suspicious/noArrayIndexKey: The map order is the key itself
                    key={index}
                    row={row}
                    index={index}
                    isErrorRow={isErrorRow}
                    onOpenChange={setOptionDialogIndex}
                  />
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {optionDialogIndex !== null && (
        <LineOptionDialog index={optionDialogIndex} setOptionDialogIndex={setOptionDialogIndex} />
      )}
    </>
  );
};

const MapTableRow = ({
  row,
  index,
  isErrorRow,
  onOpenChange,
}: {
  row: RawMapLine;
  index: number;
  isErrorRow: boolean;
  onOpenChange: Dispatch<SetStateAction<number | null>>;
}) => {
  const isSelectedLine = useIsSelectedLine(index);
  const isPlayingLine = useIsPlayingLineState(index);
  const isDirectEditLine = useIsDirectEditLine(index);

  return (
    <TableRow
      className={cn(
        "cursor-pointer border-b hover:bg-info/30",
        isSelectedLine && "bg-info/70!",
        isPlayingLine && "bg-success/30",
        isErrorRow && "bg-destructive/30 text-destructive",
      )}
      onClick={(event) => {
        selectLine(event, index);
        setTabName("エディター");
      }}
    >
      <TableCell
        className="group text-center"
        onClick={() => {
          const directEditIndex = readDirectEditIndex();
          if (directEditIndex !== index) {
            seekYTPlayer(Number(row.time));
          }
        }}
      >
        {isDirectEditLine ? (
          <DirectTimeInput time={row.time} />
        ) : (
          <div className="flex items-center gap-1">
            <Play className="relative top-px hidden size-3.5 text-muted-foreground group-hover:text-white xl:block" />
            <span>{row.time}</span>
          </div>
        )}
      </TableCell>
      <TableCell>{isDirectEditLine ? <DirectLyricsInput /> : parse(row.lyrics)}</TableCell>
      <TableCell>{isDirectEditLine ? <DirectWordInput /> : <span>{row.word}</span>}</TableCell>
      <TableCell>
        <OptionCell options={row.options} index={index} onOpenChange={onOpenChange} />
      </TableCell>
    </TableRow>
  );
};

const OptionCell = ({
  options,
  index,
  onOpenChange,
}: {
  options: RawMapLine["options"];
  index: number;
  onOpenChange: Dispatch<SetStateAction<number | null>>;
}) => {
  const endLineIndex = useEndLineIndexState();

  const isOptionEdited = Boolean(
    options?.isChangeCSS || options?.eternalCSS || options?.changeVideoSpeed || options?.isCaseSensitive,
  );

  return (
    <Button
      disabled={index === endLineIndex}
      variant={isOptionEdited ? "success" : "outline"}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        if (index !== endLineIndex) {
          onOpenChange(index);
        }
      }}
    >
      {isOptionEdited ? "設定有" : "未設定"}
    </Button>
  );
};

const DirectTimeInput = ({ time }: { time: string }) => {
  const [editTime, setEditTime] = useState(time);

  return (
    <TooltipWrapper label={"↓↑: 0.05ずつ調整, Enter:再生"}>
      <Input
        className="h-8 px-1 text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        type="number"
        value={editTime}
        size="sm"
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          setTimeInputValue(newValue);
        }}
        onKeyDown={(e) => {
          const { value } = e.currentTarget;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            setTimeInputValue(newValue);
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            setTimeInputValue(newValue);
            e.preventDefault();
          } else if (e.code === "Enter") {
            seekYTPlayer(Number(value));
          }
        }}
      />
    </TooltipWrapper>
  );
};

const DirectLyricsInput = () => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const lyrics = useLyricsState();

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
  const selectWord = useWordState();

  return (
    <div className="flex items-center justify-between gap-2">
      <WordConvertButton className="h-8 w-[8%] hover:bg-secondary/40" label="変換" variant="outline" />
      <Input className="h-8 w-[91%]" autoComplete="off" value={selectWord} onChange={(e) => setWord(e.target.value)} />
    </div>
  );
};

const selectLine = (event: React.MouseEvent<HTMLTableRowElement>, selectingIndex: number) => {
  const map = readRawMap();
  const directEditIndex = readDirectEditIndex();

  const line = map[selectingIndex];
  if (!line) return;
  const { time, lyrics, word } = line;

  if (directEditIndex === selectingIndex) {
    return null;
  }

  if (directEditIndex) {
    updateLineAction();
  }

  const endLineIndex = readEndLineIndex();
  const isDirectEditMode = event.ctrlKey && selectingIndex !== 0 && selectingIndex !== endLineIndex;

  if (isDirectEditMode) {
    setDirectEditIndex(selectingIndex);
  } else if (directEditIndex !== selectingIndex) {
    setDirectEditIndex(null);
  }

  setTimeout(() => {
    dispatchLine({ type: "set", line: { time, lyrics, word, selectIndex: selectingIndex } });
  });
};
