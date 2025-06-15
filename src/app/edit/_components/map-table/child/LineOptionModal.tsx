"use client";

import { useOpenLineOptionDialogIndexState, useSetOpenLineOptionDialogIndex } from "@/app/edit/atoms/stateAtoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogWithContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapLine } from "@/types/map";
import { Dispatch, useState } from "react";
import { useForm } from "react-hook-form";
import ChangeLineVideoSpeedOption from "./line-option-child/ChangeLineVideoSpeedOption";
import CSSInput from "./line-option-child/CSSInput";
import CSSTextLength from "./line-option-child/CSSTextLength";
import LineOptionModalCloseButton from "./line-option-child/LineOptionModalCloseButton";
import SaveOptionButton from "./line-option-child/SaveOptionButton";

interface LineOptionModalProps {
  optionModalIndex: number | null;
}

export default function LineOptionModal({ optionModalIndex }: LineOptionModalProps) {
  const openLineOptionDialogIndex = useOpenLineOptionDialogIndexState();
  const setOpenLineOptionDialogIndex = useSetOpenLineOptionDialogIndex();

  const form = useForm<NonNullable<MapLine["options"]>>({
    defaultValues: {
      changeCSS: "",
      eternalCSS: "",
      isChangeCSS: false,
      changeVideoSpeed: 0,
    },
  });
  const [isEditedCSS, setIsEditedCSS] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (openLineOptionDialogIndex === null) return null;

  const handleModalClose = () => {
    if (isEditedCSS) {
      setIsConfirmOpen(true);
    } else {
      setOpenLineOptionDialogIndex(null);
    }
  };
  return (
    <>
      <DialogWithContent
        open={openLineOptionDialogIndex !== null}
        onOpenChange={handleModalClose}
        className="bg-card text-foreground max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>ラインオプション</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Badge variant="secondary" className="text-base">
            選択ライン: {optionModalIndex}
          </Badge>

          <div className="space-y-2">
            <ChangeLineVideoSpeedOption changeVideoSpeed={changeVideoSpeed} setChangeVideoSpeed={setChangeVideoSpeed} />
            {optionModalIndex === 0 && (
              <div>
                <Label>
                  永続的に適用するCSSを入力
                  <CSSInput
                    disabled={false}
                    CSSText={eternalCSS}
                    setCSSText={setEternalCSS}
                    setIsEditedCSS={setIsEditedCSS}
                  />
                </Label>
                <CSSTextLength eternalCSSText={eternalCSS} changeCSSText={changeCSS} lineOptions={lineOptions} />
              </div>
            )}

            <div>
              <Label className="flex items-baseline">
                <Checkbox
                  checked={isChangeCSS}
                  onCheckedChange={(checked) => setIsEditChangeCSS(checked as boolean)}
                  className="mr-1"
                />
                ライン切り替えを有効化
              </Label>
              <Label>
                選択ラインから適用するCSSを入力
                <CSSInput
                  disabled={!isChangeCSS}
                  CSSText={changeCSS}
                  setCSSText={setChangeCSS}
                  setIsEditedCSS={setIsEditedCSS}
                />
              </Label>
              <CSSTextLength eternalCSSText={eternalCSS} changeCSSText={changeCSS} lineOptions={lineOptions} />
            </div>

            <SaveOptionButton
              eternalCSS={eternalCSS}
              changeCSS={changeCSS}
              isEditedCSS={isEditedCSS}
              isChangeCSS={isChangeCSS}
              optionModalIndex={optionModalIndex}
              setOptionModalIndex={setOptionModalIndex}
              onClose={onClose}
              setIsEditedCSS={setIsEditedCSS}
              changeVideoSpeed={changeVideoSpeed}
            />
          </div>
        </div>

        <DialogFooter />
      </DialogWithContent>

      <LineOptionModalCloseButton
        onClose={() => setOpenLineOptionDialogIndex(null)}
        isConfirmOpen={isConfirmOpen}
        onConfirmClose={() => setIsConfirmOpen(false)}
        setOpenLineOptionDialogIndex={setOpenLineOptionDialogIndex}
      />
    </>
  );
}

interface LineOptionModalCloseButton {
  onClose: () => void;
  isConfirmOpen: boolean;
  onConfirmClose: () => void;
  setOpenLineOptionDialogIndex: Dispatch<number | null>;
}

function LineOptionModalCloseButton({
  onClose,
  isConfirmOpen,
  onConfirmClose,
  setOpenLineOptionDialogIndex,
}: LineOptionModalCloseButton) {
  const handleConfirmClose = () => {
    onClose();
    onConfirmClose();
    setOpenLineOptionDialogIndex(null);
  };

  return (
    <Dialog open={isConfirmOpen} onOpenChange={onConfirmClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
          <DialogDescription>CSS設定の変更が保存されていません。保存せずに閉じてもよろしいですか？</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onConfirmClose}>
            いいえ
          </Button>
          <Button variant="destructive" onClick={handleConfirmClose}>
            はい
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
