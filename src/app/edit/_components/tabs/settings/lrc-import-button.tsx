"use client";
import { useImportMapFile } from "@/app/edit/_lib/hooks/import-map-file";
import { Button } from "@/components/ui/button";
import { useGlobalLoadingOverlay } from "@/lib/globalAtoms";
import { useRef } from "react";
import { toast } from "sonner";

export default function LrcImportButton() {
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMapFile = useImportMapFile();
  return (
    <div>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".lrc,.json"
        onChange={async (e) => {
          const file = e.target.files![0];
          try {
            showLoading({ message: "lrcインポート中..." });

            await importMapFile(file);
            toast.success("lrcインポート完了");
          } catch (error) {
            toast.error("lrcエラー", {
              description: "ファイルの処理中にエラーが発生しました。",
            });
          } finally {
            e.target.value = "";
            hideLoading();
          }
        }}
      />

      <Button size="sm" onClick={() => fileInputRef.current?.click()}>
        lrcインポート
      </Button>
    </div>
  );
}
