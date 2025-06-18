"use client";
import { useLoadingOverlay } from "@/app/edit/_lib/atoms/stateAtoms";
import { useImportMapFile } from "@/app/edit/_lib/hooks/importMapFile";
import { Button } from "@/components/ui/button";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useRef } from "react";

export default function LrcConvertButton() {
  const { showLoadingOverlay, hideLoadingOverlay } = useLoadingOverlay();
  const toast = useCustomToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMapFile = useImportMapFile();
  return (
    <div className="flex items-baseline">
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".lrc,.json"
        onChange={async (e) => {
          const file = e.target.files![0];
          try {
            showLoadingOverlay();

            await importMapFile(file);
            toast({ type: "success", title: "lrcインポート完了" });
          } catch (error) {
            toast({
              type: "error",
              title: "lrcエラー",
              message: "ファイルの処理中にエラーが発生しました。",
            });
          } finally {
            e.target.value = "";
            hideLoadingOverlay();
          }
        }}
      />

      <Button size="sm" onClick={() => fileInputRef.current?.click()}>
        lrcインポート
      </Button>
    </div>
  );
}
