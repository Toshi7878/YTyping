"use client";
import { Button, FormLabel, HStack } from "@chakra-ui/react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/edit/redux/store";
import { ImportFile } from "@/app/edit/ts/tab/settings/importFile";
import { useSetIsLrcConvertingAtom } from "@/app/edit/edit-atom/editAtom";
import { useWordConvert } from "@/app/edit/hooks/useWordConvert";
import { useSuccessToast } from "@/lib/hooks/useSuccessToast";

export default function LrcConvertButton() {
  const dispatch = useDispatch();
  const setIsLrcConverting = useSetIsLrcConvertingAtom();
  const wordConvert = useWordConvert();
  const successToast = useSuccessToast();

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
            e.target.value = "";
            const successState = {
              id: null,
              title: "lrcインポート完了",
              message: "",
              status: 200,
            };
            successToast(successState);
          } catch (error) {
            console.error("ファイルの処理中にエラーが発生しました:", error);
            const errorState = {
              id: null,
              title: "lrcエラー",
              message: "ファイルの処理中にエラーが発生しました。",
              status: 400,
            };
            successToast(errorState);
          } finally {
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
