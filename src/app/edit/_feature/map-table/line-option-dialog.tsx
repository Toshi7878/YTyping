"use client";

import { useStore } from "@tanstack/react-form";
import { type Dispatch, useEffect, useState } from "react";
import z from "zod";
import { setRawMapAction, useRawMap } from "@/app/edit/_feature/map-table/map-reducer";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CounterInput } from "@/ui/counter";
import { DialogFooter, DialogHeader, DialogTitle, DialogWithContent } from "@/ui/dialog";
import { Field } from "@/ui/field";
import { useAppForm } from "@/ui/form-field-item";
import { cn } from "@/utils/cn";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { setCanUpload } from "../tabs/info-form/card";
import { dispatchEditHistory } from "./history";

// LineOptionSchema はマップJSON保存用に全フィールドoptionalだが、フォームでは常に値を埋めるためrequired版を使う
const lineOptionFormSchema = z.object({
  changeCSS: z.string(),
  eternalCSS: z.string(),
  isChangeCSS: z.boolean(),
  changeVideoSpeed: z.number().min(-1.75).max(2),
  isCaseSensitive: z.boolean(),
});

const calculateCurrentSpeed = (map: RawMapLine[], index: number) => {
  const speeds = map.map((line) => line.options?.changeVideoSpeed ?? 0);
  const calculatedSpeed = speeds.slice(0, index).reduce((a, b) => a + b, 0) + 1;
  return Math.max(0.25, Math.min(2.0, calculatedSpeed));
};

interface LineOptionDialogProps {
  index: number;
  setOptionDialogIndex: Dispatch<number | null>;
}

export const LineOptionDialog = ({ index, setOptionDialogIndex }: LineOptionDialogProps) => {
  const map = useRawMap();

  const currentSpeed = calculateCurrentSpeed(map, index);

  const [speed, setSpeed] = useState("1.00");

  useEffect(() => {
    const calculatedSpeed = currentSpeed + (map[index]?.options?.changeVideoSpeed ?? 0);
    const clampedSpeed = Math.max(0.25, Math.min(2.0, calculatedSpeed));
    setSpeed(clampedSpeed.toFixed(2));
  }, [currentSpeed, map, index]);

  const form = useAppForm({
    validators: { onChange: lineOptionFormSchema },
    defaultValues: {
      changeCSS: map[index]?.options?.changeCSS || "",
      eternalCSS: map[index]?.options?.eternalCSS || "",
      isChangeCSS: map[index]?.options?.isChangeCSS || false,
      changeVideoSpeed: map[index]?.options?.changeVideoSpeed || 0,
      isCaseSensitive: map[index]?.options?.isCaseSensitive || false,
    },
    onSubmit: ({ value: data }) => {
      const line = map[index];
      if (!line) return;
      const { time, lyrics, word } = line;

      const newLine = {
        time,
        lyrics,
        word,
        options: {
          ...(data.changeCSS && { changeCSS: data.changeCSS }),
          ...(data.eternalCSS && { eternalCSS: data.eternalCSS }),
          ...(data.isChangeCSS && { isChangeCSS: data.isChangeCSS }),
          ...(data.changeVideoSpeed && {
            changeVideoSpeed: Math.max(0.25 - currentSpeed, Math.min(2.0 - currentSpeed, data.changeVideoSpeed)),
          }),
          ...(data.isCaseSensitive && { isCaseSensitive: data.isCaseSensitive }),
        },
      };
      setRawMapAction({ type: "update", payload: newLine, index });

      dispatchEditHistory({
        type: "add",
        payload: {
          actionType: "update",
          data: {
            old: line,
            new: newLine,
            lineIndex: index,
          },
        },
      });
      setCanUpload(true);
      setOptionDialogIndex(null);
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);

  const handleModalClose = async () => {
    if (!isDirty) {
      // エディターのEscapeキーのホットキーと競合するためsetTimeoutで遅延させる
      setTimeout(() => setOptionDialogIndex(null));
      return;
    }

    const isConfirmed = window.confirm(
      "ラインオプションの変更が保存されていません。保存せずに閉じてもよろしいですか？",
    );

    if (isConfirmed) {
      setOptionDialogIndex(null);
    }
  };

  const isChangeCSSValue = useStore(form.store, (state) => state.values.isChangeCSS);

  return (
    <DialogWithContent
      open={index !== null}
      onOpenChange={handleModalClose}
      className="bg-card text-card-foreground"
      disableOutsideClick={true}
    >
      <DialogHeader>
        <DialogTitle>ラインオプション</DialogTitle>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <Badge variant="secondary" className="text-base">
          選択ライン: {index}
        </Badge>

        <div className="space-y-4">
          {index === 0 && (
            <form.AppField name="isCaseSensitive">
              {(field) => <field.SwitchFormField label="この譜面のアルファベット大文字の入力を有効化" />}
            </form.AppField>
          )}

          {/* TODO:現在の速度を表示する 現在の速度から加減上限を制御する */}
          <form.AppField name="changeVideoSpeed">
            {(field) => (
              <Field className="flex items-center">
                <CounterInput
                  label="速度変更"
                  unit={Number(field.state.value ?? 0) < 0 ? "速度ダウン" : "速度アップ"}
                  value={field.state.value ?? 0}
                  onChange={(value) => {
                    field.handleChange(value);
                    setSpeed((currentSpeed + value).toFixed(2));
                  }}
                  min={0.25 - currentSpeed}
                  max={2.0 - currentSpeed}
                  step={0.25}
                  valueDigits={2}
                />
                <div className="text-muted-foreground text-sm">
                  速度: <Badge variant="outline">{speed}x</Badge>
                </div>
              </Field>
            )}
          </form.AppField>

          {index === 0 && (
            <form.AppField name="eternalCSS">
              {(field) => (
                <field.TextareaFormField label="永続的に適用するCSSを入力" className="min-h-[200px] resize-y" />
              )}
            </form.AppField>
          )}

          <form.AppField name="isChangeCSS">
            {(field) => <field.SwitchFormField label="ライン切り替えを有効化" />}
          </form.AppField>

          <form.AppField name="changeCSS">
            {(field) => (
              <field.TextareaFormField
                label="選択ラインから適用するCSSを入力"
                className={cn("min-h-[200px] resize-y", !isChangeCSSValue && "cursor-pointer opacity-50")}
                readOnly={!isChangeCSSValue}
                onClick={() => {
                  if (!isChangeCSSValue) {
                    form.setFieldValue("isChangeCSS", true);
                  }
                }}
              />
            )}
          </form.AppField>

          {/* <CSSTextLength
                eternalCSSText={form.state.values.eternalCSS || ""}
                changeCSSText={field.value || ""}
                lineOptions={form.state.values}
              /> */}

          <Button type="submit">ラインオプションを保存</Button>
        </div>
      </form>

      <DialogFooter />
    </DialogWithContent>
  );
};

// interface CSSTextLengthProps {
//   eternalCSSText: string;
//   changeCSSText: string;
//   lineOptions: MapLineEdit["options"] | null;
// }

// function CSSTextLength({ eternalCSSText, changeCSSText, lineOptions }: CSSTextLengthProps) {
//   const cssLength = useCssLengthState();

//   const loadLineCustomStyleLength =
//     Number(lineOptions?.eternalCSS?.length || 0) + Number(lineOptions?.changeCSS?.length || 0);

//   const calcAllCustomStyleLength =
//     cssLength - loadLineCustomStyleLength + (eternalCSSText.length + changeCSSText.length);
//   return (
//     <div className={`text-right ${calcAllCustomStyleLength <= 10000 ? "" : "text-destructive"}`}>
//       {calcAllCustomStyleLength} / 10000
//     </div>
//   );
// }
