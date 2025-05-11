"use client";
import { useHistoryReducer } from "@/app/edit/atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "@/app/edit/atoms/mapReducerAtom";
import { useSetCanUpload } from "@/app/edit/atoms/stateAtoms";
import useTimeValidate from "@/app/edit/hooks/utils/useTimeValidate";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { Box, Button, FormLabel, HStack, Input, useTheme } from "@chakra-ui/react";
import { useState } from "react";

export default function AllTimeAdjust() {
  const setCanUpload = useSetCanUpload();
  const theme: ThemeColors = useTheme();
  const toast = useCustomToast();
  const [totalAdjustValue, setTotalAdjustValue] = useState<string>("");
  const readMap = useMapStateRef();
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const timeValidate = useTimeValidate();

  const allTimeAdjust = () => {
    if (!totalAdjustValue) {
      return;
    }

    const map = readMap();
    const newMap = map.map((item, index) => {
      if (index === 0) {
        return {
          ...item,
          time: "0",
        };
      } else if (index === map.length - 1) {
        return {
          ...item,
          time: item.time,
        };
      } else {
        const newTime = timeValidate(Number(item.time) + Number(totalAdjustValue));
        return {
          ...item,
          time: newTime.toFixed(3),
        };
      }
    });
    setCanUpload(true);

    mapDispatch({ type: "replaceAll", payload: [...newMap] });
    historyDispatch({
      type: "add",
      payload: {
        actionType: "replaceAll",
        data: { old: readMap(), new: newMap },
      },
    });

    toast({
      type: "success",
      title: "タイムを調整しました",
      message: `全体のタイムが ${totalAdjustValue} 秒調整されました。\n
          Ctrl + Zで前のタイムに戻ることができます。`,
    });
  };

  return (
    <HStack alignItems="baseline">
      <CustomToolTip
        label={<Box>数値を入力後、実行ボタンを押すと、全体のタイムが数値分増減します</Box>}
        placement="top"
      >
        <HStack alignItems="baseline">
          <FormLabel fontSize="sm">全体タイム調整</FormLabel>
          <Input
            placeholder=""
            type="number"
            size="md"
            step="0.05"
            min="-3"
            max="3"
            className="max-w-[70px]"
            value={totalAdjustValue}
            onChange={(e) => setTotalAdjustValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                allTimeAdjust();
              }
            }}
          />

          <Button colorScheme="yellow" bg={theme.colors.background.body} variant={"outline"} onClick={allTimeAdjust}>
            実行
          </Button>
        </HStack>
      </CustomToolTip>
    </HStack>
  );
}
