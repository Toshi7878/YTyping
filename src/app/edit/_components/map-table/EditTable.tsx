"use client";

import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useMapReducer, useMapState, useReadMap } from "../../_lib/atoms/mapReducerAtom";
import { usePlayer, useTbody } from "../../_lib/atoms/refAtoms";
import { useIsYTReadiedState, useIsYTStartedState } from "../../_lib/atoms/stateAtoms";

import "@/app/edit/_lib/style/table.scss";
import LineRow from "./line-row/LineRow";
import LineOptionDialog from "./LineOptionDialog";

export default function EditTable() {
  const map = useMapState();
  const tbodyRef = useRef(null);

  const { id: mapId } = useParams<{ id: string }>();
  const { writeTbody } = useTbody();
  const { readPlayer } = usePlayer();
  const mapDispatch = useMapReducer();
  const readMap = useReadMap();

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
    const handleEndLine = () => {
      if (!isYTReady && !isYTStarted) return;

      const duration = readPlayer().getDuration();
      if (!duration) return;

      const map = readMap();
      const endLineIndex = map.findLastIndex((item) => item.lyrics === "end");
      const endLine = {
        time: duration.toFixed(3),
        lyrics: "end",
        word: "",
      };

      if (endLineIndex === -1) {
        mapDispatch({ type: "add", payload: endLine });
      } else {
        mapDispatch({ type: "update", payload: endLine, index: endLineIndex });
      }
    };

    handleEndLine();
  }, [isYTReady, isYTStarted, readPlayer, readMap, mapDispatch]);

  return (
    <LoadingOverlayWrapper active={isLoading} spinner={true} text="Loading...">
      <CardWithContent className="p-0">
        <Table className="mb-[65vh] max-h-[calc(100vh-100px)] overflow-y-auto text-sm md:mb-[60vh] md:max-h-[500px] 2xl:mb-[30vh] 2xl:max-h-[calc(100vh-400px)]">
          <TableHeader>
            <TableRow className="border-accent hover:bg-transparent">
              <TableHead>Time</TableHead>
              <TableHead>歌詞</TableHead>
              <TableHead>ワード</TableHead>
              <TableHead className="w-1">オプション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={tbodyRef}>
            {map.map((line, index) => (
              <LineRow key={index} index={index} line={line} />
            ))}
          </TableBody>
        </Table>
      </CardWithContent>

      <LineOptionDialog />
    </LoadingOverlayWrapper>
  );
}
