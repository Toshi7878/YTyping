import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import {
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Card,
  CardBody,
  useMediaQuery,
} from "@chakra-ui/react"; // Card, CardBodyを追加

import "../../../style/statusTable.scss";
import { mapAtom } from "@/app/type/(atoms)/gameRenderAtoms";

import { useAtom } from "jotai";
import styled from "@emotion/styled";
import StatusValue from "./child/StatusValue";
import { useRefs } from "@/app/type/(contexts)/refsProvider";
import { Status } from "@/app/type/(ts)/type";

export interface TabStatusRef {
  getStatus: () => Status;
  setStatus: (newStatus: Status) => void;
  resetStatus: () => void;
}

const TabStatus = forwardRef((props, ref) => {
  const [map] = useAtom(mapAtom);

  const defaultStatus: Status = {
    score: 0,
    point: 0,
    timeBonus: 0,
    type: 0,
    miss: 0,
    lost: 0,
    rank: 0,
    kpm: 0,
    line: map ? map.lineLength : 0,
  };

  const [status, setStatus] = useState(defaultStatus);
  const [isMdOrSmaller] = useMediaQuery("(max-width: 900px)"); // mdサイズ以下の判定
  const { setRef } = useRefs();

  useEffect(() => {
    if (ref && "current" in ref) {
      setRef("tabStatusRef", ref.current!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useImperativeHandle(ref, () => ({
    getStatus: () => status,
    setStatus: (newStatus: Status) => setStatus(newStatus),
    resetStatus: () => setStatus(structuredClone(defaultStatus)),
  }));

  useEffect(() => {
    if (map) {
      const newStatus = { ...status };
      newStatus.line = map.lineLength;
      setStatus(newStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (!map) return null; // mapが存在しない場合は何も表示しない

  const STATUS_LABEL = isMdOrSmaller
    ? ["score", "line", "miss", "lost"]
    : ["score", "type", "kpm", "rank", "point", "miss", "lost", "line"];
  const capitalizeFirstLetter = (string: string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const Label = styled.span`
    position: relative;
    right: 8px;
  `;

  const UnderlinedSpan = styled.span<{ label: string }>`
    position: relative;

    .value {
      position: relative;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      width: ${({ label }) => (label === "score" || label === "point" ? "140px" : "81px")};
      background-color: black;
    }
  `;

  const TrStyled = styled(Tr)<{ isMdOrSmaller: boolean }>`
    height: ${({ isMdOrSmaller }) =>
      isMdOrSmaller ? "52px" : "122px"}; // isMdOrSmallerがtrueのとき高さを小さく設定
  `;
  const TdStyled = styled(Td)<{ isCentered: boolean }>`
    ${({ isCentered }) => isCentered && "text-align: center;"}
  `;
  return (
    <Card
      variant={"filled"}
      bg="blue.100"
      boxShadow="lg"
      size={isMdOrSmaller ? "sm" : "md"} // isMdOrSmallerがtrueでサイズを小さく
    >
      <CardBody>
        <TableContainer>
          <Table variant="unstyled" className="table-fixed overflow-hidden">
            <Tbody className="font-bold text-2xl 2xl:text-4xl font-mono">
              {/* 1段目 */}

              <TrStyled isMdOrSmaller={isMdOrSmaller}>
                {STATUS_LABEL.slice(0, STATUS_LABEL.length / 2).map((label) => {
                  return (
                    <TdStyled
                      key={label}
                      id={label}
                      className={label === "rank" && status["rank"] === 0 ? " opacity-45" : ""}
                      isCentered={isMdOrSmaller}
                    >
                      <Label className="label">{capitalizeFirstLetter(label)}</Label>

                      <UnderlinedSpan label={label}>
                        <StatusValue value={status[label]} />
                      </UnderlinedSpan>
                    </TdStyled>
                  );
                })}
              </TrStyled>

              {/* 2段目 */}

              <TrStyled isMdOrSmaller={isMdOrSmaller}>
                {STATUS_LABEL.slice(STATUS_LABEL.length / 2).map((label) => {
                  return (
                    <TdStyled key={label} id={label} isCentered={isMdOrSmaller}>
                      <Label>{capitalizeFirstLetter(label)}</Label>

                      <UnderlinedSpan label={label}>
                        <StatusValue
                          value={
                            label === "point" && status["timeBonus"]
                              ? `${status[label]}+${status["timeBonus"]}`
                              : status[label]
                          }
                        />
                      </UnderlinedSpan>
                    </TdStyled>
                  );
                })}
              </TrStyled>
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
});

TabStatus.displayName = "TabStatus";

export default TabStatus;