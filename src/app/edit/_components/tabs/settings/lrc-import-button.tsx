"use client";
import type React from "react";
import { useRef } from "react";
import { toast } from "sonner";
import { importMapFile } from "@/app/edit/_lib/editor/import-map";
import { Button } from "@/components/ui/button";
import { useGlobalLoadingOverlay } from "@/lib/atoms/global-atoms";

export const LrcImportButton = () => {
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showLoading({ message: "lrcインポート中..." });

      await importMapFile(file);
      toast.success("lrcインポート完了");
    } catch {
      toast.error("lrcエラー", {
        description: "ファイルの処理中にエラーが発生しました。",
      });
    } finally {
      e.target.value = "";
      hideLoading();
    }
  };
  return (
    <div>
      <input type="file" hidden ref={fileInputRef} accept=".lrc,.json" onChange={onChange} />

      <Button size="sm" onClick={() => fileInputRef.current?.click()}>
        lrcインポート
      </Button>
    </div>
  );
};
