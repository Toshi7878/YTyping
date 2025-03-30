import { useGameUtilsRef } from "../../atoms/refAtoms";

export const useToggleLineList = () => {
  const { readGameUtils } = useGameUtilsRef();
  return () => {
    const { lineResultdrawerClosure: drawerClosure } = readGameUtils();

    if (!drawerClosure) {
      return;
    }

    const { isOpen, onOpen, onClose } = drawerClosure;
    if (!isOpen) {
      onOpen();
    } else {
      onClose();
    }
  };
};
