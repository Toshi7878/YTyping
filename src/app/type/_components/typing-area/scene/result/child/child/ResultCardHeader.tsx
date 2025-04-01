"use client";
import { useMapState } from "@/app/type/atoms/stateAtoms";
import { InputMode } from "@/app/type/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ParseMap } from "@/lib/parseMap";
import { ThemeColors } from "@/types";
import { Box, Text, useTheme } from "@chakra-ui/react";
import { memo } from "react";

interface ResultCardHeaderProps {
  lineNotes: number;
  lineIndex: number;
  lineInputMode: InputMode;
  lineKpm: number;
  lineSpeed: number;
}

function ResultCardHeader({ lineNotes, lineIndex, lineInputMode, lineKpm, lineSpeed }: ResultCardHeaderProps) {
  const map = useMapState() as ParseMap;
  const theme: ThemeColors = useTheme();

  const hoverStyle = { bg: `${theme.colors.border.card}30` };
  const tooltipProps = { placement: "top" as const, fontSize: "sm" };

  const inputModeText = lineInputMode === "roma" ? "(ローマ字)" : "(かな)";

  return (
    <Box>
      <Text as="span">
        {lineIndex}/{map?.lineLength}
      </Text>
      <Text as="span" mx={2}>
        |
      </Text>
      <CustomToolTip label={`要求打鍵速度${inputModeText}`} {...tooltipProps}>
        <Text as="span" className="line-kpm" fontWeight="bold" _hover={hoverStyle}>
          {lineKpm.toFixed(0)}kpm {lineSpeed > 1 && `(${lineSpeed.toFixed(2)}倍速)`}
        </Text>
      </CustomToolTip>
      <Text as="span" mx={2}>
        |
      </Text>
      <CustomToolTip label={`要求打鍵数${inputModeText}`} {...tooltipProps}>
        <Text as="span" _hover={hoverStyle} className="line-notes">
          {lineNotes}打
        </Text>
      </CustomToolTip>
    </Box>
  );
}

export default memo(ResultCardHeader);
