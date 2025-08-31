"use client";

import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMapReducer, useMapState } from "../../_lib/atoms/mapReducerAtom";
import { usePlayer, useTbody } from "../../_lib/atoms/refAtoms";
import { useIsYTReadiedState, useIsYTStartedState } from "../../_lib/atoms/stateAtoms";

import "@/app/edit/_lib/style/table.css";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useUpdateEndTime } from "../../_lib/hooks/useUpdateEndTime";
import LineOptionDialog from "./LineOptionDialog";
import LineRow from "./LineRow";

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

  return (
    <LoadingOverlayProvider isLoading={isLoading} message="Loading...">
      <CardWithContent
        className={{
          card: "p-0",
          cardContent: "max-h-[calc(100vh-100px)] overflow-y-auto p-0 md:max-h-[500px] 2xl:max-h-[calc(100vh-400px)]",
        }}
      >
        <Table className="mb-[65vh] md:mb-[60vh] 2xl:mb-[30vh]">
          <TableHeader>
            <TableRow className="border-accent hover:bg-transparent">
              <TableHead className="h-8 text-xs">Time</TableHead>
              <TableHead className="h-8 text-xs">歌詞</TableHead>
              <TableHead className="h-8 text-xs">ワード</TableHead>
              <TableHead className="h-8 w-1 text-xs">オプション</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody ref={tbodyRef}>
            {map.map((line, index) => (
              <LineRow key={index} index={index} line={line} setOptionDialogIndex={setOptionDialogIndex} />
            ))}
          </TableBody>
        </Table>
      </CardWithContent>

      {optionDialogIndex !== null && (
        <LineOptionDialog index={optionDialogIndex} setOptionDialogIndex={setOptionDialogIndex} />
      )}
    </LoadingOverlayProvider>
  );
}
