"use client";
import { useSetIsLrcConvertingState } from "@/app/edit/atoms/stateAtoms";
import { useWordConverter } from "@/app/edit/hooks/useWordConverter";
import { RootState } from "@/app/edit/redux/store";
import { ImportFile } from "@/app/edit/ts/tab/settings/importFile";
import { useCustomToast } from "@/lib/global-hooks/useCustomToast";
import { Button, HStack } from "@chakra-ui/react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LrcConvertButton() {
  const dispatch = useDispatch();
  const setIsLrcConverting = useSetIsLrcConvertingState();
  const wordConvert = useWordConverter();
  const toast = useCustomToast();

  const mapData = useSelector((state: RootState) => state.mapData!.value);
  const fileInputRef = useRef<HTMLInputElement>(null); // useRefを使用してfileInputRefを定義

  return (
    <HStack alignItems="baseline">
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".lrc,.json" // lrcファイルとjsonファイルのみを許可)
        onChange={async (e) => {
          const file = e.target.files![0];
          try {
            setIsLrcConverting(true);

            const importFile = new ImportFile();
            await importFile.open(file, wordConvert, dispatch, mapData);
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
