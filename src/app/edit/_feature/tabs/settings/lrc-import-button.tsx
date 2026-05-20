"use client";
import { useState } from "react";
import { toast } from "sonner";
import { importMapFromTextAutoDetect } from "@/app/edit/_lib/editor/import-map";
import { Button } from "@/ui/button";
import { DialogFooter, DialogHeader, DialogTitle, DialogWithContent } from "@/ui/dialog";
import { FileImportButton } from "@/ui/file-import-button";
import { overlay } from "@/ui/overlay";
import { decodeText } from "@/utils/text-decoder";

export const LrcImportButton = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleFileSelect = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      setText(decodeText(buffer));
    } catch {
      toast.error("ファイル読み込みエラー");
    }
  };

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error("テキストが空です");
      return;
    }
    try {
      setOpen(false);
      overlay.loading("lrcインポート中...");
      await importMapFromTextAutoDetect(text);
      toast.success("lrcインポート完了");
      setText("");
    } catch (e) {
      toast.error("lrcエラー", {
        description: e instanceof Error ? e.message : "ファイルの処理中にエラーが発生しました。",
      });
    } finally {
      overlay.hide();
    }
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setText("");
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        lrcインポート
      </Button>

      <DialogWithContent id="lrc-import-dialog" open={open} onOpenChange={handleClose} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>lrcインポート</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <FileImportButton
            accept=".lrc,.json"
            size="sm"
            variant="outline"
            className="self-start"
            onFileSelect={handleFileSelect}
          >
            lrcファイルから読み込む
          </FileImportButton>

          <textarea
            className="h-64 w-full resize-y rounded-md border bg-background p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={"[00:00.00]歌詞\n[00:05.00]歌詞..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleImport}>確定</Button>
        </DialogFooter>
      </DialogWithContent>
    </>
  );
};
