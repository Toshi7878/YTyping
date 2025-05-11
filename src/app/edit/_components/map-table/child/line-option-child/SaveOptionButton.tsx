"use client";
import { useHistoryReducer } from "@/app/edit/atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "@/app/edit/atoms/mapReducerAtom";
import { useSetCanUpload } from "@/app/edit/atoms/stateAtoms";
import { Box, Button } from "@chakra-ui/react";
import { Dispatch } from "react";

interface SaveOptionButtonProps {
  onClose: () => void;
  optionModalIndex: number | null;
  setOptionModalIndex: Dispatch<number | null>;
  changeCSS: string;
  eternalCSS: string;
  isEditedCSS: boolean;
  isChangeCSS: boolean;
  setIsEditedCSS: Dispatch<boolean>;
  changeVideoSpeed: number;
}

export default function SaveOptionButton(props: SaveOptionButtonProps) {
  const { changeCSS, eternalCSS, isChangeCSS, changeVideoSpeed, optionModalIndex, onClose, setIsEditedCSS } = props;
  const setCanUpload = useSetCanUpload();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();
  const readMap = useMapStateRef();
  const handleBtnClick = () => {
    const map = readMap();
    if (!map || optionModalIndex === null) {
      return;
    }

    const { time, lyrics, word } = map[optionModalIndex];

    const newLine = {
      time,
      lyrics,
      word,
      options: {
        ...(changeCSS && { changeCSS }),
        ...(eternalCSS && { eternalCSS }),
        ...(isChangeCSS && { isChangeCSS }),
        ...(changeVideoSpeed && { changeVideoSpeed }),
      },
    };
    mapDispatch({
      type: "update",
      payload: newLine,
      index: optionModalIndex,
    });

    historyDispatch({
      type: "add",
      payload: {
        actionType: "update",
        data: {
          old: map[optionModalIndex],
          new: newLine,
          lineIndex: optionModalIndex,
        },
      },
    });
    setCanUpload(true);
    setIsEditedCSS(false);
    onClose();
    props.setOptionModalIndex(null);
  };

  return (
    <Box display="flex" justifyContent="flex-end">
      <Button colorScheme="teal" onClick={handleBtnClick}>
        ラインオプションを保存
      </Button>
    </Box>
  );
}
