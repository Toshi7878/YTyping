"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Table, TableContainer, Tbody, Th, Thead, Tr, useTheme } from "@chakra-ui/react";

import "@/app/edit/style/table.scss";
import { ThemeColors } from "@/types";
import { useMapQueries } from "@/util/global-hooks/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useMapReducer, useReadMap } from "../../atoms/mapReducerAtom";
import { usePlayer, useTbody } from "../../atoms/refAtoms";
import { useIsYTReadiedState, useIsYTStartedState } from "../../atoms/stateAtoms";
import MapTableBody from "./child/MapTableBody";

export default function EditTable() {
  const theme: ThemeColors = useTheme();
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
    <Card bg={theme.colors.background.card} color={theme.colors.text.body} m={2}>
      <LoadingOverlayWrapper active={isLoading} spinner={true} text="Loading...">
        <TableContainer
          maxH={{ sm: "calc(100vh - 100px)", md: "500px", "2xl": "calc(100vh - 400px)" }}
          overflowY="auto"
        >
          <Table size="sm" variant="simple" mb={{ sm: "65vh", md: "60vh", "2xl": "30vh" }}>
            <Thead>
              <Tr>
                <Th width="5%" borderRight="1px solid" borderRightColor={`${theme.colors.border.editorTable.right}`}>
                  Time
                </Th>
                <Th borderRight="1px solid" borderRightColor={`${theme.colors.border.editorTable.right}`}>
                  歌詞
                </Th>
                <Th borderRight="1px solid" borderRightColor={`${theme.colors.border.editorTable.right}`}>
                  ワード
                </Th>
                <Th
                  width="3%"
                  textAlign="center"
                  borderRight="1px solid"
                  borderRightColor={`${theme.colors.border.editorTable.right}`}
                >
                  オプション
                </Th>
              </Tr>
            </Thead>
            <Tbody ref={tbodyRef}>
              <MapTableBody />
            </Tbody>
          </Table>
        </TableContainer>
      </LoadingOverlayWrapper>
    </Card>
  );
}
