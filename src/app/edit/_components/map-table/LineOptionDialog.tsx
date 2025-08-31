"use client";

import { useHistoryReducer } from "@/app/edit/_lib/atoms/historyReducerAtom";
import { useMapReducer, useMapState, useReadMap } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { useSetCanUpload } from "@/app/edit/_lib/atoms/stateAtoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogWithContent,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { SwitchFormField } from "@/components/ui/switch";
import { TextareaFormField } from "@/components/ui/textarea";
import { MapLine } from "@/types/map";
import { Dispatch, useState } from "react";
import { useForm } from "react-hook-form";
import ChangeLineVideoSpeedOption from "./line-option/ChangeLineVideoSpeedOption";

interface LineOptionDialogProps {
  index: number;
  setOptionDialogIndex: Dispatch<number | null>;
}

export default function LineOptionDialog({ index, setOptionDialogIndex }: LineOptionDialogProps) {
  const map = useMapState();

  const form = useForm<NonNullable<MapLine["options"]>>({
    defaultValues: {
      changeCSS: map[index]?.options?.changeCSS || "",
      eternalCSS: map[index]?.options?.eternalCSS || "",
      isChangeCSS: map[index]?.options?.isChangeCSS || false,
      changeVideoSpeed: map[index]?.options?.changeVideoSpeed || 0,
    },
  });
  const [isEditedCSS, setIsEditedCSS] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleModalClose = () => {
    if (isEditedCSS) {
      setIsConfirmOpen(true);
    } else {
      setOptionDialogIndex(null);
    }
  };
  return (
    <>
      <DialogWithContent open={index !== null} onOpenChange={handleModalClose} className="bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>ラインオプション</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <Badge variant="secondary" className="text-base">
              選択ライン: {index}
            </Badge>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="changeVideoSpeed"
                render={({ field }) => (
                  <FormItem>
                    <ChangeLineVideoSpeedOption
                      changeVideoSpeed={field.value || 0}
                      setChangeVideoSpeed={field.onChange}
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

              <SaveOptionButton
                eternalCSS={form.watch("eternalCSS") || ""}
                changeCSS={form.watch("changeCSS") || ""}
                isEditedCSS={isEditedCSS}
                isChangeCSS={form.watch("isChangeCSS") || false}
                optionModalIndex={index}
                setOptionModalIndex={setOptionDialogIndex}
                onClose={() => setOptionDialogIndex(null)}
                setIsEditedCSS={setIsEditedCSS}
                changeVideoSpeed={form.watch("changeVideoSpeed") || 0}
              />
            </div>
          </form>
        </Form>

        <DialogFooter />
      </DialogWithContent>
      <ConfirmDialog
        isConfirmOpen={isConfirmOpen}
        setIsConfirmOpen={setIsConfirmOpen}
        setOptionDialogIndex={setOptionDialogIndex}
      />
    </>
  );
}

interface ConfirmDialogProps {
  isConfirmOpen: boolean;
  setIsConfirmOpen: Dispatch<boolean>;
  setOptionDialogIndex: Dispatch<number | null>;
}

const ConfirmDialog = ({ isConfirmOpen, setIsConfirmOpen, setOptionDialogIndex }: ConfirmDialogProps) => {
  return (
    <Dialog open={isConfirmOpen} onOpenChange={() => setIsConfirmOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
          <DialogDescription>CSS設定の変更が保存されていません。保存せずに閉じてもよろしいですか？</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
            いいえ
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setOptionDialogIndex(null);
              setIsConfirmOpen(false);
            }}
          >
            はい
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SaveOptionButtonProps {
  onClose: () => void;
  optionModalIndex: number | null;
  setOptionModalIndex: Dispatch<number | null>;
  changeCSS: string;
  eternalCSS: string;
  isEditedCSS: boolean;
  isChangeCSS: boolean;
  setIsEditedCSS: Dispatch<boolean>;
  changeVideoSpeed: number;
}

function SaveOptionButton(props: SaveOptionButtonProps) {
  const { changeCSS, eternalCSS, isChangeCSS, changeVideoSpeed, optionModalIndex, onClose, setIsEditedCSS } = props;
  const setCanUpload = useSetCanUpload();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();
  const readMap = useReadMap();
  const handleBtnClick = () => {
    const map = readMap();
    if (!map || optionModalIndex === null) {
      return;
    }

    const { time, lyrics, word } = map[optionModalIndex];

    const newLine = {
      time,
      lyrics,
      word,
      options: {
        ...(changeCSS && { changeCSS }),
        ...(eternalCSS && { eternalCSS }),
        ...(isChangeCSS && { isChangeCSS }),
        ...(changeVideoSpeed && { changeVideoSpeed }),
      },
    };
    mapDispatch({
      type: "update",
      payload: newLine,
      index: optionModalIndex,
    });

    historyDispatch({
      type: "add",
      payload: {
        actionType: "update",
        data: {
          old: map[optionModalIndex],
          new: newLine,
          lineIndex: optionModalIndex,
        },
      },
    });
    setCanUpload(true);
    setIsEditedCSS(false);
    onClose();
    props.setOptionModalIndex(null);
  };

  return (
    <div className="flex justify-end">
      <Button onClick={handleBtnClick}>ラインオプションを保存</Button>
    </div>
  );
}
