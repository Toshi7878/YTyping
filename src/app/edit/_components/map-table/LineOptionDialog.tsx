"use client";

import { useHistoryReducer } from "@/app/edit/_lib/atoms/historyReducerAtom";
import { useMapReducer, useMapState } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { useCssLengthState, useSetCanUpload } from "@/app/edit/_lib/atoms/stateAtoms";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter";
import { DialogFooter, DialogHeader, DialogTitle, DialogWithContent } from "@/components/ui/dialog";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { SwitchFormField } from "@/components/ui/switch";
import { TextareaFormField } from "@/components/ui/textarea";
import { MapLineEdit } from "@/types/map";
import { lineOptionSchema } from "@/validator/mapDataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface LineOptionDialogProps {
  index: number;
  setOptionDialogIndex: Dispatch<number | null>;
}

export default function LineOptionDialog({ index, setOptionDialogIndex }: LineOptionDialogProps) {
  const map = useMapState();
  const confirm = useConfirm();
  const setCanUpload = useSetCanUpload();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();

  const form = useForm({
    resolver: zodResolver(lineOptionSchema),
    defaultValues: {
      changeCSS: map[index]?.options?.changeCSS || "",
      eternalCSS: map[index]?.options?.eternalCSS || "",
      isChangeCSS: map[index]?.options?.isChangeCSS || false,
      changeVideoSpeed: map[index]?.options?.changeVideoSpeed || 0,
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
      body: "CSS設定の変更が保存されていません。保存せずに閉じてもよろしいですか？",
      cancelButton: "いいえ",
      actionButton: "はい",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning",
    });

    if (isConfirmed) {
      setOptionDialogIndex(null);
    }
  };

  const onSubmit = (data: z.output<typeof lineOptionSchema>) => {
    const { time, lyrics, word } = map[index];

    const newLine = {
      time,
      lyrics,
      word,
      options: {
        ...(data.changeCSS && { changeCSS: data.changeCSS }),
        ...(data.eternalCSS && { eternalCSS: data.eternalCSS }),
        ...(data.isChangeCSS && { isChangeCSS: data.isChangeCSS }),
        ...(data.changeVideoSpeed && { changeVideoSpeed: data.changeVideoSpeed }),
      },
    };
    mapDispatch({ type: "update", payload: newLine, index });

    historyDispatch({
      type: "add",
      payload: {
        actionType: "update",
        data: {
          old: map[index],
          new: newLine,
          lineIndex: index,
        },
      },
    });
    setCanUpload(true);
    setOptionDialogIndex(null);
  };

  const {
    formState: { isDirty },
  } = form;

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
            {/* TODO:現在の速度を表示する 現在の速度から加減上限を制御する */}
            <FormField
              control={form.control}
              name="changeVideoSpeed"
              render={({ field }) => (
                <FormItem>
                  <CounterInput
                    label="速度変更"
                    unit={Number(field.value ?? 0) < 0 ? "速度ダウン" : "速度アップ"}
                    value={field.value ?? 0}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    min={-1.75}
                    max={2}
                    step={0.25}
                    valueDigits={2} // 小数点以下2桁を表示
                  />
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
              className="min-h-[200px] resize-y"
              disabled={!form.watch("isChangeCSS")}
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
}

interface CSSTextLengthProps {
  eternalCSSText: string;
  changeCSSText: string;
  lineOptions: MapLineEdit["options"] | null;
}

function CSSTextLength({ eternalCSSText, changeCSSText, lineOptions }: CSSTextLengthProps) {
  const cssLength = useCssLengthState();

  const loadLineCustomStyleLength =
    Number(lineOptions?.eternalCSS?.length || 0) + Number(lineOptions?.changeCSS?.length || 0);

  const calcAllCustomStyleLength =
    cssLength - loadLineCustomStyleLength + (eternalCSSText.length + changeCSSText.length);
  return (
    <div className={`text-right ${calcAllCustomStyleLength <= 10000 ? "" : "text-destructive"}`}>
      {calcAllCustomStyleLength} / 10000
    </div>
  );
}
