"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Stack, Text, useTheme } from "@chakra-ui/react";
import { memo } from "react";
interface ResultCardFooterProps {
  scoreCount?: number;
  point: number;
  tBonus: number;
  maxLinePoint: number;
  lMiss: number;
  kpm: number;
  rkpm: number;
}

function ResultCardFooter({
  scoreCount,
  point,
  tBonus,
  maxLinePoint,
  lMiss,
  kpm,
  rkpm,
}: ResultCardFooterProps) {
  const theme: ThemeColors = useTheme();

  return (
    <Stack>
      <Box>
        miss: {lMiss},{" "}
        <CustomToolTip label={`rkpm:${rkpm}`} placement="top" fontSize="sm">
          <Text as="span" _hover={{ bg: `${theme.colors.border.card}30` }}>
            kpm: {kpm}
          </Text>
        </CustomToolTip>
        ,{" "}
        <CustomToolTip
          label={`sumPoint: ${Number(point) + Number(tBonus)}${
            scoreCount ? ` Score: ${scoreCount}` : ""
          }`}
          placement="top"
          fontSize="sm"
        >
          <Text as="span" _hover={{ bg: `${theme.colors.border.card}30` }}>
            point: {point}
            {tBonus ? `+${tBonus}` : ""} / {maxLinePoint}
          </Text>
        </CustomToolTip>
      </Box>
    </Stack>
  );
}

export default memo(ResultCardFooter);
