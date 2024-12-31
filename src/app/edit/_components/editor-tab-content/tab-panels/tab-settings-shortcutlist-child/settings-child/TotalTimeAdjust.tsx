"use client";
import { useSetCanUploadAtom } from "@/app/edit/edit-atom/editAtom";
import { allAdjustTime } from "@/app/edit/redux/mapDataSlice";
import { RootState } from "@/app/edit/redux/store";
import { addHistory } from "@/app/edit/redux/undoredoSlice";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useUploadToast } from "@/lib/global-hooks/useUploadToast";
import { ThemeColors } from "@/types";
import { Box, Button, FormLabel, HStack, Input, useTheme } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TotalTimeAdjust() {
  const dispatch = useDispatch();
  const setCanUpload = useSetCanUploadAtom();
  const theme: ThemeColors = useTheme();
  const uploadToast = useUploadToast();

  const [totalAdjustValue, setTotalAdjustValue] = useState<string>("");

  const mapData = useSelector((state: RootState) => state.mapData.value);

  const allTimeAdjust = () => {
    if (!totalAdjustValue) {
      return;
    }

    const times = mapData.map((item) => item.time);
    setCanUpload(true);

    dispatch(
      addHistory({
        type: "allAdjustTime",
        data: { times, totalAdjustValue: Number(totalAdjustValue) },
      })
    );
    dispatch(allAdjustTime(totalAdjustValue));
    const successState = {
      id: null,
      title: "タイムを調整しました",
      message: `全体のタイムが ${totalAdjustValue} 秒調整されました。\n
          Ctrl + Zで前のタイムに戻ることができます。`,
      status: 200,
    };
    uploadToast(successState);
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

          <Button
            colorScheme="yellow"
            bg={theme.colors.background.body}
            variant={"outline"}
            onClick={allTimeAdjust}
          >
            実行
          </Button>
        </HStack>
      </CustomToolTip>
    </HStack>
  );
}
