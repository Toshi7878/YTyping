"use client";

import { Box, Input } from "@chakra-ui/react";
import { Dispatch } from "react";
import { extractYouTubeVideoId } from "../../extractYTId";

interface NewCreateVideoIdInputBoxProps {
  createBtnRef: React.RefObject<HTMLButtonElement>; // 修正: 型を追加
  createYTURL: string;
  setCreateYTURL: Dispatch<string>;
  setNewID: Dispatch<string>;
  inputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
}

export default function NewCreateVideoIdInputBox(props: NewCreateVideoIdInputBoxProps) {
  return (
    <Box>
      譜面を作成したいYouTube動画のURLを入力
      <Input
        ref={props.inputRef}
        value={props.createYTURL}
        placeholder="YouTube URLを入力"
        onChange={async (event) => {
          props.setCreateYTURL(event.target.value);
          const videoId = extractYouTubeVideoId(event.target.value);
          props.setNewID(videoId);
          if (videoId) {
            props.onClose();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (props.createBtnRef.current) {
              props.createBtnRef.current.click();
            }
          }
        }}
      />
    </Box>
  );
}
