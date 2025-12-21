"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Dispatch, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { setRawMapAction, useRawMapState } from "@/app/edit/_lib/atoms/map-reducer";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter";
import { DialogFooter, DialogHeader, DialogTitle, DialogWithContent } from "@/components/ui/dialog";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { SwitchFormField } from "@/components/ui/switch";
import { TextareaFormField } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RawMapLine } from "@/validator/raw-map-json";
import { LineOptionSchema } from "@/validator/raw-map-json";
import { dispatchEditHistory } from "../../_lib/atoms/history-reducer";
import { setCanUpload } from "../../_lib/atoms/state";

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
  const map = useRawMapState();
  const confirm = useConfirm();

  const currentSpeed = calculateCurrentSpeed(map, index);

  const [speed, setSpeed] = useState("1.00");

  useEffect(() => {
    const calculatedSpeed = currentSpeed + (map[index]?.options?.changeVideoSpeed ?? 0);
    const clampedSpeed = Math.max(0.25, Math.min(2.0, calculatedSpeed));
    setSpeed(clampedSpeed.toFixed(2));
  }, [currentSpeed, map, index]);

  const form = useForm({
    resolver: zodResolver(LineOptionSchema),
    defaultValues: {
      changeCSS: map[index]?.options?.changeCSS || "",
      eternalCSS: map[index]?.options?.eternalCSS || "",
      isChangeCSS: map[index]?.options?.isChangeCSS || false,
      changeVideoSpeed: map[index]?.options?.changeVideoSpeed || 0,
      isCaseSensitive: map[index]?.options?.isCaseSensitive || false,
    },
  });

  const handleModalClose = async () => {
    if (!isDirty) {
      // エディターのEscapeキーのホットキーと競合するためsetTimeoutで遅延させる
      setTimeout(() => setOptionDialogIndex(null));
      return;
    }

    const isConfirmed = await confirm({
      title: "確認",
      body: "ラインオプションの変更が保存されていません。保存せずに閉じてもよろしいですか？",
      cancelButton: "いいえ",
      actionButton: "はい",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning",
    });

    if (isConfirmed) {
      setOptionDialogIndex(null);
    }
  };

  const onSubmit = (data: z.output<typeof LineOptionSchema>) => {
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
  };

  const {
    watch,
    setValue,
    formState: { isDirty },
  } = form;
  const isChangeCSSValue = watch("isChangeCSS");

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Badge variant="secondary" className="text-base">
            選択ライン: {index}
          </Badge>

          <div className="space-y-4">
            {index === 0 && (
              <SwitchFormField name="isCaseSensitive" label="この譜面のアルファベット大文字の入力を有効化" />
            )}

            {/* TODO:現在の速度を表示する 現在の速度から加減上限を制御する */}
            <FormField
              control={form.control}
              name="changeVideoSpeed"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <CounterInput
                    label="速度変更"
                    unit={Number(field.value ?? 0) < 0 ? "速度ダウン" : "速度アップ"}
                    value={field.value ?? 0}
                    onChange={(value) => {
                      field.onChange(value);
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
                </FormItem>
              )}
            />

            {index === 0 && (
              <TextareaFormField
                name="eternalCSS"
                label="永続的に適用するCSSを入力"
                className="min-h-[200px] resize-y"
              />
            )}

            <SwitchFormField name="isChangeCSS" label="ライン切り替えを有効化" />

            <TextareaFormField
              name="changeCSS"
              label="選択ラインから適用するCSSを入力"
              className={cn("min-h-[200px] resize-y", !isChangeCSSValue && "cursor-pointer opacity-50")}
              readOnly={!isChangeCSSValue}
              onClick={() => {
                if (!isChangeCSSValue) {
                  setValue("isChangeCSS", true);
                }
              }}
            />

            {/* <CSSTextLength
                  eternalCSSText={form.watch("eternalCSS") || ""}
                  changeCSSText={field.value || ""}
                  lineOptions={form.getValues()}
                /> */}

            <Button type="submit">ラインオプションを保存</Button>
          </div>
        </form>
      </Form>

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
