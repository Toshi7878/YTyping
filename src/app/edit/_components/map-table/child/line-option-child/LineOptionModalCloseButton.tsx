import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch } from "react";

interface LineOptionModalCloseButton {
  onClose: () => void;
  isConfirmOpen: boolean;
  onConfirmClose: () => void;
  setOptionModalIndex: Dispatch<number | null>;
}

export default function LineOptionModalCloseButton({
  onClose,
  isConfirmOpen,
  onConfirmClose,
  setOptionModalIndex,
}: LineOptionModalCloseButton) {
  const handleConfirmClose = () => {
    onClose();
    onConfirmClose();
    setOptionModalIndex(null);
  };

  return (
    <Dialog open={isConfirmOpen} onOpenChange={onConfirmClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
          <DialogDescription>
            CSS設定の変更が保存されていません。保存せずに閉じてもよろしいですか？
          </DialogDescription>
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
