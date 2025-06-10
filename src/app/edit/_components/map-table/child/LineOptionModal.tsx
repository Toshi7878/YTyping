"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapLineEdit } from "@/types/map";
import { Dispatch, useState } from "react";
import ChangeLineVideoSpeedOption from "./line-option-child/ChangeLineVideoSpeedOption";
import CSSInput from "./line-option-child/CSSInput";
import CSSTextLength from "./line-option-child/CSSTextLength";
import LineOptionModalCloseButton from "./line-option-child/LineOptionModalCloseButton";
import SaveOptionButton from "./line-option-child/SaveOptionButton";

interface LineOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  optionModalIndex: number | null;
  setOptionModalIndex: Dispatch<number | null>;
  lineOptions: MapLineEdit["options"] | null;
}

export default function LineOptionModal({
  isOpen,
  onClose,
  optionModalIndex,
  setOptionModalIndex,
  lineOptions,
}: LineOptionModalProps) {
  const [changeCSS, setChangeCSS] = useState(lineOptions?.changeCSS || "");
  const [eternalCSS, setEternalCSS] = useState(lineOptions?.eternalCSS || "");
  const [isEditedCSS, setIsEditedCSS] = useState(false);
  const [changeVideoSpeed, setChangeVideoSpeed] = useState(0);
  const [isChangeCSS, setIsEditChangeCSS] = useState(lineOptions?.isChangeCSS || false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleModalClose = () => {
    if (isEditedCSS) {
      setIsConfirmOpen(true);
    } else {
      onClose();
      setOptionModalIndex(null);
    }
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-[600px] bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>ラインオプション</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Badge variant="secondary" className="text-base">
              選択ライン: {optionModalIndex}
            </Badge>

            <div className="space-y-2">
              <ChangeLineVideoSpeedOption
                changeVideoSpeed={changeVideoSpeed}
                setChangeVideoSpeed={setChangeVideoSpeed}
              />
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
                  <CSSTextLength
                    eternalCSSText={eternalCSS}
                    changeCSSText={changeCSS}
                    lineOptions={lineOptions}
                  />
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
                <CSSTextLength
                  eternalCSSText={eternalCSS}
                  changeCSSText={changeCSS}
                  lineOptions={lineOptions}
                />
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
        </DialogContent>
      </Dialog>
      
      <LineOptionModalCloseButton
        onClose={onClose}
        isConfirmOpen={isConfirmOpen}
        onConfirmClose={() => setIsConfirmOpen(false)}
        setOptionModalIndex={setOptionModalIndex}
      />
    </>
  );
}
