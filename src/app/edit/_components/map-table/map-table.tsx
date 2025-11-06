"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Cell, ColumnDef } from "@tanstack/react-table";
import parse from "html-react-parser";
import { Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { DataTable } from "@/components/ui/table/data-table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { fetchBackupMap } from "@/lib/indexed-db";
import { cn } from "@/lib/utils";
import type { MapLine } from "@/server/drizzle/validator/map-json";
import { useTRPC } from "@/trpc/provider";
import { readEndLineIndex, useEndLineIndexState } from "../../_lib/atoms/button-disabled-state";
import { useCreatorIdState, useMapIdState } from "../../_lib/atoms/hydrate";
import { readMap, setMapAction, useMapState } from "../../_lib/atoms/map-reducer";
import { setTimeInputValue } from "../../_lib/atoms/ref";
import {
  dispatchLine,
  readDirectEditIndex,
  readYTPlayer,
  setCanUpload,
  setDirectEditIndex,
  setLyrics,
  setTabName,
  setWord,
  useDirectEditIndexState,
  useIsWordConvertingState,
  useLyricsState,
  useSelectIndexState,
  useTimeLineIndexState as useTimeLineIndex,
  useWordState,
} from "../../_lib/atoms/state";
import { updateLineAction, wordConvertAction } from "../../_lib/editor/editor-actions";
import { handleEnterAddRuby } from "../../_lib/editor/enter-add-ruby";
import { hasMapUploadPermission } from "../../_lib/map-table/has-map-upload-permission";
import { redo, undo } from "../../_lib/map-table/history";
import { moveLine } from "../../_lib/map-table/move-line";
import { wordSearchReplace } from "../../_lib/map-table/word-search-replace";
import { searchParamsParsers } from "../../_lib/search-params";
import { LineOptionDialog } from "./line-option-dialog";

export const MapTable = () => {
  const map = useMapState();
  const [optionDialogIndex, setOptionDialogIndex] = useState<number | null>(null);

  const hotKeyOptions = {
    enableOnFormTags: false,
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

  const trpc = useTRPC();
  const mapId = useMapIdState();
  const [{ backup: isBackup }] = useQueryStates({ backup: searchParamsParsers.isBackup });

  const { data: mapData, isLoading } = useQuery(
    trpc.map.getMapJson.queryOptions(
      { mapId: mapId ?? 0 },
      { enabled: !!mapId && !isBackup, staleTime: Infinity, gcTime: Infinity },
    ),
  );

  const endLineIndex = useEndLineIndexState();
  const timeLineIndex = useTimeLineIndex();

  const { data: backupMap } = useQuery(
    queryOptions({
      queryKey: ["backup"],
      queryFn: fetchBackupMap,
      enabled: isBackup && !mapId,
    }),
  );
  useEffect(() => {
    if (backupMap) {
      setMapAction({ type: "replaceAll", payload: backupMap.map });
      setCanUpload(true);
    }
  }, [backupMap]);

  useEffect(() => {
    if (mapData) {
      setMapAction({ type: "replaceAll", payload: mapData });
    }
  }, [mapData]);

  const directEditIndex = useDirectEditIndexState();
  const selectIndex = useSelectIndexState();

  const columns = useMemo(
    (): ColumnDef<MapLine>[] => [
      {
        header: "Time",
        accessorKey: "time",
        maxSize: 35,
        minSize: 35,
        meta: {
          onClick: (_event, row: MapLine, index: number) => {
            if (directEditIndex !== index) {
              readYTPlayer()?.seekTo(Number(row.time), true);
            }
          },
          cellClassName: (cell: Cell<MapLine, unknown>, index: number) => {
            const row = cell.row.original;
            const map = readMap();
            const nextTime = map[index + 1]?.time;
            return cn("text-center group", nextTime && row.time === nextTime && "bg-destructive/30 text-destructive");
          },
        },
        cell: ({ row }) => {
          const { index } = row;
          const nextTime = map[index + 1]?.time;
          const label = nextTime && row.original.time === nextTime ? "同じ時間の行が存在します" : "";

          if (directEditIndex === row.index) {
            return <DirectTimeInput time={row.original.time} />;
          }

          return (
            <TooltipWrapper label={label} disabled={!label}>
              <div className="flex items-center gap-1">
                <Play className="size-3.5 hidden xl:block relative top-px text-muted-foreground group-hover:text-white" />
                <span>{row.original.time}</span>
              </div>
            </TooltipWrapper>
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
          const { index } = row;

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
          const { index } = row;

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
          const { index } = row;
          const isOptionEdited = Boolean(
            row.original.options?.isChangeCSS ||
              row.original.options?.eternalCSS ||
              row.original.options?.changeVideoSpeed,
          );

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
        meta: { headerClassName: "text-center" },
      },
    ],
    [directEditIndex, endLineIndex, map],
  );

  return (
    <LoadingOverlayProvider isLoading={isLoading} message="Loading...">
      <Card className="p-0">
        <CardContent
          className="max-h-[calc(100vh-100px)] overflow-y-auto p-0 md:max-h-[500px] 2xl:max-h-[calc(100vh-400px)]"
          id="map-table-card"
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
                "border-b hover:bg-info/30",
                selectIndex === index && "!bg-info/70",
                timeLineIndex === index && "bg-success/30",
              );
            }}
            cellClassName="border-r whitespace-pre-wrap"
            tbodyId="map-table-tbody"
          />
        </CardContent>
      </Card>

      {optionDialogIndex !== null && (
        <LineOptionDialog index={optionDialogIndex} setOptionDialogIndex={setOptionDialogIndex} />
      )}
    </LoadingOverlayProvider>
  );
};

const DirectTimeInput = ({ time }: { time: string }) => {
  const [editTime, setEditTime] = useState(time);

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
            readYTPlayer()?.seekTo(Number(value), true);
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
  const isLoadWordConvert = useIsWordConvertingState();
  const selectWord = useWordState();
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        disabled={isLoadWordConvert}
        variant="outline"
        size="sm"
        className="hover:bg-secondary/40 h-8 w-[8%]"
        onClick={() => wordConvertAction(hasUploadPermission)}
      >
        {isLoadWordConvert ? <span className="loading loading-spinner loading-xs" /> : "変換"}
      </Button>
      <Input className="h-8 w-[91%]" autoComplete="off" value={selectWord} onChange={(e) => setWord(e.target.value)} />
    </div>
  );
};

const selectLine = (event: React.MouseEvent<HTMLTableRowElement>, selectingIndex: number) => {
  const map = readMap();
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
