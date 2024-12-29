"use client";
import { useSetCanUploadAtom } from "@/app/edit/edit-atom/editAtom";
import { setLineOption } from "@/app/edit/redux/mapDataSlice";
import { Box, Button } from "@chakra-ui/react";
import { Dispatch } from "react";
import { useDispatch } from "react-redux";

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
  const {
    changeCSS,
    eternalCSS,
    isChangeCSS,
    changeVideoSpeed,
    optionModalIndex,
    onClose,
    setIsEditedCSS,
  } = props;
  const dispatch = useDispatch();
  const setCanUpload = useSetCanUploadAtom();

  const handleBtnClick = () => {
    dispatch(
      setLineOption({
        options: {
          ...(changeCSS && { changeCSS }),
          ...(eternalCSS && { eternalCSS }),
          ...(isChangeCSS && { isChangeCSS }),
          ...(changeVideoSpeed && { changeVideoSpeed }),
        },
        number: optionModalIndex,
      }),
    );
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
