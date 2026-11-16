"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getRawMap, setRawMapAction } from "@/app/edit/_feature/map-table/map-reducer";
import { timeValidate } from "@/app/edit/_feature/tabs/editor/time-validate";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { dispatchEditHistory } from "../../map-table/history";
import { setCanUpload } from "../info-form/card";

export const AllTimeAdjust = () => {
  const t = useTranslations("editorSettings.timeAdjust");
  const [totalAdjustValue, setTotalAdjustValue] = useState("0");

  const allTimeAdjust = () => {
    if (!Number(totalAdjustValue)) {
      return;
    }

    if (Number(totalAdjustValue) !== 0) {
      const map = getRawMap();
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
        payload: { actionType: "replaceAll", data: { old: getRawMap(), new: newMap } },
      });
    }

    toast.success(t("done"), {
      description: t("doneDescription", { value: totalAdjustValue }),
    });
  };

  return (
    <TooltipWrapper label={t("tooltip")} asChild>
      <form className="flex w-fit items-baseline gap-2">
        <Label className="text-sm">{t("label")}</Label>
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
          {t("run")}
        </Button>
      </form>
    </TooltipWrapper>
  );
};
