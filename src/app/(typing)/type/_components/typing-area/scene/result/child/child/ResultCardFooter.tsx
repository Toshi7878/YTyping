"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Badge, Flex, FlexProps, HStack } from "@chakra-ui/react";
import { memo } from "react";

interface ResultCardFooterProps {
  scoreCount?: number;
  point: number;
  tBonus: number;
  maxLinePoint: number;
  miss: number;
  kpm: number;
  rkpm: number;
  lost: number;
}

function ResultCardFooter({
  scoreCount,
  point,
  tBonus,
  maxLinePoint,
  miss,
  kpm,
  rkpm,
  lost,
  ...props
}: ResultCardFooterProps & FlexProps) {
  const missColor = point === 0 ? "gray" : miss > 0 || lost > 0 ? "red" : "green";

  return (
    <Flex gap={2} width="100%" justifyContent="space-between" py={2} {...props}>
      <HStack>
        <Badge colorScheme={missColor} fontSize="sm" px={1.5} py={0.5}>
          ミス: {miss}, ロスト: {lost}
        </Badge>
        <CustomToolTip label={`rkpm: ${rkpm}`} placement="top">
          <Badge colorScheme="blue" fontSize="sm" px={1.5} py={0.5}>
            KPM: {kpm}
          </Badge>
        </CustomToolTip>
      </HStack>

      <CustomToolTip
        label={`合計ポイント: ${Number(point) + Number(tBonus)}${scoreCount ? ` スコア: ${scoreCount}` : ""}`}
        placement="top"
      >
        <Badge colorScheme="green" variant="solid" fontSize="sm" px={2} py={1} borderRadius="md">
          ポイント: {point}
          {tBonus ? `+${tBonus}` : ""}
        </Badge>
      </CustomToolTip>
    </Flex>
  );
}

export default memo(ResultCardFooter);
