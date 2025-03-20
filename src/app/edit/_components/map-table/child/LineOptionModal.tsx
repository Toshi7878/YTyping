"use client";

import { MapData } from "@/app/type/ts/type";
import { ThemeColors } from "@/types";
import {
  Badge,
  Box,
  Checkbox,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import { Dispatch, useState } from "react";
import ChangeLineVideoSpeedOption from "./line-option-child/ChangeLineVideoSpeedOption";
import CSSInput from "./line-option-child/CSSInput";
import CSSTextLength from "./line-option-child/CSSTextLength";
import LineOptionModalCloseButton from "./line-option-child/LineOptionModalCloseButton";
import SaveOptionButton from "./line-option-child/SaveOptionButton";

interface LineOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  optionModalIndex: number | null;
  setOptionModalIndex: Dispatch<number | null>;
  lineOptions: MapData["options"] | null;
}

export default function LineOptionModal({
  isOpen,
  onClose,
  optionModalIndex,
  setOptionModalIndex,
  lineOptions,
}: LineOptionModalProps) {
  const [changeCSS, setChangeCSS] = useState(lineOptions?.changeCSS || "");
  const [eternalCSS, setEternalCSS] = useState(lineOptions?.eternalCSS || "");
  const [isEditedCSS, setIsEditedCSS] = useState(false);
  const [changeVideoSpeed, setChangeVideoSpeed] = useState(0);
  const [isChangeCSS, setIsEditChangeCSS] = useState(lineOptions?.isChangeCSS || false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  const theme: ThemeColors = useTheme();
  const handleModalClose = () => {
    if (isEditedCSS) {
      onConfirmOpen();
    } else {
      onClose();
      setOptionModalIndex(null);
    }
  };
  return (
    <Modal isOpen={isOpen} isCentered onClose={handleModalClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent maxW="600px" bg={theme.colors.background.card} color={theme.colors.text.body}>
        <ModalHeader>ラインオプション </ModalHeader>

        <ModalCloseButton onClick={handleModalClose} />
        <ModalBody>
          <Badge colorScheme="teal" fontSize="1em" mb={2}>
            選択ライン: {optionModalIndex}
          </Badge>

          <Stack spacing={2}>
            <ChangeLineVideoSpeedOption
              changeVideoSpeed={changeVideoSpeed}
              setChangeVideoSpeed={setChangeVideoSpeed}
            />
            {optionModalIndex === 0 && (
              <Box>
                <FormLabel>
                  永続的に適用するCSSを入力
                  <CSSInput
                    disabled={false}
                    CSSText={eternalCSS}
                    setCSSText={setEternalCSS}
                    setIsEditedCSS={setIsEditedCSS}
                  />
                </FormLabel>
                <CSSTextLength
                  eternalCSSText={eternalCSS}
                  changeCSSText={changeCSS}
                  lineOptions={lineOptions}
                />
              </Box>
            )}

            <Box>
              <FormLabel display="flex" alignItems="baseline">
                <Checkbox
                  isChecked={isChangeCSS}
                  onChange={(event) => setIsEditChangeCSS(event.target.checked)}
                  mr={1}
                />
                ライン切り替えを有効化
              </FormLabel>
              <FormLabel>
                選択ラインから適用するCSSを入力
                <CSSInput
                  disabled={!isChangeCSS}
                  CSSText={changeCSS}
                  setCSSText={setChangeCSS}
                  setIsEditedCSS={setIsEditedCSS}
                />
              </FormLabel>
              <CSSTextLength
                eternalCSSText={eternalCSS}
                changeCSSText={changeCSS}
                lineOptions={lineOptions}
              />
            </Box>

            <SaveOptionButton
              eternalCSS={eternalCSS}
              changeCSS={changeCSS}
              isEditedCSS={isEditedCSS}
              isChangeCSS={isChangeCSS}
              optionModalIndex={optionModalIndex}
              setOptionModalIndex={setOptionModalIndex}
              onClose={onClose}
              setIsEditedCSS={setIsEditedCSS}
              changeVideoSpeed={changeVideoSpeed}
            />
          </Stack>
        </ModalBody>

        <ModalFooter></ModalFooter>
      </ModalContent>
      <LineOptionModalCloseButton
        onClose={onClose}
        isConfirmOpen={isConfirmOpen}
        onConfirmClose={onConfirmClose}
        setOptionModalIndex={setOptionModalIndex}
      />
    </Modal>
  );
}
