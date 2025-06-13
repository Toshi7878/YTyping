"use client";
import { useHistoryReducer } from "@/app/edit/atoms/historyReducerAtom";
import { useMapReducer, useReadMap } from "@/app/edit/atoms/mapReducerAtom";
import { useSetCanUpload } from "@/app/edit/atoms/stateAtoms";
import useTimeValidate from "@/app/edit/hooks/utils/useTimeValidate";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useState } from "react";

export default function AllTimeAdjust() {
  const setCanUpload = useSetCanUpload();
  const toast = useCustomToast();
  const [totalAdjustValue, setTotalAdjustValue] = useState<string>("");
  const readMap = useReadMap();
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
    <div className="flex items-baseline">
      <CustomToolTip
        label={<div>数値を入力後、実行ボタンを押すと、全体のタイムが数値分増減します</div>}
        placement="top"
      >
        <div className="flex items-baseline gap-2">
          <Label className="text-sm">全体タイム調整</Label>
          <Input
            placeholder=""
            type="number"
            step="0.05"
            min="-3"
            max="3"
            className="max-w-[70px] h-8"
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
            variant="outline" 
            className="h-8 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            onClick={allTimeAdjust}
          >
            実行
          </Button>
        </div>
      </CustomToolTip>
    </div>
  );
}
