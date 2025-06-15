"use client";

import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useMapReducer, useMapState, useReadMap } from "../../atoms/mapReducerAtom";
import { usePlayer, useTbody } from "../../atoms/refAtoms";
import { useIsYTReadiedState, useIsYTStartedState } from "../../atoms/stateAtoms";

import "@/app/edit/style/table.scss";
import LineRow from "./child/child/LineRow";

export default function EditTable() {
  const map = useMapState();
  const tbodyRef = useRef(null);

  // Hooks
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
    <CardWithContent className="p-0">
      <LoadingOverlayWrapper active={isLoading} spinner={true} text="Loading...">
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto md:max-h-[500px] 2xl:max-h-[calc(100vh-400px)]">
          <Table className="mb-[65vh] text-sm md:mb-[60vh] 2xl:mb-[30vh]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[5%] text-center">Time</TableHead>
                <TableHead>歌詞</TableHead>
                <TableHead>ワード</TableHead>
                <TableHead className="w-[3%] text-center">オプション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody ref={tbodyRef}>
              {map.map((line, index) => (
                <LineRow key={index} index={index} line={line} />
              ))}
            </TableBody>
          </Table>
        </div>
      </LoadingOverlayWrapper>
    </CardWithContent>
  );
}
