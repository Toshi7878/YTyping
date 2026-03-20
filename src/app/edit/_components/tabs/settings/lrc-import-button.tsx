"use client";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { importMapFromJsonText, importMapFromLrcText } from "@/app/edit/_lib/editor/import-map";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogWithContent,
} from "@/components/ui/dialog";
import { overlay } from "@/components/ui/overlay";

type FileType = "lrc" | "json";

const detectFileType = (fileName: string): FileType =>
  fileName.endsWith(".json") ? "json" : "lrc";

export const LrcImportButton = () => {
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState<FileType>("lrc");
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setFileType(detectFileType(file.name));
      setText(content);
    } catch {
      toast.error("ファイル読み込みエラー");
    } finally {
      e.target.value = "";
    }
  };

  const handleConfirm = async () => {
    if (!text.trim()) {
      toast.error("テキストが空です");
      return;
    }
    try {
      setOpen(false);
      overlay.loading("lrcインポート中...");
      if (fileType === "lrc") {
        await importMapFromLrcText(text);
      } else {
        importMapFromJsonText(text);
      }
      toast.success("lrcインポート完了");
      setText("");
    } catch {
      toast.error("lrcエラー", {
        description: "ファイルの処理中にエラーが発生しました。",
      });
    } finally {
      overlay.hide();
    }
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setText("");
      setFileType("lrc");
    }
  };

  return (
    <>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".lrc,.json"
        onChange={handleFileChange}
      />

      <Button size="sm" onClick={() => setOpen(true)}>
        lrcインポート
      </Button>

      <DialogWithContent open={open} onOpenChange={handleClose} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>lrcインポート</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button
            size="sm"
            variant="outline"
            className="self-start"
            onClick={() => fileInputRef.current?.click()}
          >
            lrcファイルから読み込む
          </Button>

          <textarea
            className="h-64 w-full resize-y rounded-md border bg-background p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={"[00:00.00]歌詞\n[00:05.00]歌詞..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>確定</Button>
        </DialogFooter>
      </DialogWithContent>
    </>
  );
};
