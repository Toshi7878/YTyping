"use client";
import { useSetIsLrcConvertingState } from "@/app/edit/atoms/stateAtoms";
import { useImportMapFile } from "@/app/edit/hooks/utils/importMapFile";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { Button, HStack } from "@chakra-ui/react";
import { useRef } from "react";

export default function LrcConvertButton() {
  const setIsLrcConverting = useSetIsLrcConvertingState();
  const toast = useCustomToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMapFile = useImportMapFile();
  return (
    <HStack alignItems="baseline">
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".lrc,.json"
        onChange={async (e) => {
          const file = e.target.files![0];
          try {
            setIsLrcConverting(true);

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
            setIsLrcConverting(false);
          }
        }}
      />

      <Button colorScheme="teal" size="sm" onClick={() => fileInputRef.current?.click()}>
        lrcインポート
      </Button>
    </HStack>
  );
}
