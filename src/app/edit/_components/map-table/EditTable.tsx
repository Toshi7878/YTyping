"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Table, TableContainer, Tbody, Th, Thead, Tr, useTheme } from "@chakra-ui/react";

import "@/app/edit/style/table.scss";
import { ThemeColors } from "@/types";
import { useEffect, useRef } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useRefs } from "../../edit-contexts/refsProvider";
import MapTableBody from "./child/MapTableBody";

interface EditTableProps {
  mapLoading: boolean;
}

export default function EditTable(props: EditTableProps) {
  const theme: ThemeColors = useTheme();
  const tbodyRef = useRef(null);

  const { setRef } = useRefs();

  useEffect(() => {
    setRef("tbody", tbodyRef.current);
  }, []);

  return (
    <Card bg={theme.colors.background.card} color={theme.colors.text.body} m={2}>
      <LoadingOverlayWrapper active={props.mapLoading} spinner={true} text="Loading...">
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
                <Th
                  borderRight="1px solid"
                  borderRightColor={`${theme.colors.border.editorTable.right}`}
                >
                  歌詞
                </Th>
                <Th
                  borderRight="1px solid"
                  borderRightColor={`${theme.colors.border.editorTable.right}`}
                >
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
