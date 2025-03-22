"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Table, TableContainer, Tbody, Th, Thead, Tr, useTheme } from "@chakra-ui/react";

import "@/app/edit/style/table.scss";
import { db } from "@/lib/db";
import { useMapQuery } from "@/lib/global-hooks/query/mapRouterQuery";
import { IndexDBOption, ThemeColors } from "@/types";
import { MapLine } from "@/types/map";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useMapReducer, useMapStateRef } from "../../atoms/mapReducerAtom";
import { usePlayer, useTbodyRef } from "../../atoms/refAtoms";
import { usePathChangeAtomReset } from "../../atoms/reset";
import { useIsYTPlayingState, useIsYTReadiedState, useSetCanUploadState } from "../../atoms/stateAtoms";
import MapTableBody from "./child/MapTableBody";

export default function EditTable() {
  const theme: ThemeColors = useTheme();
  const tbodyRef = useRef(null);
  const { writeTbody } = useTbodyRef();
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapData, isLoading } = useMapQuery({ mapId });

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const isBackUp = searchParams.get("backup") === "true";
  const setCanUpload = useSetCanUploadState();
  const pathChangeReset = usePathChangeAtomReset();
  const mapDispatch = useMapReducer();
  const isYTPlaying = useIsYTPlayingState();
  const isYTReady = useIsYTReadiedState();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();

  useEffect(() => {
    if (mapData) {
      mapDispatch({ type: "replaceAll", payload: mapData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    if (newVideoId && isBackUp) {
      db.editorNewCreateBak.get({ optionName: "backupMapData" }).then((data: IndexDBOption | undefined) => {
        if (data) {
          mapDispatch({ type: "replaceAll", payload: data.value as MapLine[] });
        }
      });
      setCanUpload(true);
    } else {
      setCanUpload(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, newVideoId]);

  useEffect(() => {
    return () => {
      pathChangeReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, newVideoId]);

  useEffect(() => {
    const tbody = tbodyRef.current;
    if (tbody) {
      writeTbody(tbody);
    }
  }, []);

  useEffect(() => {
    if (isYTReady && isYTPlaying) {
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
  }, [isYTReady, isYTPlaying]);

  return (
    <Card bg={theme.colors.background.card} color={theme.colors.text.body} m={2}>
      <LoadingOverlayWrapper active={isLoading} spinner={true} text="Loading...">
        <TableContainer
          maxH={{ sm: "calc(100vh - 100px)", md: "500px", "2xl": "calc(100vh - 400px)" }}
          overflowY="auto"
        >
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th
                  width="5%"
                  borderRight="1px solid"
                  borderRightColor={`${theme.colors.border.editorTable.right}`}
                >
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
