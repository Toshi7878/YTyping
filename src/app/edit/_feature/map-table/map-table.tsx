"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { Play } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { type Options, useHotkeys } from "react-hotkeys-hook";
import { idb } from "@/app/edit/_feature/indexed-db";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input/input";
import { LoadingOverlayProvider } from "@/ui/overlay";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table/table";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { store } from "../provider";
import { useIsBuckupQueryState } from "../search-params";
import { updateLineAction } from "../tabs/editor/button/update";
import { WordConvertButton } from "../tabs/editor/button/word-convert";
import { handleEnterAddRuby } from "../tabs/editor/enter-add-ruby";
import {
  dispatchLine,
  getSelectLine,
  setLyrics,
  setTimeValue,
  setWord,
  useIsSelectedLine,
  useLyricsState,
  useWordState,
} from "../tabs/editor/select-line-input";
import { setCanUpload } from "../tabs/info-form/card";
import { setTabName } from "../tabs/tabs";
import { YTPlayer } from "../youtube-player";
import { redo, undo } from "./history";
import { LineOptionDialog } from "./line-option-dialog";
import { getRawMap, mapAtom, setRawMapAction, useRawMap } from "./map-reducer";
import { scrollMapTableToRow } from "./scroll";
import { wordSearchReplace } from "./word-search-replace";

const playingLineIndexAtom = atom(0);
// const cssTextLengthAtom = atom(0);

export const useIsPlayingLine = (index: number) => {
  return useAtomValue(
    selectAtom(playingLineIndexAtom, (s) => s === index),
    { store },
  );
};

export const getPlayingLineIndex = () => store.get(playingLineIndexAtom);
export const setPlayingLineIndex = (value: ExtractAtomValue<typeof playingLineIndexAtom>) =>
  store.set(playingLineIndexAtom, value);

const directEditingIndexAtom = atom<number | null>(null);
const useIsDirectEditingLine = (index: number) => {
  return useAtomValue(
    selectAtom(directEditingIndexAtom, (s) => s === index),
    { store },
  );
};
export const getDirectEditingIndex = () => store.get(directEditingIndexAtom);
export const setDirectEditingIndex = (value: ExtractAtomValue<typeof directEditingIndexAtom>) =>
  store.set(directEditingIndexAtom, value);

export const endLineIndexAtom = atom((get) => {
  const map = get(mapAtom);
  return map.findLastIndex((line) => line.lyrics === "end");
});

const useEndLineIndex = () => useAtomValue(endLineIndexAtom);
const getEndLineIndex = () => store.get(endLineIndexAtom);

export const NewMapTable = () => {
  const { id: mapId } = useParams();
  const [isBackup] = useIsBuckupQueryState();

  const { data: backupMap } = useQuery(
    queryOptions({
      queryKey: ["backup"],
      queryFn: idb.backup.fetch,
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
    trpc.map.getJsonById.queryOptions(
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
    <LoadingOverlayProvider isLoading={isLoading} description="Loading...">
      <MapTable />
    </LoadingOverlayProvider>
  );
};

const MapTable = () => {
  const map = useRawMap();
  const [optionDialogIndex, setOptionDialogIndex] = useState<number | null>(null);

  const hotKeyOptions: Options = {
    enableOnFormTags: ["slider"],
    preventDefault: true,
    enabled: optionDialogIndex === null,
  };

  useHotkeys("arrowUp", () => moveLine("prev"), hotKeyOptions);
  useHotkeys("arrowDown", () => moveLine("next"), hotKeyOptions);
  useHotkeys("ctrl+z, meta+z", () => undo(), hotKeyOptions);
  useHotkeys("ctrl+y, meta+shift+z", () => redo(), hotKeyOptions);
  useHotkeys("ctrl+shift+f, meta+shift+f", () => wordSearchReplace(), hotKeyOptions);
  useHotkeys(
    "d",
    () => {
      dispatchLine({ type: "reset" });
      setDirectEditingIndex(null);
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
              <col className="w-[9ch] min-w-[9ch] xl:w-[12ch] xl:min-w-[12ch]" />
              <col className="w-72 md:w-auto" />
              <col className="w-72 md:w-auto" />
              <col className="w-22 min-w-22" />
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
                    // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
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
  const isPlayingLine = useIsPlayingLine(index);
  const isDirectEditLine = useIsDirectEditingLine(index);

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
        className="group whitespace-nowrap text-center tabular-nums"
        onClick={() => {
          const directEditIndex = getDirectEditingIndex();
          if (directEditIndex !== index) {
            YTPlayer.seek(Number(row.time));
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
  const endLineIndex = useEndLineIndex();

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
    <TooltipWrapper label={"↓↑: 0.05ずつ調整, Enter:再生"} asChild>
      <Input
        className="h-8 px-1 text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        type="number"
        value={editTime}
        size="sm"
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          setTimeValue(newValue);
        }}
        onKeyDown={(e) => {
          const { value } = e.currentTarget;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            setTimeValue(newValue);
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            setTimeValue(newValue);
            e.preventDefault();
          } else if (e.code === "Enter") {
            YTPlayer.seek(Number(value));
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
    <TooltipWrapper label="Enterキーを押すとRubyタグを挿入できます。" open={isLineLyricsSelected} asChild>
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
  const map = getRawMap();
  const directEditIndex = getDirectEditingIndex();

  const line = map[selectingIndex];
  if (!line) return;
  const { time, lyrics, word } = line;

  if (directEditIndex === selectingIndex) {
    return null;
  }

  if (directEditIndex) {
    updateLineAction();
  }

  const endLineIndex = getEndLineIndex();
  const isDirectEditMode = event.ctrlKey && selectingIndex !== 0 && selectingIndex !== endLineIndex;

  if (isDirectEditMode) {
    setDirectEditingIndex(selectingIndex);
  } else if (directEditIndex !== selectingIndex) {
    setDirectEditingIndex(null);
  }

  setTimeout(() => {
    dispatchLine({ type: "set", line: { time, lyrics, word, selectIndex: selectingIndex } });
  });
};

const moveLine = (type: "next" | "prev") => {
  const directEditingIndex = getDirectEditingIndex();

  const { selectIndex } = getSelectLine();
  if (selectIndex !== null && !directEditingIndex) {
    const seekCount = selectIndex + (type === "next" ? 1 : -1);
    const seekLine = getRawMap()[seekCount];
    if (seekLine) {
      YTPlayer.seek(Number(seekLine.time));
      dispatchLine({
        type: "set",
        line: {
          time: seekLine.time,
          lyrics: seekLine.lyrics,
          word: seekLine.word,
          selectIndex: seekCount,
        },
      });
      scrollMapTableToRow({ rowIndex: seekCount });
    }
  }
};
