"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import "@/app/edit/style/table.scss";
import { CardWithContent } from "@/components/ui/card";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useMapReducer, useReadMap } from "../../atoms/mapReducerAtom";
import { usePlayer, useTbody } from "../../atoms/refAtoms";
import { useIsYTReadiedState, useIsYTStartedState } from "../../atoms/stateAtoms";
import MapTableBody from "./child/MapTableBody";

export default function EditTable() {
  const tbodyRef = useRef(null);
  const { writeTbody } = useTbody();

  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));
  const mapDispatch = useMapReducer();
  const isYTStarted = useIsYTStartedState();
  const isYTReady = useIsYTReadiedState();
  const { readPlayer } = usePlayer();
  const readMap = useReadMap();

  useEffect(() => {
    if (mapData) {
      mapDispatch({ type: "replaceAll", payload: mapData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    const tbody = tbodyRef.current;
    if (tbody) {
      writeTbody(tbody);
    }
  }, []);

  useEffect(() => {
    if ((isYTReady && !isYTStarted) || isYTStarted) {
      const duration = readPlayer().getDuration();
      const map = readMap();

      const endLineIndex = map.findLastIndex((item) => item.lyrics === "end");

      if (duration) {
        const endLine = {
          time: duration.toFixed(3),
          lyrics: "end",
          word: "",
        };

        if (endLineIndex === -1) {
          mapDispatch({
            type: "add",
            payload: endLine,
          });
        } else {
          mapDispatch({
            type: "update",
            payload: endLine,
            index: endLineIndex,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTReady, isYTStarted]);

  return (
    <CardWithContent className="p-0">
      <LoadingOverlayWrapper active={isLoading} spinner={true} text="Loading...">
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto md:max-h-[500px] 2xl:max-h-[calc(100vh-400px)]">
          <Table className="mb-[65vh] text-sm md:mb-[60vh] 2xl:mb-[30vh]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%] text-center">Time</TableHead>
                <TableHead>歌詞</TableHead>
                <TableHead>ワード</TableHead>
                <TableHead className="w-[3%] text-center">オプション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody ref={tbodyRef}>
              <MapTableBody />
            </TableBody>
          </Table>
        </div>
      </LoadingOverlayWrapper>
    </CardWithContent>
  );
}
