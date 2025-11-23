"use client";
import { useState } from "react";
import { toast } from "sonner";
import { dispatchEditHistory } from "@/app/edit/_lib/atoms/history-reducer";
import { readRawMap, setRawMapAction } from "@/app/edit/_lib/atoms/map-reducer";
import { setCanUpload } from "@/app/edit/_lib/atoms/state";
import { timeValidate } from "@/app/edit/_lib/editor/time-validate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { TooltipWrapper } from "@/components/ui/tooltip";

export const AllTimeAdjust = () => {
  const [totalAdjustValue, setTotalAdjustValue] = useState("0");

  const allTimeAdjust = () => {
    if (!Number(totalAdjustValue)) {
      return;
    }

    if (Number(totalAdjustValue) !== 0) {
      const map = readRawMap();
      const newMap = map.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            time: "0",
          };
        }
        if (index === map.length - 1) {
          return { ...item, time: item.time };
        }

        const newTime = timeValidate(Number(item.time) + Number(totalAdjustValue));
        return { ...item, time: newTime.toFixed(3) };
      });

      setCanUpload(true);
      setRawMapAction({ type: "replaceAll", payload: [...newMap] });
      dispatchEditHistory({
        type: "add",
        payload: { actionType: "replaceAll", data: { old: readRawMap(), new: newMap } },
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
};
