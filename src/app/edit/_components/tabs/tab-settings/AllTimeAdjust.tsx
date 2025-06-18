"use client";
import { useHistoryReducer } from "@/app/edit/_lib/atoms/historyReducerAtom";
import { useMapReducer, useReadMap } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { useSetCanUpload } from "@/app/edit/_lib/atoms/stateAtoms";
import useTimeValidate from "@/app/edit/_lib/hooks/useTimeValidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";

export default function AllTimeAdjust() {
  const setCanUpload = useSetCanUpload();
  const [totalAdjustValue, setTotalAdjustValue] = useState<string>("0");
  const readMap = useReadMap();
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const timeValidate = useTimeValidate();

  const allTimeAdjust = () => {
    if (!totalAdjustValue) {
      return;
    }

    if (Number(totalAdjustValue) !== 0) {
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
    }

    toast.success("タイムを調整しました", {
      description: `全体のタイムが ${totalAdjustValue} 秒調整されました。Ctrl + Zで前のタイムに戻ることができます。`,
    });
  };

  return (
    <TooltipWrapper label={<div>数値を入力後、実行ボタンを押すと、全体のタイムが数値分増減します</div>}>
      <form className="flex w-fit items-baseline gap-2">
        <Label className="text-sm">全体タイム調整</Label>
        <Input
          type="number"
          step="0.05"
          min="-3"
          max="3"
          className="h-8 max-w-20"
          value={totalAdjustValue}
          onChange={(e) => setTotalAdjustValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              allTimeAdjust();
            }
          }}
        />

        <Button variant="outline-warning" type="button" onClick={allTimeAdjust} className="font-bold">
          実行
        </Button>
      </form>
    </TooltipWrapper>
  );
}
