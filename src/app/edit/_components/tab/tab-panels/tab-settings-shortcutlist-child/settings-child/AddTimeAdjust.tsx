"use client";
import { Box, FormLabel, HStack, Input } from "@chakra-ui/react";

import { useSetTimeOffsetState, useTimeOffsetState } from "@/app/edit/atoms/storageAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";

export default function AddTimeAdjust() {
  const timeOffset = useTimeOffsetState();
  const setTimeOffset = useSetTimeOffsetState();

  return (
    <HStack alignItems="baseline">
      <CustomToolTip
        label={
          <>
            <Box>再生中に追加・変更ボタンを押した時に、数値分タイムを補正します</Box>
            <Box as="small">※動画停止中は補正しません</Box>
          </>
        }
        placement="top"
      >
        <HStack alignItems="baseline">
          <FormLabel fontSize="xs" mr={1}>
            追加タイム補正
          </FormLabel>
          <Input
            name="time-offset"
            placeholder=""
            type="number"
            size="sm"
            step="0.05"
            min="-3"
            max="3"
            className="max-w-[70px]"
            value={timeOffset}
            onChange={(e) => {
              setTimeOffset(Number(e.target.value));
            }}
          />
        </HStack>
      </CustomToolTip>
    </HStack>
  );
}
