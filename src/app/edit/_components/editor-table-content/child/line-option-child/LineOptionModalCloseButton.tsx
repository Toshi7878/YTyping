import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Dispatch } from "react";

interface LineOptionModalCloseButton {
  onClose: () => void;
  isConfirmOpen: boolean;
  onConfirmClose: () => void;
  setOptionModalIndex: Dispatch<number | null>;
}

export default function LineOptionModalCloseButton({
  onClose,
  isConfirmOpen,
  onConfirmClose,
  setOptionModalIndex,
}: LineOptionModalCloseButton) {
  const handleConfirmClose = () => {
    onClose();
    onConfirmClose();
    setOptionModalIndex(null);
  };

  return (
    <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>確認</ModalHeader>
        <ModalCloseButton />
        <ModalBody>CSS設定の変更が保存されていません。保存せずに閉じてもよろしいですか？</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onConfirmClose} mr={3}>
            いいえ
          </Button>
          <Button colorScheme="red" mr={3} onClick={handleConfirmClose}>
            はい
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
