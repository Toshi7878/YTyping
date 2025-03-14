"use client";
import { useMapAtom } from "@/app/type/atoms/stateAtoms";
import { InputModeType } from "@/app/type/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Text, useTheme } from "@chakra-ui/react";
import { memo } from "react";

interface ResultCardHeaderdProps {
  index: number;
  lineNotes: number;
  lineCount: number;
  lineInputMode: InputModeType;
  lineTime: number;
  lineKpm: number;
  lineSpeed: number;
}

function ResultCardHeader({
  index,
  lineNotes,
  lineCount,
  lineInputMode,
  lineTime,
  lineKpm,
  lineSpeed,
}: ResultCardHeaderdProps) {
  const map = useMapAtom();
  const theme: ThemeColors = useTheme();

  return (
    <Box>
      <Text as="span" data-list-number={index}>
        {lineCount}/{map!.lineLength}
      </Text>
      <Text as="span" mx={2}>
        {"|"}
      </Text>
      <CustomToolTip
        label={`ライン打鍵数${lineInputMode === "roma" ? "(ローマ字)" : "(かな)"}`}
        placement="top"
        fontSize="sm"
      >
        <Text as="span" _hover={{ bg: `${theme.colors.border.card}30` }} className="line-notes">
          {lineNotes}打
        </Text>
      </CustomToolTip>
      ÷{" "}
      <CustomToolTip label="ライン時間" placement="top" fontSize="sm">
        <Text as="span" _hover={{ bg: `${theme.colors.border.card}30` }} className="line-time">
          {lineTime.toFixed(1)}秒
        </Text>
      </CustomToolTip>
      ={" "}
      <CustomToolTip
        label={`要求打鍵速度${lineInputMode === "roma" ? "(ローマ字)" : "(かな)"}`}
        placement="top"
        fontSize="sm"
      >
        <Text as="span" className="line-kpm" _hover={{ bg: `${theme.colors.border.card}30` }}>
          {lineKpm.toFixed(0)}kpm {lineSpeed > 1 && <>{`(${lineSpeed.toFixed(2)}倍速)`}</>}
        </Text>
      </CustomToolTip>
    </Box>
  );
}

export default memo(ResultCardHeader);
