"use client";
import { ThemeColors } from "@/types";
import { Box, FormLabel, HStack, Input, useTheme } from "@chakra-ui/react";

import {
  useEditAddTimeOffsetAtom,
  useSetEditAddTimeOffsetAtom,
} from "@/app/edit/edit-atom/editAtom";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { sendEditorOptionIndexedDBData } from "@/lib/db";

export default function AddTimeAdjust() {
  const theme: ThemeColors = useTheme();

  const addTimeOffset = useEditAddTimeOffsetAtom();
  const setAddTimeOffset = useSetEditAddTimeOffsetAtom();

  return (
    <HStack alignItems="baseline">
      <CustomToolTip
        tooltipLabel={
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
            bg={theme.colors.background.body}
            borderColor={`${theme.colors.border.card}60`}
            value={addTimeOffset}
            onChange={(e) => {
              setAddTimeOffset(Number(e.target.value));
              sendEditorOptionIndexedDBData(e.target as HTMLInputElement);
            }}
          />
        </HStack>
      </CustomToolTip>
    </HStack>
  );
}
