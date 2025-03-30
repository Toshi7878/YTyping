"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Badge, Flex, FlexProps, HStack } from "@chakra-ui/react";
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
  ...props
}: ResultCardFooterProps & FlexProps) {
  return (
    <Flex width="100%" justifyContent="space-between" alignItems="center" p={2} {...props}>
      <HStack spacing={2}>
        <Badge colorScheme="red" variant="subtle" size="md" fontSize="sm" px={1.5} py={0.5}>
          ミス: {lMiss}
        </Badge>
        <CustomToolTip label={`rkpm: ${rkpm}`} placement="top">
          <Badge colorScheme="blue" variant="subtle" cursor="pointer" fontSize="sm" px={1.5} py={0.5}>
            KPM: {kpm}
          </Badge>
        </CustomToolTip>
      </HStack>

      <CustomToolTip
        label={`合計ポイント: ${Number(point) + Number(tBonus)}${scoreCount ? ` スコア: ${scoreCount}` : ""}`}
        placement="top"
      >
        <Badge colorScheme="green" variant="solid" cursor="pointer" px={2} py={1} borderRadius="md">
          ポイント: {point}
          {tBonus ? `+${tBonus}` : ""} / {maxLinePoint}
        </Badge>
      </CustomToolTip>
    </Flex>
  );
}

export default memo(ResultCardFooter);
